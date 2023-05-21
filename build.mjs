import esbuild from "esbuild";
import { execSync } from "child_process";

const shouldWatch = process.env.DEV == "true";

const compileDeclarations = () => {
  try {
    execSync("tsc");
  } catch (error) {
    console.log(error.output?.[1]?.toString());
  }
};
const external = ["esbuild", "@svgr/core", "@svgr/plugin-jsx", "@svgr/plugin-svgo"];
const watchPlugin = {
  name: "watch-plugin",
  setup: (build) => {
    const format = build.initialOptions.format;
    build.onEnd(async (result) => {
      console.log("Build", format, new Date().toLocaleString());
      compileDeclarations();
    });
  },
};

const commonOptions = {
  entryPoints: ["./src/index.ts"],
  platform: "node",
  format: "cjs",
  target: "ES6",
  bundle: true,
  minify: !shouldWatch,
  external,
  outdir: "dist",
  plugins: [watchPlugin],
};

const cjs = await esbuild[shouldWatch ? "context" : "build"](commonOptions);
const mjs = await esbuild[shouldWatch ? "context" : "build"]({ ...commonOptions, format: "esm", outExtension: { ".js": ".mjs" } });
if (shouldWatch) {
  await cjs.watch();
  await mjs.watch();
}
