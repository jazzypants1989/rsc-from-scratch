import * as React from "react"

export default function Footer({ author }) {
  return (
    <footer>
      <hr />
      <p>
        <i>
          (c) {author} {new Date().getFullYear()}
        </i>
      </p>
      <a href="/streaming">Streaming</a>
    </footer>
  )
}
