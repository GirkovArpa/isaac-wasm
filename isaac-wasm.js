'use strict';

import WasmLoader from './wasmLoader.js';
import str2ints from './string2integers.js';

export default class IsaacWasm {

  #wasmLoader = new WasmLoader();
  #wasm;

  #seed;
  #memory;
  #results;

  #ints;
  #floats;

  #seedPointer = 0;
  #memoryPointer;
  #resultsPointer;

  #outputPointer;

  async init() {
    this.#wasm = await this.#wasmLoader.loadWasm('isaac.wasm');
    const { buffer } = this.#wasm.memory;
    const { byteLength } = buffer;

    this.#seed = new Int32Array(buffer, this.#seedPointer, 256);

    this.#memoryPointer = this.#seed.BYTES_PER_ELEMENT * this.#seed.length;
    this.#memory = new Int32Array(buffer, this.#memoryPointer, 256);

    this.#resultsPointer = this.#memoryPointer + (this.#memory.BYTES_PER_ELEMENT * this.#memory.length);
    this.#results = new Int32Array(buffer, this.#resultsPointer, 256);

    this.#outputPointer = this.#resultsPointer + (this.#results.BYTES_PER_ELEMENT * this.#results.length);

    const remainingBytes = byteLength - this.#outputPointer;

    this.#ints = new Int32Array(buffer, this.#outputPointer, remainingBytes / Int32Array.BYTES_PER_ELEMENT);
    this.#floats = new Float64Array(buffer, this.#outputPointer, remainingBytes / Float64Array.BYTES_PER_ELEMENT);
  }

  internals() {
    return {
      wasm: this.#wasm,
      seed: this.#seed,
      memory: this.#memory,
      results: this.#results,
      ints: this.#ints,
      floats: this.#floats,
      seedPointer: this.#seedPointer,
      memoryPointer: this.#memoryPointer,
      resultsPointer: this.#resultsPointer,
      outputPointer: this.#outputPointer,
    };
  }

  seed(s) {
    if (typeof s == 'string') {
      s = str2ints(s);
    }
    if (typeof s == 'number') {
      s = [s];
    }
    for (let i = 0; i < s.length; i++) {
      this.#seed[i] = s[i];
    }
    this.#wasm.functions.seed(this.#resultsPointer, this.#memoryPointer, this.#seedPointer);
  }

  prng(runs) {
    this.#wasm.functions.shuffle(this.#resultsPointer, this.#memoryPointer, runs);
  }

  rand(count) {
    if (!count) {
      return this.#wasm.functions.randomInt(this.#resultsPointer, this.#memoryPointer);
    } else {
      this.#wasm.functions.randomInts(this.#resultsPointer, this.#memoryPointer, this.#outputPointer, count);
      return this.#ints.slice(0, count);
    }
  }

  random(count) {
    if (!count) {
      return this.#wasm.functions.randomFloat(this.#resultsPointer, this.#memoryPointer);
    } else {
      this.#wasm.functions.randomFloats(this.#resultsPointer, this.#memoryPointer, this.#outputPointer, count);
      return this.#floats.slice(0, count);
    }
  }
}