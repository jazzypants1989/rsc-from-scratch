export default async function colorChanger(color) {
  console.log("colorChanger.js color:", color)
  const colorSelector = document.getElementById("color-selector")

  if (!colorSelector) {
    throw new Error("color-selector not found")
  }

  if (color) {
    document.body.style.backgroundColor = color
    return
  }

  let colorCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("color="))

  if (colorCookie) {
    color = colorCookie.split("=")[1]
    colorChanger(color)
    colorSelector.defaultValue = color
    return
  }

  const response = await fetch("/api/random?auto=true")

  if (!response.ok) {
    console.error(response)
    return
  }

  const { color: fetchedColor } = await response.json()

  colorSelector.defaultValue = fetchedColor

  document.body.style.backgroundColor = fetchedColor

  const shouldBeBlack = checkIfTextShouldBeBlackOrWhite(fetchedColor)

  if (shouldBeBlack) {
    document.body.style.color = "black"
  } else {
    document.body.style.color = "white"
  }
}

function checkIfTextShouldBeBlackOrWhite(color) {
  const hex = color.replace("#", "")

  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness > 125
}
