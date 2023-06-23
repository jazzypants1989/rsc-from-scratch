import * as React from "react"
import { use, useState, startTransition } from "react"
import ReactDOM from "react-dom/client"
import { createFromFetch } from "react-server-dom-webpack"

let updateRoot

function Shell({ data }) {
  console.log("Shell", data)
  const [root, setRoot] = useState(use(data))
  updateRoot = setRoot
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
  const path = new URL(event.destination.url).pathname
  if (path !== currentPath) {
    currentPath = path
    event.intercept({
      handler: navigate,
    })
  }
})

ReactDOM.hydrateRoot(document, React.createElement(Shell, { data }))
