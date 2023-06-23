import * as React from "react"

import { readdir } from "fs/promises"
import Post from "../components/Post.js"

export default async function BlogIndexPage() {
  const postFiles = await readdir("./posts")
  const postSlugs = postFiles.map((file) =>
    file.slice(0, file.lastIndexOf("."))
  )
  return (
    <>
      <h1>Welcome to my blog</h1>
      <div>
        {postSlugs.map((slug) => (
          <Post key={slug} slug={slug} />
        ))}
      </div>
    </>
  )
}
