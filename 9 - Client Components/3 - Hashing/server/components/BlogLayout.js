import Footer from "./Footer.js"
import ColorChanger from "./ColorChanger.js"
import PopularPosts from "./PopularPosts.js"
import ClientOnly from "./ClientOnly.js"
import ClientTwo from "./ClientTwo.js"

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
        <hr />
        <ClientOnly>LOL, my hydration strategy SUX</ClientOnly>
      </nav>
      <main>{children}</main>
      <ClientTwo startAlert="Hey dorkface! I'm alerting you right now!">
        SHOUT IT OUT
      </ClientTwo>
      <Footer author={author} />
    </body>
  )
}
