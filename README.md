## Description

> An esbuild plugin to transform your svg files to jsx components.  
> Works flawlessly with esbuild publicPath config within stylesheet and javascript files.

# Installation

```bash
yarn add -D esbuild-svg
# or
npm install -D esbuild-svg
```

## Usage

```js
const esbuild = require("esbuild");
const svgPlugin = require("esbuild-svg");

esbuild
  .build({
    entryPoints: ["input.js"],
    outdir: "public",
    bundle: true,
    plugins: [svgPlugin()],
  })
  .then((result) => console.log(result))
  .catch(() => process.exit(1));
```

The plugin takes one argument which can be any [SVGR config](https://react-svgr.com/docs/options/).  
Default SVGR config's plugins are `@svgr/plugin-svgo` and `@svgr/plugin-jsx`.

```js
const svgrConfig = { exportType: "named" }

// usual esbuild config
{
 ...
 plugins: [svgPlugin(svgrConfig)],
 ...
}

```

Then simply import your svg inside your file.

```ts
// with { exportType: "named" }
import { ReactComponent as DummyIcon } from "../pic/dummy.svg";
```

```ts
// with { exportType: "default" }
import DummyIcon from "../pic/dummy.svg";
```

If you only need publicPath of your svg then simply add `?` suffix to import path.

```ts
import dummyIconUrl from "../pic/dummy.svg?";

console.log(dummyIconUrl);
// http://localhost:3000/dummy-BWTJZSSF.svg
```

Importing both publicPath and svg as component

```tsx
import { ReactComponent as DummyIcon } from "../pic/dummy.svg";
import dummyIconUrl from "../pic/dummy.svg?";

const MyComponent = () => {
  return (
    <div>
      <span>url: {dummyIconUrl}</span>
      <DummyIcon />
    </div>
  );
};
```

Adding types to your (react) project.

```ts
declare module "*.svg?" {
  const publicPath: string;
  export default publicPath;
}

// with { exportType: "default" }
declare module "*.svg" {
  import { ReactElement, SVGProps } from "react";
  const content: (props: SVGProps<SVGElement>) => ReactElement;
  export default content;
}

// with { exportType: "named" }
declare module "*.svg" {
  import { ReactElement, SVGProps } from "react";
  const ReactComponent: (props: SVGProps<SVGElement>) => ReactElement;
  export { ReactComponent };
}

// with { exportType: "named", namedExport: "Svg" }
declare module "*.svg" {
  import { ReactElement, SVGProps } from "react";
  const Svg: (props: SVGProps<SVGElement>) => ReactElement;
  export { Svg };
}
```
