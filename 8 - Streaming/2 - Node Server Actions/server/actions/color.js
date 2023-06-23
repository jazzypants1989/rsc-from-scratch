import readForm from "../readForm.js"

export default async function ColorChange(req, res) {
  try {
    const body = await readForm(req)
    console.log("body", body)
    const color = body.color
    console.log("color", color)
    if (!color) {
      res.setHeader("Content-Type", "application/json")
      console.log("color is required")
      res.end(JSON.stringify({ error: "Color is required" }))
      return
    }
    const colorCookie = `color=${color}; path=/; max-age=31536000`
    res.setHeader("Set-Cookie", colorCookie)
    console.log("cookie header: ", res.getHeader("Set-Cookie"))
    res.setHeader("X-Location", "/")
    res.statusCode = 303
    res.end()
    return
  } catch (err) {
    console.error(err)
    res.statusCode = 500
  }
}
