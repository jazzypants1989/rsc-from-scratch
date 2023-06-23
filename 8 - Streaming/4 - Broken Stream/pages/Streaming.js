import { Suspense } from "react"

export default async function StreamingPage() {
  const stream = await fetch("https://www.reddit.com/r/react.json")

  const reader = stream.body.getReader()
  let data = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    data += new TextDecoder("utf-8").decode(value)
  }

  return (
    <>
      <h1>Streaming!!!</h1>
      <Suspense fallback={<p>Loading Two, Electric Boogaloo!</p>}>
        <p>{data}</p>
      </Suspense>
    </>
  )
}
