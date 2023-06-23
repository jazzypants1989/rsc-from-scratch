import React from "react"

export default function ClientOnly({ children }) {
  const env = "use client"

  if (typeof window === "undefined") {
    return null
  }

  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    console.log("env", env)
  }, [])

  return (
    <>
      <h3>Client Only</h3>
      <button onClick={() => console.log("HEY WHATS UP! YOU ARE SO COOL!")}>
        Console.log
      </button>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      {children}
    </>
  )
}
