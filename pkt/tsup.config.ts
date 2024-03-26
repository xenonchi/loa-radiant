import { defineConfig } from "tsup"

export default defineConfig({
    entry: [],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
})
