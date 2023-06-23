export default function ClientThree({ children }) {
  const env = "use client"

  if (typeof window === "undefined") {
    return null
  }

  const cookie = document.cookie
  const colorCookie = cookie.slice(cookie.indexOf("=") + 1)

  return (
    <div>
      <p>Color Saved In Cookie? -- </p>
      <p id="cookie-display">
        {colorCookie ? colorCookie : "No Color Saved Currently"}
      </p>
    </div>
  )
}
