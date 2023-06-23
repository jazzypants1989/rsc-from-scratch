import readForm from "../readForm.js"

export default async function ColorChange(req, res) {
  try {
    const body = await readForm(req)
    console.log("body in color.js", body)
    const color = body.color
    if (!color) {
      console.log("no color")
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "Color is required" }))
      return
    }
    const colorCookie = `color=${color}; path=/; max-age=31536000`
    res.setHeader("Set-Cookie", colorCookie)
    res.setHeader("X-Location", "/")
    res.end()
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end()
  }
}
