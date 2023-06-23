import readForm from "../readForm.js"
import { readFile, writeFile } from "fs/promises"

export default async function handleCommentPost(req, res) {
  const body = await readForm(req)
  console.log("body in comment.js", body)
  const { content, author, slug } = body

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

  const newComment = {
    content,
    author,
    timestamp: new Date().toISOString(),
  }

  comments.push(newComment)
  const commentsFile = "./comments/" + slug + ".json"
  await writeFile(commentsFile, JSON.stringify(comments, null, 2))
  res.setHeader("Location", "/" + slug)
  console.log("redirecting to", "/" + slug)
  res.end()
}
