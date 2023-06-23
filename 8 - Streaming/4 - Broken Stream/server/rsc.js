import express from "express"
import compress from "compression"

import React from "react"
import { renderToPipeableStream } from "react-server-dom-webpack/server.node"

import Router from "./router.js"

const app = express()
app.use(compress())

async function renderApp(req, res) {
  const url = new URL(req.url, "http://localhost")
  const root = React.createElement(Router, { url })
  const { pipe } = renderToPipeableStream(root)
  pipe(res)
}

app.get("*", async function (req, res) {
  await renderApp(req, res, null)
})

app.listen(3001, () => {
  console.log("Regional Flight Server listening on port 3001...")
})
