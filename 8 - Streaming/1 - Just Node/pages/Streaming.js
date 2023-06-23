import { Suspense } from "react"

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default async function StreamingPage() {
  const data = await sleep(10000).then(() => "Streaming data!")
  return (
    <>
      <h1>Streaming!!!</h1>
      <p>{data}</p>
    </>
  )
}
