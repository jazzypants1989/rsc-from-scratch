import sanitizeFilename from "sanitize-filename"
import BlogIndex from "./pages/BlogIndex.js"
import BlogPost from "./pages/BlogPost.js"
import BlogLayout from "./components/BlogLayout.js"
import { handlePostClick } from "./components/PopularPosts.js"

export default async function Router({ url }) {
  let page
  if (url.pathname === "/") {
    page = <BlogIndex />
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
