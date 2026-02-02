// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import babel from "vite-plugin-babel";
import tsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      }),
      babel({
        babelConfig: {
          plugins: [["babel-plugin-react-compiler", {}]]
        }
      })
    ]
  }
});
export {
  app_config_default as default
};
