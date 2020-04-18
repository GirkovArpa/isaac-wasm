# The ISAAC random number generator

I saw this used by **fruiz500** for his steganography app **PassLok Stego**, found it slow (seconds for large images), and decided to speed it up with WebAssembly.

## Getting Started

Open index.html in a web browser and check out the developer console window to see proof of how much faster the WASM version of ISAAC is.  You have to host it on a server though to avoid cross-origin errors.

For instance, on my computer, I see this in the console:

```
generate 1 million random ints with JS: 142.18408203125ms
generate 1 million random ints with WASM: 39.31298828125ms
generate 1 million random floats with JS: 138.297119140625ms
generate 1 million random floats with WASM: 46.101318359375ms
```

### Compiling from C++ to WebAssembly

The compiled **isaac.wasm** is already provided but you can compile it yourself from **isaac.cpp** using **emscripten.**  Emscripten is a nightmare to use though.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

* Thanks to [fruiz500](https://github.com/fruiz500) for his cool privacy apps, you should check 'em out!