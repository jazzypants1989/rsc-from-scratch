import React from "react"
import { renderToPipeableStream } from "react-server-dom-webpack/server.node"

import Router from "./router.js"
import { createServer } from "http"

async function renderApp(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (url.pathname.startsWith("/api/")) {
    const action = url.pathname.slice(5)
    await ActionRouter(action, req, res)
    return
  }
  const root = React.createElement(Router, { url })
  const { pipe } = renderToPipeableStream(root)
  pipe(res)
}

async function ActionRouter(action, req, res) {
  const actionModule = await import("./actions/" + action + ".js")
  const actionFunction = actionModule.default
  await actionFunction(req, res)
  return
}

createServer(async (req, res) => {
  await renderApp(req, res, null)
}).listen(3001, () => {
  console.log("Regional Flight Server listening on port 3001...")
})
