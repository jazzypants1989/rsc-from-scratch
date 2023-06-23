import * as React from "react"
import { use, useState, startTransition } from "react"
import ReactDOM from "react-dom/client"
import { createFromFetch } from "react-server-dom-webpack"
import colorChanger from "/colorChanger.js"

let updateRoot
let currentPath = window.location.pathname
let JSXCache = new Map()

function Shell({ data }) {
  console.log("Shell", data)
  const [root, setRoot] = useState(use(data))
  updateRoot = setRoot
  JSXCache.set(currentPath, root)
  return root
}

let data = createFromFetch(
  fetch(currentPath, {
    headers: {
      Accept: "text/x-component",
    },
  })
)

async function navigate(event) {
  console.log("navigate", event)
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

window.navigation.addEventListener("navigate", async (event) => {
  if (!event.canIntercept) return
  if (event.destination.url.includes("/api/")) {
    event.preventDefault()
    if (event.formData) {
      console.log("JSON", Object.fromEntries(event.formData.entries()))
      const JSONForm = Object.fromEntries(event.formData.entries())
      if (!JSONForm) {
        console.error("No form data")
        return
      }
      const response = fetch(event.destination.url, {
        method: "POST",
        body: JSON.stringify(JSONForm),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const root = await createFromFetch(response)
      if (!root) {
        const error = response.error || "Server error"
        document.querySelector("#error").textContent = error
        console.error(error)
        return
      }

      document.querySelector("#error").textContent = ""
      document.querySelector("#error").style.display = "none"
      document.querySelector("#comment-form").reset()

      startTransition(() => {
        updateRoot(root)
      })
    }
    return
  }
  const path = new URL(event.destination.url).pathname
  currentPath = path
  if (event.navigationType === "traverse") {
    if (JSXCache.has(path)) {
      console.log("JSXCache hit", path)
      event.intercept({ handler: () => updateRoot(JSXCache.get(path)) })
      return
    }
  }
  event.intercept({ handler: () => navigate(event) })
})

ReactDOM.hydrateRoot(document, React.createElement(Shell, { data }))

await colorChanger()
