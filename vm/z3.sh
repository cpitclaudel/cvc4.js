
cd "$Z3_ROOT"

echo '* Z3: configure'; {
    emconfigure python scripts/mk_make.py --staticlib --staticbin --noomp --x86
} >> "$LOGFILE" 2>&1

echo '* Z3: make'; {
    emmake make -C build -j4
} >> "$LOGFILE" 2>&1

echo '* Z3: Linking javascript'; {
    cp build/z3 z3.bc
    emcc "${EMCC_OPTIONS[@]}" -O${OPTLEVEL} "${EMCC_JS_INPUTS[@]}" -o z3.js
    emcc "${EMCC_OPTIONS[@]}" -O${OPTLEVEL} "${EMCC_JS_INPUTS[@]}" -s WASM=1 -s BINARYEN_ASYNC_COMPILATION=0 -o z3-wasm.js
} >> "$LOGFILE" 2>&1
