import { hydrateRoot } from "react-dom/client"

const root = hydrateRoot(document, getInitialClientJSX())
let currentPathname = window.location.pathname

async function navigate(pathname) {
  currentPathname = pathname
  const clientJSX = await fetchClientJSX(pathname)
  if (pathname === currentPathname) {
    root.render(clientJSX)
    changeBodyBGColor()
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

window.addEventListener(
  "submit",
  async (e) => {
    if (e.target.id !== "comment-form") {
      console.log("The ID is: ", e.target.id)
      return
    }
    e.preventDefault()

    console.log("comment-form")

    const form = e.target
    const content = form.elements.content.value
    const author = form.elements.author.value
    const slug = form.elements.slug.value
    const error = form.querySelector("#error")
    console.log("content", content)

    if (!content) {
      console.error("Empty content")
      error.textContent = "Please enter a comment"
      error.style.display = "block"
      return
    }

    if (!author) {
      console.error("Empty author")
      error.textContent = "Please enter your name"
      error.style.display = "block"
      return
    }

    const url = new URL(form.action)
    url.port = 8081

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ content, author, slug }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (response.ok) {
      const pathname = new URL(form.action).pathname.slice("/comments/".length)
      await navigate("/" + pathname)
    } else {
      console.error("Failed to submit form", response.statusText)
      error.textContent = "Failed to submit form"
    }
  },
  true
)

function getRandomColor() {
  var letters = "0123456789ABCDEF"
  var color = "#"
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function changeBodyBGColor() {
  document.body.style.backgroundColor = getRandomColor()
}

window.addEventListener("submit", async (e) => {
  if (e.target.id !== "color-changer") {
    console.log("The ID is: ", e.target.id)
    return
  }

  e.preventDefault()
  console.log("color-form")

  const form = e.target
  console.log(form)
  const color = form.elements.color.value
  const error = form.querySelector("#error")
  console.log("color", color)

  if (!color) {
    console.error("Empty color")
    error.textContent = "Please enter a color"
    error.style.display = "block"
    return
  }

  const url = new URL(form.action)
  url.port = 8081

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ color }), // Send the color as JSON string
    headers: {
      "Content-Type": "application/json", // Set the content type to application/json
    },
  })

  if (response.ok) {
    const color = form.elements.color.value
    document.body.style.backgroundColor = color
    document.cookie = "color=" + color
  } else {
    console.error("Failed to submit form", response.statusText)
    error.textContent = "Failed to submit form"
  }
})

const colorCookie = document.cookie
  .split(";")
  .find((row) => row.trim().startsWith("color="))

if (colorCookie) {
  const color = colorCookie.split("=")[1]
  document.body.style.backgroundColor = color
} else {
  changeBodyBGColor()
}
