import React from "react"
import { readFile, writeFile } from "fs/promises"
import path from "path"

import { renderJSXToClientJSX } from "./rsc.js"

import { renderToString } from "react-dom/server"

export default async function clientComponentTransform(Component, props) {
  const children = await renderJSXToClientJSX(props.children)

  console.log(children, "children")

  const staticComponent = renderToString(React.createElement(Component, props))

  console.log("staticComponent", staticComponent)

  const jsx = Component.toString()

  const clientComponent = {
    jsx,
    props: {
      ...props,
      "data-client": true,
      "data-component": Component.name,
      children,
    },
  }

  console.log("clientComponent after rsc transform", clientComponent)
  const file = path.join(
    process.cwd(),
    "static",
    "client",
    Component.name + ".js"
  )
  const exists = await lookForFile(file)
  console.log("the file exists -- ", exists, file)
  if (exists) {
  } else {
    await writeComponentToDisk(clientComponent)
  }

  async function createDivWithHydrationProps() {
    return React.createElement("div", {
      "data-client": true,
      "data-component": Component.name,
      dangerouslySetInnerHTML: {
        __html: staticComponent,
      },
    })
  }

  const div = await createDivWithHydrationProps()

  return div
}

async function lookForFile(filename) {
  const file = path.normalize(filename)

  try {
    await readFile(file)
    return true
  } catch (err) {
    if (err.code === "ENOENT") {
      return false
    } else {
      throw err
    }
  }
}

async function writeComponentToDisk(Component) {
  const { props, jsx } = Component
  const name = props["data-component"]
  const filenameRaw = path.join(process.cwd(), "static", "client", name + ".js")
  const filename = path.normalize(filenameRaw)
  const fileContents = `import React from "react"
      import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime"
      
      export const props = ${JSON.stringify(props)}
      
      export const jsx = ${jsx}
      `

  try {
    await writeFile(filename, fileContents)
  } catch (err) {
    console.log("error in writeComponentToDisk", err)
  }
}
