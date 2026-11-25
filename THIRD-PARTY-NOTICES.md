# Element Plus document stylesheet

`src/document.css` is compiled from Element Plus 2.14.7 `theme-chalk/src/reset.scss` using Sass 1.93.2. The compiled file is shipped with the backend; applications do not need Sass. To regenerate it when upgrading Element Plus, run the following maintenance command from this package directory (requires registry access or a cached Sass executable):

```sh
pnpm dlx sass@1.93.2 --no-source-map node_modules/element-plus/theme-chalk/src/reset.scss src/document.css
```

Review the upstream reset and compiled differences before adopting a new version. The upstream source is distributed under this license:

```text
MIT License

Copyright (c) 2020-PRESENT Element Plus

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Common icons

The expanded catalogue imports selected components from `@element-plus/icons-vue` 2.3.2 (MIT; see the bundled [license](docs/icon-licenses/Element-Plus.txt)). `src/icons/globe.vue` and `external-link.vue` are original backend-owned artwork, not Element Plus exports.
