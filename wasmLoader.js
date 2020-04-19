/** emcc
* -Os
* -s STANDALONE_WASM
* -s INITIAL_MEMORY=1024mb
* -s TOTAL_MEMORY=1024mb
* -s TOTAL_STACK=512mb
* -s EXPORTED_FUNCTIONS="['_myFunction1,' '_myFunction2']"
* -Wl,--no-entry
* "filename.cpp"
* - o
* "filename.wasm"
*/
'use strict';

export default class WasmLoader {
  async fetchWasm(filename) {
    const response = await fetch(filename);
    const file = await response.arrayBuffer();
    return file;
  }
  async loadWasm(filename) {
    const file = await this.fetchWasm(filename);
    const wasm = await WebAssembly.instantiate(file);
    const { memory, ...functions } = wasm.instance.exports;
    return { memory, functions };
  }
}