import * as React from "react"

import { readFile } from "fs/promises"

export default async function CommentList({ slug }) {
  let comments
  try {
    const commentsData = await readFile("./comments/" + slug + ".json", "utf8")
    comments = JSON.parse(commentsData)
  } catch (err) {
    if (err.code === "ENOENT") {
      comments = []
    } else {
      throw err
    }
  }

  if (comments.length === 0) {
    return null
  }

  return (
    <div>
      <h2>Comments:</h2>
      {comments.map((comment, i) => (
        <Comment key={i} comment={comment} />
      ))}
    </div>
  )
}

function Comment({ comment }) {
  const { content, timestamp, author } = comment
  const parsedTimestamp = new Date(timestamp).toLocaleString()
  return (
    <div
      className="comment-box"
      style={{
        border: "1px solid black",
        padding: "10px",
        margin: "10px",
        borderRadius: "5px",
        boxShadow: "5px 5px 5px black",
        backgroundColor: "lightgrey",
      }}
    >
      <p>{content}</p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <p>
          Posted by:{" "}
          <span
            style={{
              fontWeight: "bold",
              fontStyle: "italic",
            }}
          >
            {author}
          </span>
        </p>
        <p>
          On: <span>{parsedTimestamp}</span>
        </p>
      </div>
    </div>
  )
}
