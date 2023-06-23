import { hydrateRoot } from "react-dom/client"
import colorChanger from "./colorChanger.js"

const root = hydrateRoot(document, getInitialClientJSX())

async function navigate(pathname) {
  const clientJSX = await fetchClientJSX(pathname)

  await colorChanger()

  root.render(clientJSX)
}

function getInitialClientJSX() {
  const clientJSX = JSON.parse(window.__INITIAL_CLIENT_JSX_STRING__, parseJSX)
  return clientJSX
}

async function fetchClientJSX(pathname) {
  const response = await fetch(pathname + "?jsx")
  const clientJSXString = await response.text()
  const clientJSX = JSON.parse(clientJSXString, parseJSX)
  return clientJSX
}

function parseJSX(key, value) {
  if (value === "$RE") {
    return Symbol.for("react.element")
  } else if (typeof value === "string" && value.startsWith("$$")) {
    return value.slice(1)
  } else {
    return value
  }
}

window.addEventListener(
  "click",
  (e) => {
    if (e.target.tagName !== "A") {
      return
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    const href = e.target.getAttribute("href")
    if (!href.startsWith("/")) {
      return
    }
    e.preventDefault()
    window.history.pushState(null, null, href)
    navigate(href)
  },
  true
)

window.addEventListener("popstate", () => {
  navigate(window.location.pathname)
})

window.addEventListener("submit", async (e) => {
  const action = e.target.action
  const actionURL = new URL(action, `http://${window.location.host}`)

  if (!actionURL.pathname.startsWith("/api/")) {
    console.log("not an API call")
    return
  }

  e.preventDefault()

  try {
    if (e.target.method === "get") {
      const formData = new FormData(e.target)
      const queryParams = new URLSearchParams(formData)
      const url = action + "?" + queryParams.toString()
      const response = await fetch(url)
      const location = response.headers.get("Location")
      if (location) {
        window.history.pushState(null, null, location)
        navigate(location)
      } else {
        navigate(window.location.pathname)
      }
      return
    } else if (e.target.method === "post") {
      const formData = new FormData(e.target)
      const body = Object.fromEntries(formData.entries())
      const url = action
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })
      response.headers.forEach((value, key) => {
        console.log(key, value)
      })
      const location = response.headers.get("Location")
      if (location) {
        window.history.pushState(null, null, location)
        navigate(location)
      } else {
        navigate(window.location.pathname)
      }
      return
    } else {
      console.error("unknown method", e.target.method)
    }
  } catch (err) {
    console.error(err)
  }
})

await colorChanger()
