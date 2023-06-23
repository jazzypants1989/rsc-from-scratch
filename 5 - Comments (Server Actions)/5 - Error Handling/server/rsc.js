import { createServer } from "http"
import { readFile, readdir } from "fs/promises"
import sanitizeFilename from "sanitize-filename"
import { Fragment } from "react"
import Markdown from "react-markdown"
import sizeOf from "image-size"

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    if (url.pathname.startsWith("/api/")) {
      // const action = url.searchParams.get("action")
      const action = url.pathname.slice(5)
      await ActionRouter(action, req, res)
      return
    }
    await sendJSX(res, <Router url={url} />)
  } catch (err) {
    console.error(err)
    res.statusCode = err.statusCode ?? 500
    res.end()
  }
}).listen(8081)

async function ActionRouter(action, req, res) {
  const actionModule = await import("./actions/" + action + ".js")
  const actionFunction = actionModule.default
  await actionFunction(req, res)
  return
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

async function BlogIndexPage() {
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
    <>
      <h2>
        <a href={"/" + slug}>{slug}</a>
      </h2>
      <Markdown components={{ img: Image }}>{content}</Markdown>
    </>
  )
}

function Image({ src, alt }) {
  const dimensions = sizeOf("./static/images/" + src)
  return (
    <img
      src={"/images/" + src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
    />
  )
}

function BlogLayout({ children }) {
  const author = "Jae Doe"
  return (
    <html>
      <body>
        <nav>
          <a href="/">Home</a>
          <hr />
          <ColorChanger />
          <hr />
        </nav>
        <main>{children}</main>
        <Footer author={author} />
      </body>
    </html>
  )
}

function ColorChanger() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <form action="/api/color" id="color-changer" method="POST">
        <input
          type="color"
          name="color"
          id="color-selector"
          style={{ width: "50px", height: "50px" }}
        />
        <button type="submit">Change color</button>
      </form>
      <form action="/api/random" method="POST">
        <button type="submit">Random color</button>
      </form>
      <form action="/api/random?auto=true">
        <button type="submit">Random Color (no cookie)</button>
      </form>
      <form action="/api/delete" method="POST">
        <button type="submit">Delete cookie</button>
      </form>
    </div>
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

async function CommentForm({ slug }) {
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
      if (jsx.type === Fragment) {
        const { children } = jsx.props
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
