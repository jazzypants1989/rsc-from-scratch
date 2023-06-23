import * as React from "react"

export default function Footer({ author }) {
  return (
    <footer>
      <hr />
      <a href="/streaming">Streaming</a>
      <p>
        <i>
          (c) {author} {new Date().getFullYear()}
        </i>
      </p>
    </footer>
  )
}
