# vite-plugin-glimmerx

GlimmerX loader for Vite


## Supported features:

---
* hbs templates import:

```js
import MyComponent from './components/hello.hbs';
```

* TypeScript component files
* JavaScript component files;


## Configuration:

`vite.config.ts`
```ts
import { defineConfig, PluginOption } from 'vite';

import glimmerXPlugin from 'vite-plugin-glimmerx';

export default defineConfig({
  plugins: [
    glimmerXPlugin() as PluginOption
  ],
});
```