import {CleanWebpackPlugin} from "clean-webpack-plugin"
import loadJsonFile from "load-json-file"
import path from "path"
import pify from "pify"
import webpack from "webpack"

const indexModule = require(process.env.MAIN ? path.resolve(process.env.MAIN) : path.join(__dirname, "..", "src"))
const {default: PublishimoWebpackPlugin} = indexModule

jest.setTimeout(60 * 1000)

const getWebpackConfig = name => ({
  target: "node",
  mode: "production",
  devtool: "inline-source-map",
  context: path.join(__dirname, name),
  entry: path.join(__dirname, name, "src"),
  output: {
    path: path.join(__dirname, name, "dist"),
  },
})

it("should run", async () => {
  const webpackConfig = {
    ...getWebpackConfig("basic"),
    plugins: [
      new CleanWebpackPlugin,
      new PublishimoWebpackPlugin,
    ],
  }
  await pify(webpack)(webpackConfig)
  const output = await loadJsonFile(path.join(__dirname, "basic", "dist", "package.json"))
  expect(output).toMatchObject({
    license: "MIT",
    name: "basic",
    version: "1.0.0",
  })
})

it("should run with configuration", async () => {
  const pkg = {
    license: "Apache 2",
    name: "configured",
    version: "1.2.3",
  }
  const webpackConfig = {
    ...getWebpackConfig("configured"),
    output: {
      path: path.join(__dirname, "configured", "dist"),
      filename: "out/[name].js",
    },
    plugins: [
      new CleanWebpackPlugin,
      new PublishimoWebpackPlugin({
        pkg,
        debugFolder: path.join(__dirname, "configured", "dist", "debug"),
        filename: "pkg.json",
        config: {
          author: "Jaid",
          github: true,
        },
      }),
    ],
  }
  await pify(webpack)(webpackConfig)
  const output = await loadJsonFile(path.join(__dirname, "configured", "dist", "pkg.json"))
  expect(output).toMatchObject(pkg)
  expect(output.main).toBe("out/main.js")
})

it("should run for cli output", async () => {
  const pkg = {
    license: "Apache 2",
    name: "my-cli-package",
    version: "1.2.3",
  }
  const webpackConfig = {
    ...getWebpackConfig("cli"),
    output: {
      path: path.join(__dirname, "cli", "dist"),
      filename: "out/[name].js",
    },
    plugins: [
      new CleanWebpackPlugin,
      new PublishimoWebpackPlugin({
        pkg,
        debugFolder: path.join(__dirname, "cli", "dist", "debug"),
        filename: "pkg.json",
        binName: ["cli", "bin"],
        autoMain: "bin",
      }),
    ],
  }
  await pify(webpack)(webpackConfig)
  const output = await loadJsonFile(path.join(__dirname, "cli", "dist", "pkg.json"))
  expect(output).toMatchObject(pkg)
})