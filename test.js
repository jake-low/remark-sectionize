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

test('wrapIntro = true', function (t) {
  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      u('heading', { depth: 1 }, [u('text', { value: 'Heading 1' })]),
      u('section', { depth: 2, data: { hName: 'section' } }, [
        u("paragraph", { depth: 2 }, [u("text", { value: "Some text under heading 1." })]),
      ]), 
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

  sectionize({ wrapIntro: true })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('option maxHeadingDepth = 2', function (t) {
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

test('maxHeadingDepth = 2, wrapIntro = true', function (t) {
  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      u('heading', { depth: 1 }, [u('text', { value: 'Heading 1' })]),
      u('section', { depth: 2, data: { hName: 'section' } }, [
        u("paragraph", { depth: 2 }, [u("text", { value: "Some text under heading 1." })]),
      ]), 
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

  sectionize({ maxHeadingDepth: 2, wrapIntro: true })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

/**
 * Markdown document without an h1 tag
 */
const documentNoH1 = dedent`
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

    Another top level heading.

    ###### Another bad heading

    When will it end?
  `

const documentNoH1Sections = {
  '1': [
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
    u('paragraph', {}, [u('text', { value: 'Another top level heading.' })]),      
  ],
  '2-bad': [
    u('heading', { depth: 6 }, [
      u('text', { value: 'Another bad heading' })
    ]),
    u('paragraph', {}, [u('text', { value: 'When will it end?' })])      
  ]
}

test('no h1, maxHeadingDepth = 2', function (t) {
  const expected = u('root', {}, [
    ...documentNoH1Sections['1'],
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentNoH1Sections['1.1']
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentNoH1Sections['1.2'],
      ...documentNoH1Sections['1.2.1'],
      ...documentNoH1Sections['1.2.1-bad'],
      ...documentNoH1Sections['1.2.2'],
      ...documentNoH1Sections['2'],
      ...documentNoH1Sections['2-bad'] 
    ])
  ])

  const tree = remark().parse(documentNoH1)

  sectionize({ maxHeadingDepth: 2 })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('no h1, maxHeadingDepth = 3', function (t) {
  const expected = u('root', {}, [
    ...documentNoH1Sections['1'],
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentNoH1Sections['1.1']
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentNoH1Sections['1.2'],
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentNoH1Sections['1.2.1'],
        ...documentNoH1Sections['1.2.1-bad']
      ]),
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentNoH1Sections['1.2.2'],
        ...documentNoH1Sections['2'],
        ...documentNoH1Sections['2-bad']   
      ]),
    ])
  ])

  const tree = remark().parse(documentNoH1)

  sectionize({ maxHeadingDepth: 3 })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('no h1, maxHeadingDepth = 3, wrapIntro = true', function (t) {
  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      u("paragraph", { depth: 1 }, [u("text", { value: "Some text under heading 1." })]),
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentNoH1Sections['1.1']
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      ...documentNoH1Sections['1.2'],
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentNoH1Sections['1.2.1'],
        ...documentNoH1Sections['1.2.1-bad']
      ]),
      u('section', { depth: 3, data: { hName: 'section' } }, [
        ...documentNoH1Sections['1.2.2'],
        ...documentNoH1Sections['2'],
        ...documentNoH1Sections['2-bad']   
      ]),
    ])
  ])

  const tree = remark().parse(documentNoH1)

  sectionize({ maxHeadingDepth: 3, wrapIntro: true })(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})