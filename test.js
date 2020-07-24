const test = require('tape')
const u = require('unist-builder')
const remark = require('remark')
const dedent = require('dedent')
const removePosition = require('unist-util-remove-position')

const sectionize = require('.')

const document = dedent`
    # Heading 1

    Some text under heading 1.

    ## Heading 1.1

    Additional text.

    ## Heading 1.2

    _More_ additional text.

    ### Heading 1.2.1

    > Blockquote

    Text.

    ##### Bad heading

    Lorem ipsum.

    ### Heading 1.2.2

    Dolor sit amet.

    # Heading 2

    Another top level heading.

    ###### Another bad heading

    When will it end?
  `

const documentSections = {
  '1': [
    u('heading', { depth: 1 }, [u('text', { value: 'Heading 1' })]),
    u('paragraph', {}, [u('text', { value: 'Some text under heading 1.' })]),
  ],
  '1.1': [
    u('heading', { depth: 2 }, [u('text', { value: 'Heading 1.1' })]),
    u('paragraph', {}, [u('text', { value: 'Additional text.' })])  
  ],
  '1.2': [
    u('heading', { depth: 2 }, [u('text', { value: 'Heading 1.2' })]),
    u('paragraph', {}, [
      u('emphasis', {}, [u('text', { value: 'More' })]),
      u('text', { value: ' additional text.' })
    ]),  
  ],
  '1.2.1': [
    u('heading', { depth: 3 }, [u('text', { value: 'Heading 1.2.1' })]),
    u('blockquote', {}, [
      u('paragraph', {}, [u('text', { value: 'Blockquote' })])
    ]),
    u('paragraph', {}, [u('text', { value: 'Text.' })]),      
  ],
  '1.2.1-bad': [
    u('heading', { depth: 5 }, [u('text', { value: 'Bad heading' })]),
    u('paragraph', {}, [u('text', { value: 'Lorem ipsum.' })])      
  ],
  '1.2.2': [
    u('heading', { depth: 3 }, [u('text', { value: 'Heading 1.2.2' })]),
    u('paragraph', {}, [u('text', { value: 'Dolor sit amet.' })])      
  ],
  '2': [
    u('heading', { depth: 1 }, [u('text', { value: 'Heading 2' })]),
    u('paragraph', {}, [u('text', { value: 'Another top level heading.' })]),      
  ],
  '2-bad': [
    u('heading', { depth: 6 }, [
      u('text', { value: 'Another bad heading' })
    ]),
    u('paragraph', {}, [u('text', { value: 'When will it end?' })])      
  ]
}

test('sectionize', function (t) {
  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentSections['1'],
      u('section', { depth: 2, data: { hName: 'section' } }, [
        ...documentSections['1.1']
      ]),
      u('section', { depth: 2, data: { hName: 'section' } }, [
        ...documentSections['1.2'],
        u('section', { depth: 3, data: { hName: 'section' } }, [
          ...documentSections['1.2.1'],
          u('section', { depth: 5, data: { hName: 'section' } }, [
            ...documentSections['1.2.1-bad']
          ])
        ]),
        u('section', { depth: 3, data: { hName: 'section' } }, [
          ...documentSections['1.2.2']
        ])
      ])
    ]),
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentSections['2'],
      u('section', { depth: 6, data: { hName: 'section' } }, [
        ...documentSections['2-bad']
      ])
    ])
  ])

  const tree = remark().parse(document)

  sectionize()(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('wrap orphans when none exist should do nothing', function (t) {
  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentSections['1'],
      u('section', { depth: 2, data: { hName: 'section' } }, [
        ...documentSections['1.1']
      ]),
      u('section', { depth: 2, data: { hName: 'section' } }, [
        ...documentSections['1.2'],
        u('section', { depth: 3, data: { hName: 'section' } }, [
          ...documentSections['1.2.1'],
          u('section', { depth: 5, data: { hName: 'section' } }, [
            ...documentSections['1.2.1-bad']
          ])
        ]),
        u('section', { depth: 3, data: { hName: 'section' } }, [
          ...documentSections['1.2.2']
        ])
      ])
    ]),
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentSections['2'],
      u('section', { depth: 6, data: { hName: 'section' } }, [
        ...documentSections['2-bad']
      ])
    ])
  ])


  const tree = remark().parse(document)

  sectionize({ wrapOrphans: true })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('limit heading depth to h2', function (t) {
  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentSections['1'],
      u('section', { depth: 2, data: { hName: 'section' } }, [
        ...documentSections['1.1'],
      ]),
      u('section', { depth: 2, data: { hName: 'section' } }, [
        ...documentSections['1.2'],
        ...documentSections['1.2.1'],
        ...documentSections['1.2.1-bad'],
        ...documentSections['1.2.2']
      ])
    ]),
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentSections['2'],
      ...documentSections['2-bad']
    ])
  ])

  const tree = remark().parse(document)

  sectionize({ maxHeadingDepth: 2 })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('limit heading depth to h2, wrap orphans should have no effect', function (t) {
  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentSections['1'],
      u('section', { depth: 2, data: { hName: 'section' } }, [
        ...documentSections['1.1'],
      ]),
      u('section', { depth: 2, data: { hName: 'section' } }, [
        ...documentSections['1.2'],
        ...documentSections['1.2.1'],
        ...documentSections['1.2.1-bad'],
        ...documentSections['1.2.2']
      ])
    ]),
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentSections['2'],
      ...documentSections['2-bad']
    ])
  ])

  const tree = remark().parse(document)

  sectionize({ maxHeadingDepth: 2, wrapOrphans: true })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

