import React from "react"
import { readFile, writeFile } from "fs/promises"
import path from "path"

import { renderJSXToClientJSX } from "./rsc.js"

export default async function clientComponentTransform(Component, props) {
  let clientComponent = await Component(props)
  console.log("called clientComponent before rsc transform", clientComponent)

  const children = await renderJSXToClientJSX(props.children)

  if (clientComponent === null) {
    const raw = Component.toString()
    clientComponent = {
      value: raw,
      props: {
        ...props,
        "data-client": true,
        "data-component": Component.name,
        children,
      },
    }
  } else {
    console.log(
      "This probably doesn't need to be a client component: ",
      Component.name
    )
  }
  console.log("clientComponent after rsc transform", clientComponent)
  const file = path.join(
    process.cwd(),
    "static",
    "client",
    Component.name + ".js"
  )
  const exists = await lookForFile(file)
  console.log("exists", exists)
  if (exists) {
  } else {
    await writeComponentToDisk(clientComponent)
  }

  async function createDivWithHydrationProps() {
    return React.createElement(
      "div",
      {
        "data-client": true,
        "data-component": Component.name,
        "data-loading": true,
      },
      React.createElement(
        "div",
        {
          id: "spinner-container",
        },
        [
          React.createElement("div", {
            id: "spinner",
          }),
          children,
        ]
      )
    )
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
  const { props, value } = Component
  const name = props["data-component"]
  const filenameRaw = path.join(process.cwd(), "static", "client", name + ".js")
  const filename = path.normalize(filenameRaw)
  const fileContents = `import React from "react"
      import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime"
      
      export const props = ${JSON.stringify(props)}
      
      export const jsx = ${value}
      `

  try {
    await writeFile(filename, fileContents)
  } catch (err) {
    console.log("error in writeComponentToDisk", err)
  }
}
