export default function readForm(req) {
  return new Promise((resolve, reject) => {
    try {
      if (req.method === "GET") {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const body = url.searchParams
        const bodyObj = {}
        for (const [key, value] of body.entries()) {
          bodyObj[key] = value
        }
        resolve(bodyObj)
      } else if (req.method === "POST") {
        let body = ""
        req.on("data", (chunk) => {
          body += chunk.toString() // convert Buffer to string
        })
        req.on("end", () => {
          let bodyObj
          if (req.headers["content-type"] === "application/json") {
            bodyObj = JSON.parse(body)
          } else {
            const params = new URLSearchParams(body)
            bodyObj = {}
            for (const [key, value] of params.entries()) {
              bodyObj[key] = value
            }
          }
          resolve(bodyObj)
        })
        req.on("error", (err) => {
          console.error("Error reading request body", err)
          reject(err)
        })
      }
    } catch (err) {
      console.log("error in readForm", err)
      reject(err)
    }
  })
}

// I kinda like this one better, but it's not as readable:
//   const chunks = []
//   for await (const chunk of req) {
//     chunks.push(chunk)
//   }
//   const buffer = Buffer.concat(chunks)
//   const body = JSON.parse(buffer.toString())
//   return body
// }
