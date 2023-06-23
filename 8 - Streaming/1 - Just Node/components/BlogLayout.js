import * as React from "react"

import Footer from "./Footer.js"
import ColorChanger from "./ColorChanger.js"
import PopularPosts from "./PopularPosts.js"

const importMap = `{
  "imports": {
    "react": "https://esm.sh/react@canary",
    "react-dom/client": "https://esm.sh/react-dom@canary/client",
    "react-server-dom-webpack": "https://esm.sh/react-server-dom-webpack@18.3.0-canary-613e6f5fc-20230616/client"
  }
}`

export default function BlogLayout({ children }) {
  const author = "Jae Doe"
  return (
    <html>
      <head lang="en">
        <title>My Blog</title>
        <script
          type="importmap"
          dangerouslySetInnerHTML={{ __html: importMap }}
        ></script>
        <script type="module" src="/client.js"></script>
        <meta name="description" content="My blog" />
        <meta name="author" content={author} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/style.css" />
      </head>
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
