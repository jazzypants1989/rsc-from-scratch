import { createServer } from "http"
import { readFile, readdir, mkdir, writeFile } from "fs/promises"
import sanitizeFilename from "sanitize-filename"
import Markdown from "react-markdown"
import React from "react"

createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080")
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    console.log("This is an OPTIONS request: " + req.url + " " + req.method)
    res.statusCode = 200
    res.end()
    return
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    if (req.method === "POST" && url.pathname.startsWith("/comments/")) {
      await handleCommentPost(req, res, url)
    } else if (url.pathname.startsWith("/color")) {
      await colorChanger(req, res)
    } else {
      await sendJSX(res, <Router url={url} />)
    }
  } catch (err) {
    console.error(err)
    res.statusCode = err.statusCode ?? 500
    res.end()
  }
}).listen(8081)

async function colorChanger(req, res) {
  let body = ""
  for await (const chunk of req) {
    body += chunk
  }
  const parsed = JSON.parse(body)
  const color = parsed.color
  console.log("color", color)

  res.setHeader("Set-Cookie", `color=${color}; path=/;)`)
  res.end()
}

function Router({ url }) {
  let page
  if (url.pathname === "/") {
    page = <BlogIndexPage />
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1))
    page = <BlogPostPage postSlug={postSlug} />
  }
  return <BlogLayout>{page}</BlogLayout>
}

function BlogLayout({ children }) {
  const author = "Jae Doe"
  return (
    <html>
      <head>
        <title>My blog</title>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <hr />
          <form action="/color" id="color-changer">
            <input
              type="color"
              name="color"
              style={{ width: "100px", height: "100px" }}
            />
            <button type="submit">Change color</button>
          </form>
          <hr />
        </nav>
        <main>{children}</main>
        <Footer author={author} />
      </body>
    </html>
  )
}

function Footer({ author }) {
  return (
    <footer>
      <hr />
      <p>
        <i>
          (c) {author} {new Date().getFullYear()}
        </i>
      </p>
    </footer>
  )
}

async function BlogIndexPage() {
  const postFiles = await readdir("./posts")
  const postSlugs = postFiles.map((file) =>
    file.slice(0, file.lastIndexOf("."))
  )
  return (
    <section>
      <h1>Welcome to my blog</h1>
      <div>
        {postSlugs.map((slug) => (
          <Post key={slug} slug={slug} />
        ))}
      </div>
    </section>
  )
}

function BlogPostPage({ postSlug }) {
  return (
    <>
      <Post slug={postSlug} />
      <CommentForm slug={postSlug} />
      <CommentList slug={postSlug} />
    </>
  )
}

async function Post({ slug }) {
  let content
  try {
    content = await readFile("./posts/" + slug + ".md", "utf8")
  } catch (err) {
    throwNotFound(err)
  }
  return (
    <section>
      <h2>
        <a href={"/" + slug}>{slug}</a>
      </h2>
      <article>
        <Markdown>{content}</Markdown>
      </article>
    </section>
  )
}

async function CommentForm({ slug }) {
  const action = "/comments/" + slug
  return (
    <form id="comment-form" method="POST" action={action}>
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

async function CommentList({ slug }) {
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
  console.log(comment)
  const { content, timestamp, author } = comment
  return (
    <div>
      <p>{content}</p>
      <p>Posted by: {author}</p>
      <p>Timestamp: {timestamp}</p>\
    </div>
  )
}

async function sendJSX(res, jsx) {
  const clientJSX = await renderJSXToClientJSX(jsx)
  const clientJSXString = JSON.stringify(clientJSX, stringifyJSX)
  res.setHeader("Content-Type", "application/json")
  res.end(clientJSXString)
}

function throwNotFound(cause) {
  const notFound = new Error("Not found.", { cause })
  notFound.statusCode = 404
  throw notFound
}

function stringifyJSX(key, value) {
  if (value === Symbol.for("react.element")) {
    return "$RE"
  } else if (typeof value === "string" && value.startsWith("$")) {
    return "$" + value
  } else {
    return value
  }
}

async function renderJSXToClientJSX(jsx) {
  if (
    typeof jsx === "string" ||
    typeof jsx === "number" ||
    typeof jsx === "boolean" ||
    jsx == null
  ) {
    return jsx
  } else if (Array.isArray(jsx)) {
    return Promise.all(jsx.map((child) => renderJSXToClientJSX(child)))
  } else if (jsx != null && typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (jsx.type === React.Fragment) {
        // Handle React.Fragment
        const children = jsx.props.children
        return await renderJSXToClientJSX(children)
      } else if (typeof jsx.type === "string") {
        return {
          ...jsx,
          props: await renderJSXToClientJSX(jsx.props),
        }
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type
        const props = jsx.props
        const returnedJsx = await Component(props)
        return renderJSXToClientJSX(returnedJsx)
      } else throw new Error("Not implemented.")
    } else {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(jsx).map(async ([propName, value]) => [
            propName,
            await renderJSXToClientJSX(value),
          ])
        )
      )
    }
  } else throw new Error("Not implemented")
}

async function handleCommentPost(req, res) {
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
  res.statusCode = 303
  res.end()
}

async function readForm(req) {
  try {
    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host}`)
      const body = url.searchParams
      const bodyObj = {}
      for (const [key, value] of body.entries()) {
        bodyObj[key] = value
      }
      return bodyObj
    } else {
      if (req.method === "POST") {
        const chunks = []
        for await (const chunk of req) {
          chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)
        const body = JSON.parse(buffer.toString())
        return body
      }
    }
  } catch (err) {
    console.log("error in readForm", err)
  }
}
