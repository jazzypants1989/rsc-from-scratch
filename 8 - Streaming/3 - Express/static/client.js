import * as React from "react"
import { use, useState, startTransition } from "react"
import ReactDOM from "react-dom/client"
import { createFromFetch } from "react-server-dom-webpack"

let updateRoot
let JSXCache = new Map()

function Shell({ data }) {
  console.log("Shell", data)
  const [root, setRoot] = useState(use(data))
  updateRoot = setRoot
  JSXCache.set(currentPath, root)
  return root
}

let currentPath = window.location.pathname
let data = createFromFetch(
  fetch(currentPath, {
    headers: {
      Accept: "text/x-component",
    },
  })
)

async function navigate() {
  const response = fetch(currentPath, {
    headers: {
      Accept: "text/x-component",
    },
  })
  const root = await createFromFetch(response)
  startTransition(() => {
    updateRoot(root)
  })
}

window.navigation.addEventListener("navigate", (event) => {
  if (!event.canIntercept) return
  const path = new URL(event.destination.url).pathname
  currentPath = path
  if (event.navigationType === "traverse") {
    if (JSXCache.has(path)) {
      console.log("cache hit", path)
      event.intercept({ handler: () => updateRoot(JSXCache.get(path)) })
      return
    }
  }

  event.intercept({ handler: () => navigate(event) })
})

ReactDOM.hydrateRoot(document, React.createElement(Shell, { data }))
