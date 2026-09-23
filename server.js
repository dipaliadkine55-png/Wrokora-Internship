const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const NOTES_FILE = './notes.json';

const loadNotes = () => {
  if (!fs.existsSync(NOTES_FILE)) return [];
  return JSON.parse(fs.readFileSync(NOTES_FILE));
};

const saveNotes = (notes) => {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
};

app.get('/notes', (req, res) => {
  res.json(loadNotes());
});

app.post('/notes', (req, res) => {
  const notes = loadNotes();
  const newNote = { id: Date.now(), text: req.body.text };
  notes.push(newNote);
  saveNotes(notes);
  res.json(newNote);
});

app.delete('/notes/:id', (req, res) => {
  let notes = loadNotes();
  notes = notes.filter(note => note.id != req.params.id);
  saveNotes(notes);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on port 3000'));
