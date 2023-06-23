import { createServer } from "http"
import { renderToString } from "react-dom/server"
import getStaticAsset from "./getStaticAsset.js"
import readForm from "./readForm.js"

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    if (url.pathname.includes(".")) {
      await getStaticAsset(url.pathname, res)
      return
    }
    if (url.pathname.startsWith("/api/")) {
      await serveAction(req, res)
      return
    }
    const response = await fetch("http://127.0.0.1:8081" + url.pathname)
    if (!response.ok) {
      errorResponse(res, response)
      return
    }
    const clientJSXString = await response.text()
    if (url.searchParams.has("jsx")) {
      res.setHeader("Content-Type", "application/json")
      res.end(clientJSXString)
    } else {
      const clientJSX = JSON.parse(clientJSXString, parseJSX)
      let html = renderToString(clientJSX)
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
      res.setHeader("Content-Type", "text/html")
      res.end(html)
    }
  } catch (err) {
    console.log("error in ssr.js", err)
    res.statusCode = 500
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

async function serveAction(req, res) {
  console.log("serveAction", req.url)
  const rawBody = await readForm(req)
  console.log("rawBody", rawBody)
  const body = JSON.stringify(rawBody)
  const url = new URL(req.url, `http://${req.headers.host}`)
  const fetchURL =
    "http://127.0.0.1:8081" +
    url.pathname +
    (url.searchParams.toString() ? "?" + url.searchParams.toString() : "")

  const response = await fetch(fetchURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })

  if (!response.ok) {
    errorResponse(res, response)
  }

  if (response.headers.get("location")) {
    res.setHeader("Location", response.headers.get("location"))
  }

  const responseBody = await response.text()
  res.setHeader("Content-Type", "application/json")
  res.end(responseBody)
}
function errorResponse(res, RSCResponse) {
  console.log("response not ok in ssr.js", RSCResponse.status)
  res.statusCode = RSCResponse.status ?? 500
  res.statusMessage = RSCResponse.statusText ?? "Server error"
  res.end()
}
