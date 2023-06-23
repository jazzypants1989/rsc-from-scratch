import React from "react"

export default function ClientOnly({ children }) {
  const env = "use client"

  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    console.log("env", env)
  }, [])

  return (
    <>
      <h3>Client Only</h3>
      <button onClick={() => console.log("HEY WHATS UP")}>Console.log</button>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      {children}
    </>
  )
}
