import os from "node:os";
import path from "node:path";
import { defineConfig } from "vitest/config";
import { transformWithOxc } from "vite";

const root = process.cwd();

const jsxInJs = {
  name: "jsx-in-js",
  enforce: "pre",
  async transform(code, id) {
    if (!id.endsWith(".js") || id.includes("node_modules")) return null;
    return transformWithOxc(code, id, {
      lang: "jsx",
      jsx: { runtime: "automatic" },
    });
  },
};

export default defineConfig({
  plugins: [jsxInJs],
  resolve: {
    alias: {
      "@component": path.resolve(root, "src/components"),
      "@components": path.resolve(root, "src/components"),
      "@hooks": path.resolve(root, "src/hooks"),
      "@lib": path.resolve(root, "src/lib"),
      "@images": path.resolve(root, "src/images"),
      "@data": path.resolve(root, "src/data"),
      "@config": path.resolve(root, "config"),
      "react/jsx-runtime": path.resolve(root, "node_modules/react/jsx-runtime.js"),
      "react/jsx-dev-runtime": path.resolve(root, "node_modules/react/jsx-dev-runtime.js"),
      locales: path.resolve(root, "src/locales/en"),
      "@i18n-iso-countries/lang": path.resolve(
        root,
        "node_modules/i18n-iso-countries/langs/en.json"
      ),
    },
  },
  test: {
    environment: "jsdom",
    execArgv: [
      `--localstorage-file=${path.join(os.tmpdir(), "proca-vitest-localstorage")}`,
    ],
    server: { deps: { inline: ["react-share"] } },
    globals: true,
    setupFiles: ["test/setup.js"],
    include: ["src/**/*.test.{js,jsx}", "test/**/*.test.{js,jsx}"],
  },
});
