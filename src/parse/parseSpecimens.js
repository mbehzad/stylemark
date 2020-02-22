const visit = require("unist-util-visit")
const parseFrontmatter = require("gray-matter")
const fs = require("fs")
const path = require("path")
const _ = require("lodash")
const parseBlockNameAndLanguage = require("./parseBlockNameAndLanguage")
const parseBlockFlags = require("./parseBlockFlags")
const Block = require("../models/Block")
const Specimen = require("../models/Specimen")

module.exports = () => (tree, file) => {
    const specimenBlocks = []

    visit(tree, "code", node => {
        const [specimenName, language] = parseBlockNameAndLanguage(node.lang)

        if (!specimenName) {
            return
        }

        const flags = parseBlockFlags(node.meta || "")
        const frontmatter = parseFrontmatter(node.value)
        const props = frontmatter.data
        const content = frontmatter.content
        const block = new Block({
            specimenName,
            language,
            flags,
            props,
            content,
        })
        specimenBlocks.push(block)

        node.block = block
        node.value = content
    })

    const specimens = _(specimenBlocks)
        .groupBy("specimenName")
        .map((blocks, specimenName) => new Specimen({ name: specimenName, blocks }))
        .value()
    file.data.specimens = specimens
}