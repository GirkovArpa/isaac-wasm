'use strict';

const str2ints = function convertStringToArrayOfIntegers(string) {
  const r4 = [];
  const r = [];
  const stringPadded = string + '\0\0\0';
  const len = stringPadded.length - 1;
  let i = 0;

  while (i < len) {
    const w1 = stringPadded.charCodeAt(i++);
    const w2 = stringPadded.charCodeAt(i + 1);
    if (w1 < 0x0080) {
      r4.push(w1);
    } else if (w1 < 0x0800) {
      r4.push(((w1 >>> 6) & 0x1f) | 0xc0);
      r4.push(((w1 >>> 0) & 0x3f) | 0x80);
    } else if ((w1 & 0xf800) != 0xd800) {
      r4.push(((w1 >>> 12) & 0x0f) | 0xe0);
      r4.push(((w1 >>> 6) & 0x3f) | 0x80);
      r4.push(((w1 >>> 0) & 0x3f) | 0x80);
    } else if (((w1 & 0xfc00) == 0xd800) && ((w2 & 0xfc00) == 0xdc00)) {
      const u = ((w2 & 0x3f) | ((w1 & 0x3f) << 10)) + 0x10000;
      r4.push(((u >>> 18) & 0x07) | 0xf0);
      r4.push(((u >>> 12) & 0x3f) | 0x80);
      r4.push(((u >>> 6) & 0x3f) | 0x80);
      r4.push(((u >>> 0) & 0x3f) | 0x80);
      i++;
    } else {
      // Reached invalid character.
    }
    if (r4.length > 3) {
      r.push((r4.shift() << 0) | (r4.shift() << 8) |
        (r4.shift() << 16) | (r4.shift() << 24));
    }
  }
  return r;
}

export default str2ints;