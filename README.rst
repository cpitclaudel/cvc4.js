=========
 CVC4.js
=========

An asm.js/WebAssembly build of the `CVC4 <cvc4.cs.stanford.edu/>`_ SMT solver.  Try it at https://people.csail.mit.edu/cpitcla/cvc4.js/cvc4.html (Javascript/asm.js) and https://people.csail.mit.edu/cpitcla/cvc4.wasm/cvc4.html (WebAssembly).

Building
========

Install Vagrant, then clone this repo and run ``vagrant up`` in the ``vm/`` directory.  This will create a ``cvc4-js`` folder, and a ``cvc4.js`` file in the ``CVC4`` subfolder.  The script shows high-level steps; more detailed output is redirected to ``provision.log``.  Building takes roughly 5 hours on the first build (3 hours to compile Clang, 1 hour to compile CVC4 and its dependencies, and 1 hour to transpile).  For subsequent builds, you can use ``vagrant ssh`` to log into the VM and run individual commands.

Running
=======

See the demo in the ``html`` folder.

Notes
=====

Running the test suite
----------------------

.. code:: bash

   cd /vagrant/cvc4-js/CVC4/builds/i686-pc-linux-gnu/production-staticbinary-nodebugsymbols-noassertions-notracing/
   # Back up the LLVM bitcode
   mv src/main/cvc4{,.native}
   # Replace `cvc4` with a node.js wrapper
   ln -s /vagrant/run-cvc4.js src/main/cvc4
   # Make sure that `make` doesn't rebuild `cvc4`
   touch src/main/cvc4
   # Run the tests
   make test

Pitfalls
--------

- Installing ``emsdk`` builds clang; passing the ``--build=Release`` ensures that the build doesn't run out of memory.

- ``emcc`` is pretty stack-heavy — it needs ``ulimit -s unlimited``.  Since it's a node program, ``~/.emscripten`` also needs to be edited to call node with the appropriate ``--stack-size``.

- GMP doesn't build cleanly on a 64-bits host (it produces a bunch of warnings).  To cross-compile you need to build the ``gen-*`` programs on their own first (the GMP build process uses C++ programs to generate some of the sources), then recompile with ``emmake``.  GMP also uses ``regparm``, which fails on x64, though using ``-fPIC`` disables that.  That's why we build in a 32-bits VM.

- CVC4 depends on boost.  Since boost is header-only that shouldn't be a problem, but when boost gets auto-included it also pulls in all the other system libraries, and everything breaks.  See http://vclf.blogspot.com/2014/08/emscripten-linking-to-boost-libraries.html.  The workaround is to symlink the boost folder into an otherwise empty directory and `-L` that instead.

- CVC4 uses sigaltstack, which isn't supported in emscripten.  Solved by https://github.com/CVC4/CVC4/pull/172.

- CVC4 needs a bunch of specific ``emcc`` flags to run properly. See ``vm/provision.sh``.

  + ``OUTLINING_LIMIT``: The problem is that the option parsing routine in CVC4 is huge (53MB of bitcode), which crashes the Javascript/WASM parsers of both Chromium and Firefox.  Emscripten can split (“outline”) these, but the threshold needs to be chosen carefully: if it's too low, ``emcc`` starts outlining other functions, including a few large recursive ones in CVC4's SMT parser, which causes stack overflows at run time; but if it's too high, loading compiled programs takes forever or causes stack overflows in the parser.

  + ``BINARYEN_ASYNC_COMPILATION``: Async compilation of the WebAssembly code causes Firefox to infloop, repeatedly printing “still waiting on run dependencies: dependency: wasm-instantiate”.

  + ``NO_EXIT_RUNTIME``: Exiting the runtime after the first execution causes “Invalid function pointer called with signature 'vi'.” on subsequent runs.

- There is a bug in the latest release of emscripten (fixed in ``incoming``) that makes it impossible to run the test suite in Node (https://github.com/kripken/emscripten/pull/5239), but the ``incoming`` branch has another bug (https://github.com/kripken/emscripten/issues/5323) that makes it unusable without edits to the asm.js output.
