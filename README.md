# vosk-lib

Vosk library for node, with type defenitions and multi-arch support.

This library aims to provide (at least) the same API as [`vosk`](https://www.npmjs.com/package/vosk) package.

But it also:

- Include type definitions
- Only download the shared library for the current platform and architecture
  - macOS: `x64`, `arm64`
  - Windows: `x64`, `ia32`
  - Linux: `x64`, `ia32`, `arm64`, `arm`
