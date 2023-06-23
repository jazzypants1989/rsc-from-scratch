const fs = require("fs")
const path = require("path")
const NOTES_PATH = path.resolve(__dirname, "../notes")

function readNotes() {
  const notesFilePath = path.resolve(NOTES_PATH, "notes.json")
  const notesRawData = fs.existsSync(notesFilePath)
    ? fs.readFileSync(notesFilePath, "utf8")
    : "[]"
  return JSON.parse(notesRawData)
}

function writeNotes(notes) {
  const notesFilePath = path.resolve(NOTES_PATH, "notes.json")
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), "utf8")
}

function getNotes() {
  return readNotes()
}

function getNote(id) {
  const notes = readNotes()
  console.log(notes, "notes in getNote")
  const note = notes.find((note) => note.id === Number(id))
  console.log("note in getNote", note)
  if (!note) {
    throw new Error(`Note with ID: ${id} not found`)
  }
  return note
}

function insertNote(note) {
  const notes = readNotes()
  const id = notes.length ? Math.max(...notes.map((note) => note.id)) + 1 : 1
  const newNote = {
    ...note,
    id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  notes.push(newNote)
  writeNotes(notes)
  return newNote
}

function updateNote(id, updatedFields) {
  const notes = readNotes()
  const noteIndex = notes.findIndex((note) => note.id === id)
  if (noteIndex < 0) {
    throw new Error(`Note with ID: ${id} not found`)
  }
  notes[noteIndex] = {
    ...notes[noteIndex],
    ...updatedFields,
    updated_at: new Date().toISOString(),
  }
  writeNotes(notes)
}

function deleteNote(id) {
  const notes = readNotes()
  const noteIndex = notes.findIndex((note) => note.id === id)
  if (noteIndex < 0) {
    throw new Error(`Note with ID: ${id} not found`)
  }
  notes.splice(noteIndex, 1)
  writeNotes(notes)
}

function searchNotes(query) {
  const notes = readNotes()
  return notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.body.toLowerCase().includes(query.toLowerCase())
    )
  })
}

module.exports = {
  getNote,
  getNotes,
  insertNote,
  updateNote,
  deleteNote,
  searchNotes,
}
