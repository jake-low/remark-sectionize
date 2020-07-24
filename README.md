# remark-sectionize

This is a [remark](https://github.com/remarkjs/remark) plugin to wrap each
heading and the content that follows it in a `<section>` tag, allowing you to
style the document sections using CSS.

## Example

When using `remark-sectionize`, given the following markdown:

```md
# Forest elephants

## Introduction

In this section, we discuss the lesser known forest elephants.

## Habitat

Forest elephants do not live in trees but among them.
```

...remark will output the following HTML:

```html
<section>
  <h1>Forest elephants</h1>
  <section>
    <h2>Introduction</h2>
    <p>In this section, we discuss the lesser known forest elephants.</p>
  </section>
  <section>
    <h2>Habitat</h2>
    <p>Forest elephants do not live in trees but among them.</p>
  </section>
</section>
```

One use case of this plugin is to permit the logical sections of a document to
be targeted and styled using CSS. For example, you could do something like
this:

```css
section > section:nth-child(even) {
  background-color: white;
}

section > section:nth-child(odd) {
  background-color: papayawhip;
}
```

To give the `h2`-level sections alternating background colors.

## Usage

If you are invoking `remark` (or `unified`) in JavaScript, you can add this
plugin by calling `use()`:

```js
const remark = require('remark')
const sectionize = require('remark-sectionize')
const html = require('remark-html')

const input = `
# Hello world!

The above heading and this paragraph will be wrapped in a <section> tag.
`

remark()
  .use(sectionize)
  .use(html)
  .process(input, (err, file) => {
    if (err) {
      console.error(err)
    } else {
      console.log(String(file))
    }
  })
```

If you're using remark from the CLI, you can use sectionize via the `--use`
argument:

```
$ remark --use sectionize example.md
```

Note that for the above to work, `remark-sectionize` needs to be installed
somewhere that `remark` can find.

Finally, if you're using Webpack and
[mdx-loader](https://www.npmjs.com/package/mdx-loader) to import markdown files
from JS, you can modify the loader options in your webpack config file, adding
`sectionize` to your `mdPlugins` list (something like the following):

```js
const sectionize = require('remark-sectionize')

module.exports = {
  module: {
    rules: [
      {
        test: /\.(md|mdx|markdown)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-react"]
            }
          },
          {
            loader: "mdx-loader",
            options: {
              mdPlugins: [sectionize]
            }
          }
        ]
      }
    ]
  }
};
```

## Options

| Option | Type | Default | Description |
| -------|------|---------|-------------|
| `maxHeadingDepth` | `integer` | `6` | The maximum depth to look for headings to sectionize. For example, `2` means you would only create sections surrounding `h1` and `h2` tags. |
| `wrapOrphans` | `boolean` | `false` | Whether you want to wrap orphaned content nodes. An orphaned content node would be a node under `root` without a `section` wrapper. This might happen if you start you document without a `heading`, like in cases where you have a page title defined in frontmatter.
| `contentNodeTypes` | `string[]` | `['paragraph', 'code', blockquote']` | An array of node types to consider content for the purposes of finding orphans. Has no effect if `wrapOrphans` is `false`.

## License

This repository is licensed under the MIT license; see the LICENSE file for details.
