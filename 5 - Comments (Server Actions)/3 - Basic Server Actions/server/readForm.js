export default async function readForm(req) {
  try {
    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host}`)
      const body = url.searchParams
      const bodyObj = {}
      for (const [key, value] of body.entries()) {
        bodyObj[key] = value
      }
      return bodyObj
    } else {
      if (req.method === "POST") {
        const chunks = []
        for await (const chunk of req) {
          chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)
        const body = JSON.parse(buffer.toString())
        return body
      }
    }
  } catch (err) {
    console.log("error in readForm", err)
  }
}