/**
 * Markdown document without an h1 tag, and some leading orphans
 */
const documentWithOrphans = dedent`
    > An orphaned blockquote.

    And an orphaned paragraph.

    ## Heading 1.1

    Additional text.

    ## Heading 1.2

    _More_ additional text.

    ### Heading 1.2.1

    > Blockquote

    Text.

    ##### Bad heading

    Lorem ipsum.

    ### Heading 1.2.2

    Dolor sit amet.

    Another top level heading.

    ###### Another bad heading

    When will it end?
  `

const documentWithOrphansSections = {
  '1': [
    u('blockquote', {}, [
      u('paragraph', {}, [u('text', { value: 'An orphaned blockquote.' })])
    ]),
    u("paragraph", { }, [u("text", { value: "And an orphaned paragraph." })]),
  ],
  '1.1': [
    u('heading', { depth: 2 }, [u('text', { value: 'Heading 1.1' })]),
    u('paragraph', {}, [u('text', { value: 'Additional text.' })])  
  ],
  '1.2': [
    u('heading', { depth: 2 }, [u('text', { value: 'Heading 1.2' })]),
    u('paragraph', {}, [
      u('emphasis', {}, [u('text', { value: 'More' })]),
      u('text', { value: ' additional text.' })
    ]),  
  ],
  '1.2.1': [
    u('heading', { depth: 3 }, [u('text', { value: 'Heading 1.2.1' })]),
    u('blockquote', {}, [
      u('paragraph', {}, [u('text', { value: 'Blockquote' })])
    ]),
    u('paragraph', {}, [u('text', { value: 'Text.' })]),      
  ],
  '1.2.1-bad': [
    u('heading', { depth: 5 }, [u('text', { value: 'Bad heading' })]),
    u('paragraph', {}, [u('text', { value: 'Lorem ipsum.' })])      
  ],
  '1.2.2': [
    u('heading', { depth: 3 }, [u('text', { value: 'Heading 1.2.2' })]),
    u('paragraph', {}, [u('text', { value: 'Dolor sit amet.' })])      
  ],
  '2': [
    u('paragraph', {}, [u('text', { value: 'Another top level heading.' })]),      
  ],
  '2-bad': [
    u('heading', { depth: 6 }, [
      u('text', { value: 'Another bad heading' })
    ]),
    u('paragraph', {}, [u('text', { value: 'When will it end?' })])      
  ]
}

test('orphaned content, do not wrap it, maxHeadingDepth = 2', function (t) {
  const expected = u('root', {}, [
    ...documentWithOrphansSections['1'],
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1.1']
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1.2'],
      ...documentWithOrphansSections['1.2.1'],
      ...documentWithOrphansSections['1.2.1-bad'],
      ...documentWithOrphansSections['1.2.2'],
      ...documentWithOrphansSections['2'],
      ...documentWithOrphansSections['2-bad'] 
    ])
  ])

  const tree = remark().parse(documentWithOrphans)

  sectionize({ maxHeadingDepth: 2 })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('orphaned content, do not wrap it, maxHeadingDepth = 3', function (t) {
  const expected = u('root', {}, [
    ...documentWithOrphansSections['1'],
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1.1']
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1.2'],
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentWithOrphansSections['1.2.1'],
        ...documentWithOrphansSections['1.2.1-bad']
      ]),
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentWithOrphansSections['1.2.2'],
        ...documentWithOrphansSections['2'],
        ...documentWithOrphansSections['2-bad']   
      ]),
    ])
  ])

  const tree = remark().parse(documentWithOrphans)

  sectionize({ maxHeadingDepth: 3 })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('wrap orphaned content, maxHeadingDepth = 3', function (t) {
  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1'],
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1.1']
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1.2'],
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentWithOrphansSections['1.2.1'],
        ...documentWithOrphansSections['1.2.1-bad']
      ]),
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentWithOrphansSections['1.2.2'],
        ...documentWithOrphansSections['2'],
        ...documentWithOrphansSections['2-bad']   
      ]),
    ])
  ])

  const tree = remark().parse(documentWithOrphans)

  sectionize({ maxHeadingDepth: 3, wrapOrphans: true })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('wrap orphaned content, skip first nodes that are not allowed', function (t) {
  const expected = u('root', {}, [
    documentWithOrphansSections['1'][0],
    u('section', { depth: 1, data: { hName: 'section' } }, [
      documentWithOrphansSections['1'][1]
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1.1']
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentWithOrphansSections['1.2'],
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentWithOrphansSections['1.2.1'],
        ...documentWithOrphansSections['1.2.1-bad']
      ]),
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentWithOrphansSections['1.2.2'],
        ...documentWithOrphansSections['2'],
        ...documentWithOrphansSections['2-bad']   
      ]),
    ])
  ])

  const tree = remark().parse(documentWithOrphans)

  sectionize({ maxHeadingDepth: 3, wrapOrphans: true, contentNodeTypes: ['paragraph'] })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})