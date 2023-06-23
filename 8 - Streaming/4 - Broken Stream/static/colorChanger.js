export default async function colorChanger(color) {
  const colorSelector = document.getElementById("color-selector")

  if (!colorSelector) {
    throw new Error("color-selector not found")
  }

  if (color) {
    document.body.style.backgroundColor = color
    changeText(color)
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

  changeText(fetchedColor)

  document.body.style.backgroundColor = fetchedColor
}

function checkText(color) {
  const hex = color.replace("#", "")

  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness > 125
}

function changeText(color) {
  const shouldBeBlack = checkText(color)
  const commentBoxes = document.querySelectorAll(".comment-box")

  if (shouldBeBlack) {
    document.body.style.color = "black"
    for (const commentBox of commentBoxes) {
      commentBox.style.backgroundColor = "#f0f0f0"
    }
  } else {
    document.body.style.color = "white"
    for (const commentBox of commentBoxes) {
      commentBox.style.backgroundColor = "#333"
    }
  }
}
