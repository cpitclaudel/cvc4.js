upload:
	rsync -rv --no-group --no-owner html/ csail:~/public_html/cvc4.wasm/

upload-broken:
	rsync -rv --no-group --no-owner minimal/ csail:~/public_html/emscripten-recursion/

serve:
	cd html; python3 -m http.server
