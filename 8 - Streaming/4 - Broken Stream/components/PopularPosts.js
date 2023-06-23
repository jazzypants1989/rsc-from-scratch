import * as React from "react"

import { readFile, writeFile } from "fs/promises"

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

export default async function PopularPosts() {
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

  setTimeout(() => {
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
  }, 1000)
}
