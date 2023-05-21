import { readFile, stat } from "fs/promises";
import { transform } from "@svgr/core";
import type { Config } from "@svgr/core";
import type { Loader, OnLoadResult } from "esbuild";

export class SvgCache extends Map {
  config: Config;
  loader: Loader;
  constructor(config: Config) {
    super();
    this.config = config;
    this.loader = this.config.typescript ? "tsx" : "jsx";
  }

  async read(filePath: string) {
    const svg = await readFile(filePath, "utf-8");
    return transform(svg, this.config, { filePath: filePath });
  }

  async setCache(filePath: string) {
    const contents = await this.read(filePath);
    const { mtimeMs } = await stat(filePath);
    const newFile = {
      date: mtimeMs,
      contents,
    };

    this.set(filePath, newFile);
    return newFile;
  }
  async contentOf(filePath: string): Promise<OnLoadResult> {
    const cache = this.get(filePath);

    if (cache) {
      let contents = cache.contents;
      const { mtimeMs } = await stat(filePath);

      if (mtimeMs > cache.date) {
        contents = (await this.setCache(filePath)).contents;
      }
      return {
        contents,
        loader: this.loader,
      };
    } else {
      const { contents } = await this.setCache(filePath);
      return {
        contents,
        loader: this.loader,
      };
    }
  }
}
