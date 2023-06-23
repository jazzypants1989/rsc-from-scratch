import React from "react"
import { renderToPipeableStream } from "react-server-dom-webpack/server.node"

import Router from "./router.js"
import { createServer } from "http"

async function renderApp(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const root = React.createElement(Router, { url })
  const { pipe } = renderToPipeableStream(root)
  pipe(res)
}

createServer(async (req, res) => {
  await renderApp(req, res, null)
}).listen(3001, () => {
  console.log("Regional Flight Server listening on port 3001...")
})
