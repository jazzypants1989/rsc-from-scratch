import React from "react"
import { readFile, writeFile, existsSync } from "fs"
import path from "path"
import { createHash } from "crypto"

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

  await writeComponentToDisk(clientComponent)

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

  // Read old hash
  const hashFilename = `${filename}.hash`
  let oldHash = ""
  if (existsSync(hashFilename)) {
    oldHash = await new Promise((resolve, reject) => {
      readFile(hashFilename, "utf8", (err, data) => {
        if (err) reject(err)
        else resolve(data.trim())
      })
    })
  }

  // Compute new hash
  const newHash = createHash("sha256").update(fileContents).digest("hex")

  // If the hashes are different, write the new file and hash
  if (newHash !== oldHash) {
    console.log("writing new file", filename)
    await new Promise((resolve, reject) => {
      writeFile(filename, fileContents, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    console.log("writing new hash", hashFilename)
    await new Promise((resolve, reject) => {
      writeFile(hashFilename, newHash, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
  console.log("hashes are the same, not writing file")
}
