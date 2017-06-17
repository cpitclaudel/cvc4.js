/* exported makeCVC4Demo */
function makeCVC4Demo(console, window, document, performance, examples, ace, emscripten) {
    var INPUT_FNAME = "input.smt";

    var runtime_ready = false;
    var editor = ace.edit("editor");

    var command_line_args = document.getElementById("command-line-args");
    var run_button = document.getElementById("run");
    var stdout_textbox = document.getElementById("stdout");
    var examples_node = document.getElementById("examples");

    function setupAceEditor() {
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/lisp");
        editor.setOptions({ fontFamily: "Ubuntu Mono, monospace", fontSize: "1rem" });
    }

    function runCVC4(input, args) {
        if (!runtime_ready) {
            console.error("Cannot run CVC4 yet.");
            return;
        }

        args.push(INPUT_FNAME);
        console.log("Running CVC4 with", args);
        emscripten.FS.writeFile(INPUT_FNAME, input, { encoding: "utf8" });

        var start = performance.now();
        emscripten.callMain(args);
        var end = performance.now();
        receiveOutput("-- Verification took " + Math.round(end - start) + "ms");
    }

    function receiveOutput(text) {
        // stdout_textbox.value += text + "\n";
        var text_node = document.createTextNode(text + "\n");
        stdout_textbox.appendChild(text_node);
        stdout_textbox.appendChild(text_node);
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
        var code = editor.getValue();
        var args = command_line_args.value.split(/ +/);
        disableButton("Running…");
        clear(stdout_textbox);
        window.setTimeout(function() { runCVC4(code, args); enableButton(); }, 0);
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

    function onRuntimeInitialized() {
        runtime_ready = true;
        console.info("Done initializing CVC4.", performance.now());
        enableButton();
    }

    function init() {
        clear(stdout_textbox);
        addExamples();
        setupAceEditor();
        emscripten.onRuntimeInitialized = onRuntimeInitialized;
        emscripten.print = receiveOutput;
        emscripten.printErr = receiveOutput;
        run_button.onclick = verifyCurrentInput;
    }

    return { init: init,
             disableButton: disableButton };
}
