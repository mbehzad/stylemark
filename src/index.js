const fs = require("fs")
const path = require("path")
const mkdirp = require("mkdirp")
const _ = require("lodash")
const Library = require("./models/Library")
const getMatchingFiles = require("./utils/getMatchingFiles")
const extractCommentBlocks = require("./parse/extractCommentBlocks")
const parseComponent = require("./parse/parseComponent")
const compileLibrary = require("./compile/compileLibrary")

module.exports = ({ input, output, name, cwd }) => {
    const filepaths = getMatchingFiles(input, cwd)
    const components = _.flatMap(filepaths, filepath => {
        const content = fs.readFileSync(filepath, { encoding: "utf8" })
        const isMarkdownFile = filepath.endsWith(".md") || filepath.endsWith(".markdown")
        return isMarkdownFile ? parseComponent(content) : extractCommentBlocks(content).map(parseComponent)
    })
    const library = new Library({ name, components })

    const html = compileLibrary(library)
    mkdirp(output)
    fs.writeFileSync(path.join(output, "index.html"), html)
}