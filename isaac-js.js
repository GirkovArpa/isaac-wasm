/* ----------------------------------------------------------------------
 * Copyright (c) 2012 Yves-Marie K. Rinquin
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * ----------------------------------------------------------------------
 *
 * ISAAC is a cryptographically secure pseudo-random number generator
 * (or CSPRNG for short) designed by Robert J. Jenkins Jr. in 1996 and
 * based on RC4. It is designed for speed and security.
 *
 * ISAAC's informations & analysis:
 *   http://burtleburtle.net/bob/rand/isaac.html
 * ISAAC's implementation details:
 *   http://burtleburtle.net/bob/rand/isaacafa.html
 *
 * ISAAC succesfully passed TestU01
 *
 * ----------------------------------------------------------------------
 * */

'use strict';

import str2ints from './string2integers.js';

export default class IsaacJs {

  #m = Array(256); // internal memory
  #acc = 0;        // accumulator
  #brs = 0;        // last result
  #cnt = 0;        // counter
  #r = Array(256); // result array
  #gnt = 0;        // generation counter

  add(x, y) {
    const lsb = (x & 0xffff) + (y & 0xffff);
    const msb = (x >>> 16) + (y >>> 16) + (lsb >>> 16);
    let returnVal = (msb << 16) | (lsb & 0xffff);
    return returnVal;
  }

  reset() {
    this.#acc = this.#brs = this.cnt = 0;
    for (let i = 0; i < 256; i++) {
      this.#m[i] = this.#r[i] = 0;
    }
    this.#gnt = 0;
  }

  seed(s) {

    if (typeof s == 'string') {
      s = str2ints(s);
    }
    if (typeof s == 'number') {
      s = [s];
    }

    const GOLDEN_RATIO = 0x9e3779b9;
    let a = GOLDEN_RATIO;
    let b = GOLDEN_RATIO;
    let c = GOLDEN_RATIO;
    let d = GOLDEN_RATIO;
    let e = GOLDEN_RATIO;
    let f = GOLDEN_RATIO;
    let g = GOLDEN_RATIO;
    let h = GOLDEN_RATIO;

    this.reset();

    for (let i = 0; i < s.length; i++) {
      this.#r[i & 0xff] += s[i];
    }

    const mixSeeds = () => {
      a ^= b << 11; d = this.add(d, a); b = this.add(b, c);
      b ^= c >>> 2; e = this.add(e, b); c = this.add(c, d);
      c ^= d << 8; f = this.add(f, c); d = this.add(d, e);
      d ^= e >>> 16; g = this.add(g, d); e = this.add(e, f);
      e ^= f << 10; h = this.add(h, e); f = this.add(f, g);
      f ^= g >>> 4; a = this.add(a, f); g = this.add(g, h);
      g ^= h << 8; b = this.add(b, g); h = this.add(h, a);
      h ^= a >>> 9; c = this.add(c, h); a = this.add(a, b);
    }

    for (let i = 0; i < 4; i++) {
      mixSeeds();
    }

    for (let i = 0; i < 256; i += 8) {
      if (s) {
        a = this.add(a, this.#r[i + 0]); b = this.add(b, this.#r[i + 1]);
        c = this.add(c, this.#r[i + 2]); d = this.add(d, this.#r[i + 3]);
        e = this.add(e, this.#r[i + 4]); f = this.add(f, this.#r[i + 5]);
        g = this.add(g, this.#r[i + 6]); h = this.add(h, this.#r[i + 7]);
      }

      mixSeeds();

      this.#m[i + 0] = a; this.#m[i + 1] = b; this.#m[i + 2] = c; this.#m[i + 3] = d;
      this.#m[i + 4] = e; this.#m[i + 5] = f; this.#m[i + 6] = g; this.#m[i + 7] = h;
    }

    if (s) {
      for (let i = 0; i < 256; i += 8) {
        a = this.add(a, this.#m[i + 0]); b = this.add(b, this.#m[i + 1]);
        c = this.add(c, this.#m[i + 2]); d = this.add(d, this.#m[i + 3]);
        e = this.add(e, this.#m[i + 4]); f = this.add(f, this.#m[i + 5]);
        g = this.add(g, this.#m[i + 6]); h = this.add(h, this.#m[i + 7]);

        mixSeeds();

        this.#m[i + 0] = a; this.#m[i + 1] = b; this.#m[i + 2] = c; this.#m[i + 3] = d;
        this.#m[i + 4] = e; this.#m[i + 5] = f; this.#m[i + 6] = g; this.#m[i + 7] = h;
      }
    }

    this.prng();
    this.#gnt = 256;
  }

  prng(n) {
    let x, y;

    let runs = (n && typeof (n) === 'number') ? Math.abs(Math.floor(n)) : 1;

    while (runs--) {
      this.cnt = this.add(this.cnt, 1);
      this.#brs = this.add(this.#brs, this.cnt);

      for (let i = 0; i < 256; i++) {
        switch (i & 3) {
          case 0: this.#acc ^= this.#acc << 13; break;
          case 1: this.#acc ^= this.#acc >>> 6; break;
          case 2: this.#acc ^= this.#acc << 2; break;
          case 3: this.#acc ^= this.#acc >>> 16; break;
        }
        this.#acc = this.add(this.#m[(i + 128) & 0xff], this.#acc);
        x = this.#m[i];
        this.#m[i] = this.add(this.#m[(x >>> 2) & 0xff], this.add(this.#acc, this.#brs));
        y = this.#m[i];
        this.#r[i] = this.add(this.#m[(y >>> 10) & 0xff], x);
        this.#brs = this.#r[i];
      }
    }
  }

  rand() {
    if (!this.#gnt--) {
      this.prng(); this.#gnt = 255;
    }
    return this.#r[this.#gnt];
  }

  internals() {
    return { a: this.#acc, b: this.#brs, c: this.cnt, m: this.#m, r: this.#r };
  }

  random() {
    return 0.5 + this.rand() * 2.3283064365386963e-10;
  }
}