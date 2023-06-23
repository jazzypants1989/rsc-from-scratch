import * as http from "node:http"
import express from "express"
import compress from "compression"

import { renderToPipeableStream } from "react-dom/server"
import { createFromNodeStream } from "react-server-dom-webpack/client"

const app = express()

app.use(compress())
app.use(express.static("static"))

app.all("*", async function (req, res, next) {
  const promiseForData = request(
    {
      host: "127.0.0.1",
      port: 3001,
      method: req.method,
      path: req.path,
      headers: req.headers,
    },
    req
  )

  if (req.accepts("text/html")) {
    try {
      const rscResponse = await promiseForData
      const root = await createFromNodeStream(rscResponse)

      res.set("Content-type", "text/html")
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
      res.set("Content-type", "text/x-component")
      rscResponse.on("data", (data) => {
        res.write(data)
        res.flush()
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

app.listen(3000, () => {
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
