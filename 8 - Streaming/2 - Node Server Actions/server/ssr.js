import * as http from "node:http"

import { renderToPipeableStream } from "react-dom/server"
import { createFromNodeStream } from "react-server-dom-webpack/client"
import getStaticAsset from "./getStaticAsset.js"
import readForm from "./readForm.js"

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)

    if (url.pathname.includes(".")) {
      await getStaticAsset(url.pathname, res)
      return
    }

    let promiseForData = request(
      {
        host: "localhost",
        port: 3001,
        method: req.method,
        path: url.pathname,
        headers: req.headers,
      },
      req
    )

    if (url.pathname.startsWith("/api/")) {
      const body = await readForm(req)
      console.log("body", body)
      const response = await fetch(
        "http://localhost:3001" + url.pathname + url.search,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      const bodyString = await response.text()
      console.log("bodyString", bodyString)
      const headers = response.headers
      res.statusCode = response.status
      writeHeaders(headers, res)
      res.end(bodyString)
      return
    }

    if (req.headers.accept.includes("text/html")) {
      try {
        const rscResponse = await promiseForData
        const root = await createFromNodeStream(rscResponse)
        res.setHeader("Content-type", "text/html")
        const { pipe } = renderToPipeableStream(root)
        pipe(res)
      } catch (e) {
        console.error(`Failed to SSR: ${e.stack}`)
        res.statusCode = 500
        res.end()
      }
    } else {
      try {
        const rscResponse = await promiseForData
        res.setHeader("Content-type", "text/x-component")
        rscResponse.on("data", (data) => {
          res.write(data)
          res.flushHeaders()
        })
        rscResponse.on("end", (data) => {
          res.end()
        })
      } catch (e) {
        console.error(`Failed to proxy request: ${e.stack}`)
        res.statusCode = 500
        res.end()
      }
    }
  })
  .listen(3000, () => {
    console.log("Global Fizz/Webpack Server listening on port 3000...")
  })

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      resolve(res)
    })
    req.on("error", (e) => {
      reject(e)
    })
    body.pipe(req)
  })
}

function writeHeaders(headers, res) {
  try {
    for (const [key, value] of headers.entries()) {
      res.setHeader(key, value)
    }
  } catch (err) {
    console.log("error in writeHeaders", err)
  }
}
