import * as React from "react"

import { readFile } from "fs/promises"
import Markdown from "react-markdown"
import Image from "./Image.js"

export default async function Post({ slug }) {
  let content
  try {
    content = await readFile("./posts/" + slug + ".md", "utf8")
  } catch (err) {
    throwNotFound(err)
  }

  return (
    <>
      <h2>
        <a href={"/" + slug}>{slug}</a>
      </h2>
      <Markdown components={{ img: Image }}>{content}</Markdown>
    </>
  )
}

function throwNotFound(cause) {
  const notFound = new Error("Not found.", { cause })
  notFound.statusCode = 404
  throw notFound
}
