import Footer from "./Footer.js"
import ColorChanger from "./ColorChanger.js"
import PopularPosts from "./PopularPosts.js"

export default function BlogLayout({ children }) {
  const author = "Jae Doe"
  return (
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
  )
}
