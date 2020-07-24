const findAfter = require('unist-util-find-after')
const visit = require('unist-util-visit-parents')

const defaults = {
  contentNodeTypes: ['paragraph', 'code', 'blockquote'],
  maxHeadingDepth: 6,
  wrapOrphans: false
}

module.exports = plugin

function plugin (options = {}) {
  const settings = {
    ...defaults,
    ...options
  }

  return transform(settings)
}

function transform (options) {
  const { contentNodeTypes, maxHeadingDepth, wrapOrphans } = options

  return (tree) => {
    for (let depth = 1; depth < maxHeadingDepth + 1; depth++) {
      visit(
        tree,
        node => node.type === 'heading' && node.depth === depth,
        sectionize
      )
    }

    if (wrapOrphans) {
      sectionizeOrphans(tree, contentNodeTypes)
    }
  }
}

function sectionize (node, ancestors) {
  const start = node
  const depth = start.depth
  const parent = ancestors[ancestors.length - 1]

  const isEnd = node => node.type === 'heading' && node.depth <= depth || node.type === 'export' || node.type === 'section'
  const end = findAfter(parent, start, isEnd)

  const startIndex = parent.children.indexOf(start)
  const endIndex = parent.children.indexOf(end)

  insertSection(startIndex, endIndex, depth, parent)
}

function sectionizeOrphans (root, contentNodeTypes) {
  const startIndex = findFirstOrphanedContentNodeIndex(root.children[0], root, contentNodeTypes)

  if (startIndex === -1) {
    return
  }

  const end = findAfter(root, startIndex, node => node.type === 'section')  
  const endIndex = root.children.indexOf(end)
  const depth = 1

  insertSection(startIndex, endIndex, depth, root)
}

function insertSection (startIndex, endIndex, depth, parent) {
  const between = parent.children.slice(
    startIndex,
    endIndex > 0 ? endIndex : undefined
  )

  const section = {
    type: 'section',
    depth: depth,
    children: between,
    data: {
      hName: 'section'
    }
  }

  parent.children.splice(startIndex, section.children.length, section) 
}

function findFirstOrphanedContentNodeIndex(node, parent, contentNodeTypes) {
  if (!node) {
    return -1
  }
  
  const nodeIndex = parent.children.indexOf(node)

  if (contentNodeTypes.includes(node.type)) {
    return nodeIndex
  }

  return findFirstOrphanedContentNodeIndex(parent.children[nodeIndex + 1], parent, contentNodeTypes)
}