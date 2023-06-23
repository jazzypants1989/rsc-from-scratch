import readForm from "../readForm.js"

export default async function ColorChange(body, res) {
  try {
    // const body = await readForm(req)
    const color = body.color
    if (!color) {
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "Color is required" }))
      return
    }
    const colorCookie = `color=${color}; path=/; max-age=31536000`
    res.setHeader("Set-Cookie", colorCookie)
    console.log("cookie header: ", req.headers["Set-Cookie"])
    res.setHeader("X-Location", "/")
    return "I did it!"
  } catch (err) {
    console.error(err)
    res.statusCode = 500
  }
}
