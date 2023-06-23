import { readFile } from "fs/promises"

export default async function getStaticAsset(pathname, res) {
  const ext = pathname.slice(pathname.lastIndexOf("."))
  let contentType = ""

  switch (ext) {
    case ".js":
      contentType = "application/javascript"
      break
    case ".css":
      contentType = "text/css"
      break
    case ".html":
      contentType = "text/html"
      break
    case ".json":
      contentType = "application/json"
      break
    case ".png":
      contentType = "image/png"
      break
    case ".jpg":
    case ".jpeg":
      contentType = "image/jpeg"
      break
    case ".svg":
      contentType = "image/svg+xml"
      break
    case ".gif":
      contentType = "image/gif"
      break
    case ".txt":
      contentType = "text/plain"
      break
    case ".pdf":
      contentType = "application/pdf"
      break
    case ".ico":
      contentType = "image/x-icon"
      break

    default:
      throw new Error("Unsupported file type, dangit! pathname: " + pathname)
  }

  try {
    const content = await readFile(`./static/${pathname}`)
    res.setHeader("Content-Type", contentType)
    res.end(content)
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end("Server error")
  }
}
