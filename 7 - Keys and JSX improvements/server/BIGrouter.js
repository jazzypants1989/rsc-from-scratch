import { readFile, readdir, writeFile } from "fs/promises"
import Markdown from "react-markdown"
import sizeOf from "image-size"
import sanitizeFilename from "sanitize-filename"

export default async function Router({ url }) {
  let page
  if (url.pathname === "/") {
    page = <BlogIndexPage />
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1))
    await handlePostClick(postSlug)
    page = (
      <article key={postSlug}>
        <BlogPostPage postSlug={postSlug} />
      </article>
    )
  }
  return <BlogLayout>{page}</BlogLayout>
}

function throwNotFound(cause) {
  const notFound = new Error("Not found.", { cause })
  notFound.statusCode = 404
  throw notFound
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
          <PopularPosts />
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

export async function handlePostClick(slug) {
  const clicksFile = "./clicks.json"
  let clicks
  try {
    const clicksData = await readFile(clicksFile, "utf8")
    clicks = JSON.parse(clicksData)
  } catch (err) {
    if (err.code === "ENOENT") {
      clicks = {}
    } else {
      throw err
    }
  }

  if (clicks[slug]) {
    clicks[slug]++
  } else {
    clicks[slug] = 1
  }

  const clicksData = JSON.stringify(clicks, null, 2)
  await writeFile(clicksFile, clicksData)

  return clicks
}

async function PopularPosts() {
  const clicksFile = "./clicks.json"
  let clicks
  try {
    const clicksData = await readFile(clicksFile, "utf8")
    clicks = JSON.parse(clicksData)
  } catch (err) {
    if (err.code === "ENOENT") {
      clicks = {}
    } else {
      throw err
    }
  }

  if (Object.keys(clicks).length === 0) {
    return null
  }

  const blogPostsWithClicks = Object.entries(clicks).map(([slug, clicks]) => {
    return { slug, clicks }
  })

  const sortedBlogPosts = blogPostsWithClicks.sort((a, b) => {
    return b.clicks - a.clicks
  })

  const topThreeBlogPosts = sortedBlogPosts.slice(0, 3)

  return (
    <div>
      <h3>Popular Posts</h3>
      <ol>
        {topThreeBlogPosts.map(({ slug, clicks }) => (
          <li key={slug}>
            <a href={"/" + slug}>{slug}</a> ({clicks}{" "}
            {clicks === 1 ? "click" : "clicks"})
          </li>
        ))}
      </ol>
    </div>
  )
}
