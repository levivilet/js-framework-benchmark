import { nodeResolve } from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"

const createConfig = (input, file) => ({
  input,
  output: {
    compact: true,
    file,
    format: "esm",
  },
  plugins: [nodeResolve(), terser()],
})

/** @type {import("rollup").RollupOptions[]} */
export default [createConfig("src/main.js", "dist/main.js")]
