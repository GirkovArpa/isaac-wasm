'use strict';

const IsaacWASM = async function () {
  const memory = new WebAssembly.Memory({
    initial: 32767,
    maximum: 65536
  });
  const imports = {
    env: {
      memory: memory
    }
  };
  const response = await fetch('isaac.wasm');
  const buffer = await response.arrayBuffer();
  const wasmInstance = await WebAssembly.instantiate(buffer, imports);
  const m_ptr = 0;
  const r_ptr = 1024;
  const s_ptr = 2048;
  const outputRand_ptr = 3072;
  const outputRandom_ptr = 3072 + (8 * 1_000_000);
  const _m = new Int32Array(wasmInstance.instance.exports.memory.buffer, m_ptr, 256);
  const _r = new Int32Array(wasmInstance.instance.exports.memory.buffer, r_ptr, 256);
  const _s = new Int32Array(wasmInstance.instance.exports.memory.buffer, s_ptr, 256);
  const outputRand = new Int32Array(wasmInstance.instance.exports.memory.buffer, outputRand_ptr, 1_000_000);
  const outputRandom = new Float64Array(wasmInstance.instance.exports.memory.buffer, outputRandom_ptr, 1_096_768);
  const exps = wasmInstance.instance.exports;
  const _seed = exps.seed;
  const _prng = exps.prng;
  const _rand = exps.rand;
  const _random = exps.random;
  const _randFill = exps.randFill;
  const _randomFill = exps.randomFill;

  return {
    seed: function (s) {
      for (let i = 0; i < s.length; i++) {
        _s[i] = s[i];
      }
      _seed(m_ptr, r_ptr, s_ptr);
    },
    prng: function (runs) {
      _prng(m_ptr, r_ptr, runs);
    },
    rand: function (n) {
      if (!n) {
        return _rand(m_ptr, r_ptr);
      } else {
        _randFill(m_ptr, r_ptr, outputRand_ptr, n);
        return outputRand.slice(0, n);
      }
    },
    random: function (n) {
      if (!n) {
        return _random(m_ptr, r_ptr);
      } else {
        _randomFill(m_ptr, r_ptr, outputRandom_ptr, n);
        return outputRandom.slice(0, n);
      }
    },
  };
};

export default IsaacWASM;