export default async function deleteColor(req, res) {
  try {
    const colorCookie = `color=; path=/; max-age=0`
    res.setHeader("Set-Cookie", colorCookie)
    res.setHeader("X-Location", "/")
    res.statusCode = 303
    res.end()
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end()
  }
}
