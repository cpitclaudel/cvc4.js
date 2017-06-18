/* exported makeCVC4Demo */
function makeCVC4Demo(window, queries, responses, examples, ace) {
    var editor;
    var worker;
    var verification_start;

    var console = window.console;
    var document = window.document;
    var command_line_args = document.getElementById("command-line-args");
    var run_button = document.getElementById("run");
    var stdout_textbox = document.getElementById("stdout");
    var examples_node = document.getElementById("examples");

    function postCVC4Message(query, payload) {
        console.info("[Window] → CVC4 (" + query + "):", payload);
        worker.postMessage({ kind: query, payload: payload });
    }

    function clear(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    }

    function disableButton(message) {
        run_button.disabled = true;
        run_button.value = message;
    }

    function enableButton() {
        run_button.disabled = false;
        run_button.value = "Run CVC4!";
    }

    function verifyCurrentInput(_event) {
        var input = editor.getValue();
        var args = command_line_args.value.split(/ +/);
        clear(stdout_textbox);
        disableButton("Running…");
        verification_start = window.performance.now();
        postCVC4Message(queries.VERIFY, { args: args, input: input });
    }

    function logOutput(message) {
        var text_node = window.document.createTextNode(message + "\n");
        stdout_textbox.appendChild(text_node);
    }

    function onCVC4Message(event) {
        console.info("CVC4 → [Window]:", event);
        var kind = event.data.kind;
        var payload = event.data.payload;
        switch (kind) {
        case responses.PROGRESS:
            disableButton(payload);
            break;
        case responses.READY:
            enableButton();
            break;
        case responses.STDOUT:
        case responses.STDERR:
            logOutput(payload)
            break;
        case responses.VERIFICATION_COMPLETE:
            enableButton();
            var elapsed = Math.round(window.performance.now() - verification_start);
            logOutput ("-- Verification complete (" + elapsed + "ms)");
            break;
        }
    }

    function setupCVC4Worker() {
        worker = new window.Worker("worker.js");
        worker.onmessage = onCVC4Message;
    }

    function setupAceEditor() {
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/lisp");
        editor.setOptions({ fontFamily: "Ubuntu Mono, monospace", fontSize: "1rem" });
    }

    function loadExample() {
        editor.setValue(this.example, -1);
    }

    function addExamples() {
        clear(examples_node);
        for (var example_name in examples) {
            var example = examples[example_name].join("\n");
            var link = document.createElement("span");
            link.className = "example-link";
            link.appendChild(document.createTextNode(example_name));
            link.example = example;
            link.onclick = loadExample;
            examples_node.appendChild(link);
            examples_node.appendChild(document.createTextNode (" • "));
        }
        examples_node.removeChild(examples_node.lastChild);
    }

    function init() {
        addExamples();
        setupAceEditor();
        setupCVC4Worker();
        clear(stdout_textbox);
        run_button.onclick = verifyCurrentInput;
    }

    return { init: init };
}
