import * as React from "react"

export default async function CommentForm({ slug }) {
  return (
    <form id="comment-form" method="POST" action="/api/comment">
      <h2>Add a comment:</h2>
      <label>
        Your name:
        <input name="author" />
      </label>
      <br />
      <textarea name="content"></textarea>
      <br />
      <input type="hidden" name="slug" value={slug} />
      <button type="submit">Post comment</button>
      <p id="error"></p>
    </form>
  )
}
