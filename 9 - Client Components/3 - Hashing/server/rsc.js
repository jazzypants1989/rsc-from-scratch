import { createServer } from "http"
import { Fragment } from "react"

import Router from "./router.js"
import clientComponentTransform from "./clientTransform.js"

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    if (url.pathname.startsWith("/api/")) {
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

async function sendJSX(res, jsx) {
  const clientJSX = await renderJSXToClientJSX(jsx)
  const clientJSXString = JSON.stringify(clientJSX, stringifyJSX)
  res.setHeader("Content-Type", "application/json")
  res.end(clientJSXString)
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

export async function renderJSXToClientJSX(jsx) {
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
        const isClientComponent = Component.toString().includes("use client")
        if (isClientComponent) {
          console.log("full jsx of client component", jsx)
          return await clientComponentTransform(Component, props)
        } else {
          const returnedJsx = await Component(props)
          return renderJSXToClientJSX(returnedJsx)
        }
      } else {
        console.error(jsx)
        throw new Error("Not implemented.")
      }
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
  } else {
    console.error(jsx)
    throw new Error("Not implemented")
  }
}
