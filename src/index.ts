import svgo from "@svgr/plugin-svgo";
import jsx from "@svgr/plugin-jsx";
import path from "path";
import { SvgCache } from "./svgCache";
import type { Config } from "@svgr/core";
import type { Plugin } from "esbuild";

const jsImporter = new Set(["import-statement", "require-call", "dynamic-import", "require-resolve"]);
const defaultPlugins = [svgo, jsx];
const ns = "svg-plugin";

export default (config: Config = {}): Plugin => {
  if (!Array.isArray(config.plugins)) {
    config.plugins = defaultPlugins;
  }

  const svgCache = new SvgCache(config);

  return {
    name: ns,
    setup(build) {
      if (build.initialOptions.loader) {
        build.initialOptions.loader[".svg"] = "file";
      } else {
        build.initialOptions.loader = { ".svg": "file" };
      }
      build.onResolve({ filter: /\.svg$/ }, async (args) => {
        return {
          path: path.resolve(args.resolveDir, args.path),
          suffix: "",
          namespace: jsImporter.has(args.kind) ? ns : undefined,
          sideEffects: false,
          pluginData: {
            _customLoader: true,
            kind: args.kind,
          },
        };
      });

      build.onLoad({ filter: /\.svg$/ }, async (args) => {
        if (args.pluginData?._customLoader && args.pluginData.kind != "url-token") {
          return svgCache.contentOf(args.path);
        }

        return {
          loader: "file",
          watchFiles: [args.path],
        };
      });
    },
  };
};
