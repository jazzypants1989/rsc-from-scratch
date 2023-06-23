import * as http from "node:http"

import { renderToPipeableStream } from "react-dom/server"
import { createFromNodeStream } from "react-server-dom-webpack/client"
import getStaticAsset from "./getStaticAsset.js"

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)

    if (url.pathname.includes(".")) {
      await getStaticAsset(url.pathname, res)
      return
    }

    const promiseForData = request(
      {
        host: "localhost",
        port: 3001,
        method: req.method,
        path: url.pathname,
        headers: req.headers,
      },
      req
    )

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
