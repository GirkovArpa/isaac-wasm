// emcc -Os isaac.cpp -o isaac.wasm" -s EXPORTED_FUNCTIONS="['_seed', '_prng', '_rand', '_random', '_randFill', '_randomFill']" -s WASM=1 -s ERROR_ON_UNDEFINED_SYMBOLS=0

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

#define MIX_SEEDS {a ^= b << 11; d = this->add(d, a); b = this->add(b, c);\
b ^= unsigned(c) >> 2; e = this->add(e, b); c = this->add(c, d);\
c ^= d << 8; f = this->add(f, c); d = this->add(d, e);\
d ^= unsigned(e) >> 16; g = this->add(g, d); e = this->add(e, f);\
e ^= f << 10; h = this->add(h, e); f = this->add(f, g);\
f ^= unsigned(g) >> 4; a = this->add(a, f); g = this->add(g, h);\
g ^= h << 8; b = this->add(b, g); h = this->add(h, a);\
h ^= unsigned(a) >> 9; c = this->add(c, h); a = this->add(a, b);}\

class Isaac {
private:
  long int *m;
  long int *r;
  long int acc;
  long int brs;
  long int cnt;
  long int gnt;

public:
  Isaac(long int *M, long int *R) {
    m = M;
    r = R;
  }

  long int add(long int x, long int y) {
    const long int lsb = (x & 0xffff) + (y & 0xffff);
    const long int msb = (unsigned(x) >> 16) + (unsigned(y) >> 16) + (unsigned(lsb) >> 16);
    return (msb << 16) | (lsb & 0xffff);
  }

  void reset() {
    this->acc = 0L;
    this->brs = 0L;
    this->cnt = 0L;
    for (int i = 0; i < 256; i++) {
      this->m[i] = this->r[i] = 0L;
    }
    this->gnt = 0L;
  }

  void prng(long long int n) {
    long long int x;
    long long int y;

    long long int runs = n;
    if (runs == 0) {
      runs = 1;
    }

    while (runs--) {
      this->cnt = this->add(this->cnt, 1L);
      this->brs = this->add(this->brs, this->cnt);

      for (int i = 0; i < 256; i++) {
        switch (i & 3) {
          case 0: this->acc ^= this->acc << 13L; break;
          case 1: this->acc ^= unsigned(this->acc) >> 6L; break;
          case 2: this->acc ^= this->acc << 2L; break;
          case 3: this->acc ^= unsigned(this->acc) >> 16L; break;
        }
        this->acc = this->add(this->m[(i + 128) & 255], this->acc);
        x = this->m[i];
        this->m[i] = this->add(this->m[(unsigned(x) >> 2L) & 255L], this->add(this->acc, this->brs));
        y = this->m[i];
        this->r[i] = this->add(this->m[(unsigned(y) >> 10L) & 255L], x);
        this->brs = this->r[i];
      }
    }
  }

  void seed(long int *s) {
    constexpr long int GOLDEN_RATIO = 2654435769L;
    long int a = GOLDEN_RATIO;
    long int b = GOLDEN_RATIO;
    long int c = GOLDEN_RATIO;
    long int d = GOLDEN_RATIO;
    long int e = GOLDEN_RATIO;
    long int f = GOLDEN_RATIO;
    long int g = GOLDEN_RATIO;
    long int h = GOLDEN_RATIO;

    this->reset();
    for (int i = 0; i < 256; i++) {
      this->r[i & 255] += s[i];
    }

    for (int i = 0; i < 4; i++) {
      MIX_SEEDS
    }

    for (int i = 0; i < 256; i += 8) {
      if (true) { 
        a = this->add(a, this->r[i + 0]); b = this->add(b, this->r[i + 1]);
        c = this->add(c, this->r[i + 2]); d = this->add(d, this->r[i + 3]);
        e = this->add(e, this->r[i + 4]); f = this->add(f, this->r[i + 5]);
        g = this->add(g, this->r[i + 6]); h = this->add(h, this->r[i + 7]);
      }

      MIX_SEEDS

      this->m[i + 0] = a; this->m[i + 1] = b; this->m[i + 2] = c; this->m[i + 3] = d;
      this->m[i + 4] = e; this->m[i + 5] = f; this->m[i + 6] = g; this->m[i + 7] = h;
    }
    if (true) { 
      for (int i = 0; i < 256; i += 8) {
        a = this->add(a, this->m[i + 0]); b = this->add(b, this->m[i + 1]);
        c = this->add(c, this->m[i + 2]); d = this->add(d, this->m[i + 3]);
        e = this->add(e, this->m[i + 4]); f = this->add(f, this->m[i + 5]);
        g = this->add(g, this->m[i + 6]); h = this->add(h, this->m[i + 7]);

        MIX_SEEDS

        this->m[i + 0] = a; this->m[i + 1] = b; this->m[i + 2] = c; this->m[i + 3] = d;
        this->m[i + 4] = e; this->m[i + 5] = f; this->m[i + 6] = g; this->m[i + 7] = h;
      }
    }

    this->prng(0L);
    this->gnt = 256L;
  }

  long int rand() {
    if ((this->gnt--) == 0L) {
      this->prng(0L); 
      this->gnt = 255L;
    }
    return this->r[this->gnt];
  }

 double random() {
    return 0.5 + static_cast<double>(this->rand()) * static_cast<double>(2.3283064365386963e-10L);
  }
};

extern "C" {
  void seed(long int *r, long int *m, long int *s) {
    Isaac isaac(r, m);
    isaac.seed(s);
  }

  long int rand(long int*r, long int *m) {
    Isaac isaac(r, m);
    return isaac.rand();
  }

  double random(long int *r, long int *m) {
    Isaac isaac(r, m);
    return isaac.random();
  }

  void randFill(long int *r, long int *m, long int *output, long int count) {
    Isaac isaac(r, m);
    for (long int i = 0L; i < count; i++) {
      output[i] = isaac.rand();
    }
  }

  void randomFill(long int *r, long int *m, double *output, long int count) {
    Isaac isaac(r, m);
    for (long int i = 0L; i < count; i++) {
      output[i] = isaac.random();
    }
  }

  void prng(long int *r, long int *m, long int runs) {
    Isaac isaac(r, m);
    isaac.prng(runs);
  }
}