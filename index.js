const findAfter = require('unist-util-find-after')
const visit = require('unist-util-visit-parents')

const defaults = {
  maxHeadingDepth: 6,
  wrapIntro: false
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
  const { maxHeadingDepth, wrapIntro } = options

  return (tree) => {
    for (let depth = 1; depth < maxHeadingDepth + 1; depth++) {
      visit(
        tree,
        node => node.type === 'heading' && node.depth === depth,
        sectionize
      )
    }

    if (wrapIntro) {
      sectionizeIntro(tree)
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

function sectionizeIntro (root) {
  let parent = root
  let start = parent.children[0]
  let depth = 1

  if (start.type === 'section') {
    parent = start
    start = parent.children[0]
    depth = 2
  }

  if (start.type === 'section') {
    return
  }

  if (start.type === 'heading') {
    start = parent.children[1]
  }

  start.depth = depth

  sectionize(start, [parent])
}