/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const register = require('react-server-dom-webpack/node-register');
register();
const babelRegister = require('@babel/register');

babelRegister({
  ignore: [/[\\\/](build|server|node_modules)[\\\/]/],
  presets: [['@babel/preset-react', {runtime: 'automatic'}]],
  plugins: ['@babel/transform-modules-commonjs'],
});

const express = require('express');
const compress = require('compression');
const {readFileSync} = require('fs');
const {unlink, writeFile} = require('fs').promises;
const {renderToPipeableStream} = require('react-server-dom-webpack/server');
const path = require("path")
const React = require("react")
const ReactApp = require("../src/App").default
const PORT = process.env.PORT || 4000
const app = express()
const {
  getNote,
  getNotes,
  insertNote,
  updateNote,
  deleteNote,
} = require("./db")

app.use(compress())
app.use(express.json())

app
  .listen(PORT, () => {
    console.log(`React Notes listening at ${PORT}...`)
  })
  .on("error", function(error) {
    if (error.syscall !== "listen") {
      throw error
    }
    const isPipe = (portOrPipe) => Number.isNaN(portOrPipe)
    const bind = isPipe(PORT) ? "Pipe " + PORT : "Port " + PORT
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges")
        process.exit(1)
        break
      case "EADDRINUSE":
        console.error(bind + " is already in use")
        process.exit(1)
        break
      default:
        throw error
    }
  })

function handleErrors(fn) {
  return async function(req, res, next) {
    try {
      return await fn(req, res)
    } catch (x) {
      next(x)
    }
  }
}

app.get(
  "/",
  handleErrors(async function(_req, res) {
    await waitForWebpack()
    const html = readFileSync(
      path.resolve(__dirname, "../build/index.html"),
      "utf8"
    )
    res.send(html)
  })
)

async function renderReactTree(res, props) {
  await waitForWebpack()
  const manifest = readFileSync(
    path.resolve(__dirname, "../build/react-client-manifest.json"),
    "utf8"
  )
  const moduleMap = JSON.parse(manifest)
  const { pipe } = renderToPipeableStream(
    React.createElement(ReactApp, props),
    moduleMap
  )
  pipe(res)
}

function sendResponse(req, res, redirectToId) {
  const location = JSON.parse(req.query.location)
  if (redirectToId) {
    location.selectedId = redirectToId
  }
  res.set("X-Location", JSON.stringify(location))
  renderReactTree(res, {
    selectedId: location.selectedId,
    isEditing: location.isEditing,
    searchText: location.searchText,
  })
}

app.get("/react", function(req, res) {
  sendResponse(req, res, null)
})

const NOTES_PATH = path.resolve(__dirname, "../notes")

app.post(
  "/notes",
  handleErrors(async function(req, res) {
    const newNote = {
      id: req.body.id,
      title: req.body.title,
      body: req.body.body,
    }
    const insertedNote = insertNote(newNote)
    await writeFile(
      path.resolve(NOTES_PATH, `${insertedNote.id}.md`),
      req.body.body,
      "utf8"
    )
    sendResponse(req, res, insertedNote.id)
  })
)

app.put(
  "/notes/:id",
  handleErrors(async function(req, res) {
    const updatedId = Number(req.params.id)
    const updatedFields = {
      title: req.body.title,
      body: req.body.body,
    }
    updateNote(updatedId, updatedFields)
    await writeFile(
      path.resolve(NOTES_PATH, `${updatedId}.md`),
      req.body.body,
      "utf8"
    )
    sendResponse(req, res, null)
  })
)

app.delete(
  "/notes/:id",
  handleErrors(async function(req, res) {
    const deletedId = Number(req.params.id)
    deleteNote(deletedId)
    await unlink(path.resolve(NOTES_PATH, `${req.params.id}.md`))
    sendResponse(req, res, null)
  })
)

app.get(
  "/notes",
  handleErrors(async function(_req, res) {
    const notes = getNotes()
    res.json(notes)
  })
)

app.get(
  "/notes/:id",
  handleErrors(async function(req, res) {
    const id = req.params.id
    const note = getNote(id)
    res.json(note)
  })
)

app.get("/sleep/:ms", function(req, res) {
  setTimeout(() => {
    res.json({ ok: true })
  }, req.params.ms)
})

app.use(express.static("build"))
app.use(express.static("public"))

async function waitForWebpack() {
  while (true) {
    try {
      readFileSync(path.resolve(__dirname, "../build/index.html"))
      return
    } catch (err) {
      console.log(
        "Could not find webpack build output. Will retry in five seconds..."
      )
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}