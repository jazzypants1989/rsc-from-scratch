import { createServer } from "http"
import { readFile } from "fs/promises"
import { renderToString } from "react-dom/server"

// This is a server to host CDN distributed resources like static files and SSR.

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    if (url.pathname.startsWith("/client.js")) {
      const content = await readFile("./client.js", "utf8")
      res.setHeader("Content-Type", "text/javascript")
      res.end(content)
      return
    }
    if (url.pathname.startsWith("/style.css")) {
      const content = await readFile("./style.css", "utf8")
      res.setHeader("Content-Type", "text/css")
      res.end(content)
      return
    }
    const response = await fetch("http://127.0.0.1:8081" + url.pathname)
    if (!response.ok) {
      res.statusCode = response.status
      res.end()
      return
    }
    const clientJSXString = await response.text()
    if (response.headers.get("Set-Cookie")) {
      console.log("Setting cookie", response.headers.get("Set-Cookie"))
      res.setHeader("Set-Cookie", response.headers.get("Set-Cookie"))
    }
    if (url.searchParams.has("jsx")) {
      res.setHeader("Content-Type", "application/json")
      res.end(clientJSXString)
    } else {
      const clientJSX = JSON.parse(clientJSXString, parseJSX)
      const style = `<link rel="stylesheet" href="/style.css">`
      let html = style + renderToString(clientJSX)
      html += `<script>window.__INITIAL_CLIENT_JSX_STRING__ = `
      html += JSON.stringify(clientJSXString).replace(/</g, "\\u003c")
      html += `</script>`
      html += `
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@canary",
              "react-dom/client": "https://esm.sh/react-dom@canary/client"
            }
          }
        </script>
        <script type="module" src="/client.js"></script>
      `
      html += `<style>
      body {
        transition: background-color 2s ease;
      };
      </style>`
      res.setHeader("Content-Type", "text/html")
      res.end(html)
    }
  } catch (err) {
    console.error(err)
    res.statusCode = err.statusCode ?? 500
    res.end()
  }
}).listen(8080)

function parseJSX(key, value) {
  if (value === "$RE") {
    return Symbol.for("react.element")
  } else if (typeof value === "string" && value.startsWith("$$")) {
    return value.slice(1)
  } else {
    return value
  }
}