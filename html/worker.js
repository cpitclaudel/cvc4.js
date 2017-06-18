function makeWorker(self, console, queries, responses, performance) {
    var INPUT_FNAME = "input.smt";

    var cvc4;
    var ready = false;

    function postMessage(kind, payload) {
        console.info("[CVC4] → Window (" + kind + "):", payload);
        self.postMessage({ kind: kind, payload: payload });
    }

    function runCVC4(input, args) {
        if (!ready) {
            console.error("Cannot run CVC4 yet.");
            postMessage(responses.DONE, false);
            return;
        }

        args.push(INPUT_FNAME);
        console.log("Running CVC4 with", args);
        cvc4.FS.writeFile(INPUT_FNAME, input, { encoding: "utf8" });
        cvc4.callMain(args);
        postMessage(responses.VERIFICATION_COMPLETE, true);
    }

    function progress(message) {
        postMessage(responses.PROGRESS, message);
        console.info("Worker:", message, performance.now());
    }

    function onRuntimeInitialized() {
        ready = true;
        progress("Done initializing CVC4.");
        postMessage(responses.READY);
    }

    function loadCVC4() {
        progress("Downloading CVC4…");
        self.importScripts("cvc4-outlined-10k.debug.js");
        progress("Initializing CVC4…");
        cvc4 = CVC4({ ENVIRONMENT: "WORKER",
                      onRuntimeInitialized: onRuntimeInitialized,
                      print: function(message) { postMessage(responses.STDOUT, message); },
                      printErr: function(message) { postMessage(responses.STDERR, message); } });
    }

    function onMessage(event) {
        console.info("Window → [CVC4]:", event);
        var kind = event.data.kind;
        var payload = event.data.payload;
        switch (kind) {
        case queries.VERIFY:
            runCVC4(payload.input, payload.args);
            break;
        }
    }

    function init() {
        loadCVC4();
        self.onmessage = onMessage;
    }

    return { init: init };
}

importScripts("protocol.js");
makeWorker(self, console, queries, responses, performance).init();
