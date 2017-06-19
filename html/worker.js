function makeWorker(self, console, queries, responses, performance) {
    var INPUT_FNAME = "input.smt";

    var solver;
    var ready = false;

    function postMessage(kind, payload) {
        console.info("[SMT] → Window (" + kind + "):", payload);
        self.postMessage({ kind: kind, payload: payload });
    }

    function runSolver(input, args) {
        if (!ready) {
            console.error("Cannot run SMT solver yet.");
            postMessage(responses.DONE, false);
            return;
        }

        args.push(INPUT_FNAME);
        console.log("Running SMT solver with", args);
        solver.FS.writeFile(INPUT_FNAME, input, { encoding: "utf8" });
        solver.callMain(args);
        postMessage(responses.VERIFICATION_COMPLETE, true);
    }

    function progress(message) {
        postMessage(responses.PROGRESS, message);
        console.info("Worker:", message, performance.now());
    }

    function onRuntimeInitialized() {
        ready = true;
        progress("Done initializing SMT solver.");
        postMessage(responses.READY);
    }

    function loadSolver() {
        progress("Downloading SMT solver…");
        self.importScripts("cvc4-outlined-200k.wasm.js");
        progress("Initializing SMT solver…");
        var factory = (typeof Z3 === 'undefined') ? CVC4 : Z3;
        solver = factory({ ENVIRONMENT: "WORKER",
                           onRuntimeInitialized: onRuntimeInitialized,
                           print: function(message) { postMessage(responses.STDOUT, message); },
                           printErr: function(message) { postMessage(responses.STDERR, message); } });
    }

    function onMessage(event) {
        console.info("Window → [SMT]:", event);
        var kind = event.data.kind;
        var payload = event.data.payload;
        switch (kind) {
        case queries.VERIFY:
            runSolver(payload.input, payload.args);
            break;
        }
    }

    function init() {
        loadSolver();
        self.onmessage = onMessage;
    }

    return { init: init };
}

importScripts("protocol.js");
makeWorker(self, console, queries, responses, performance).init();
