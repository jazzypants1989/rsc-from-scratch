import sanitizeFilename from "sanitize-filename"
import BlogIndex from "../pages/BlogIndex.js"
import BlogPost from "../pages/BlogPost.js"
import Streaming from "../pages/Streaming.js"
import BlogLayout from "../components/BlogLayout.js"
import { handlePostClick } from "../components/PopularPosts.js"
import * as React from "react"

export default async function Router({ url }) {
  let page
  if (url.pathname === "/") {
    page = <BlogIndex />
  } else if (url.pathname === "/streaming") {
    page = (
      <React.Suspense fallback={<p>Loading...</p>}>
        <Streaming />
      </React.Suspense>
    )
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1))
    await handlePostClick(postSlug)
    page = (
      <article key={postSlug}>
        <BlogPost postSlug={postSlug} />
      </article>
    )
  }
  return <BlogLayout>{page}</BlogLayout>
}
