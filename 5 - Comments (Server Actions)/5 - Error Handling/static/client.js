import { hydrateRoot } from "react-dom/client"
import colorChanger from "./colorChanger.js"

const root = hydrateRoot(document, getInitialClientJSX())
let currentPathname = window.location.pathname

async function navigate(pathname) {
  currentPathname = pathname
  const clientJSX = await fetchClientJSX(pathname)

  await colorChanger()

  if (pathname === currentPathname) {
    root.render(clientJSX)
  }
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
  const actionURL = new URL(action, window.location.origin)

  if (!actionURL.pathname.startsWith("/api/")) {
    console.log("not an API call")
    return
  }

  e.preventDefault()

  try {
    if (e.target.method === "get") {
      const formData = new FormData(e.target)
      const queryParams = new URLSearchParams(formData)
      const url = action + (queryParams ? "?" + queryParams : "")
      const raw = await fetch(url)

      if (!raw.ok) {
        console.error(raw)
        return
      }

      const response = await raw.json()

      if (response.error) {
        showErrorMessage(response.error)
      }

      navigate(window.location.pathname)
      return
    } else if (e.target.method === "post") {
      const formData = new FormData(e.target)
      const body = Object.fromEntries(formData.entries())

      const raw = await fetch(action, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!raw.ok) {
        console.error(raw)
        return
      }

      if (raw.headers.get("Content-Type") === "application/json") {
        const response = await raw.json()
        console.log(response)

        if (response.error) {
          showErrorMessage(response.error)
          return
        }
      }

      clearForm(e.target)
      navigate(window.location.pathname)
      return
    } else {
      console.error("unknown method", e.target.method)
    }
  } catch (err) {
    console.error(err)
  }
})

function showErrorMessage(message) {
  const error = document.getElementById("error")
  error.style.display = "block"
  error.textContent = message

  setTimeout(hideErrorMessage, 5000)

  function hideErrorMessage() {
    error.style.display = "none"
    error.textContent = ""
  }
}

function clearForm(form) {
  for (const input of form.elements) {
    if (input.type === "submit") {
      continue
    }
    input.value = ""
  }
}

await colorChanger()
