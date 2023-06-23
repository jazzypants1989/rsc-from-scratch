export default async function ColorChange(req, res) {
  const url = new URL(req.url, "http://localhost")
  const auto = url.searchParams.get("auto")
  try {
    const color = randomColor()
    if (!auto) {
      const colorCookie = `color=${color}; path=/; max-age=31536000`
      res.setHeader("Set-Cookie", colorCookie)
    }
    res.setHeader("Content-Type", "application/json")
    res.setHeader("X-Location", "/")
    res.end(JSON.stringify({ color }))
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end()
  }
}

function randomColor() {
  const vars = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += vars[Math.floor(Math.random() * 16)]
  }
  return color
}
