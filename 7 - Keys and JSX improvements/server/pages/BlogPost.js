import Post from "../components/Post.js"
import CommentForm from "../components/CommentForm.js"
import CommentList from "../components/CommentList.js"

export default function BlogPostPage({ postSlug }) {
  return (
    <>
      <Post slug={postSlug} />
      <CommentForm slug={postSlug} />
      <CommentList slug={postSlug} />
    </>
  )
}
