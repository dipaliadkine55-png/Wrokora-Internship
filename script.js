const form = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const searchInput = document.getElementById("search");
const notesContainer = document.getElementById("notes");

let notes = [];

// Get notes from Node.js server
async function loadNotes() {
    const response = await fetch("/api/notes");
    notes = await response.json();

    displayNotes();
}

// Display notes
function displayNotes() {

    const searchText = searchInput.value.toLowerCase();

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchText) ||
        note.content.toLowerCase().includes(searchText)
    );

    notesContainer.innerHTML = "";

    filteredNotes.forEach(note => {

        const div = document.createElement("div");

        div.className = "note";

        div.innerHTML = `
            <h3>${escapeHTML(note.title)}</h3>

            <p>${escapeHTML(note.content)}</p>

            <button
                class="delete"
                onclick="deleteNote(${note.id})">
                Delete
            </button>
        `;

        notesContainer.appendChild(div);
    });
}

// Add note
form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    const response = await fetch("/api/notes", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title,
            content
        })
    });

    if (response.ok) {

        titleInput.value = "";
        contentInput.value = "";

        loadNotes();
    }
});

// Delete note
async function deleteNote(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    await fetch(`/api/notes/${id}`, {
        method: "DELETE"
    });

    loadNotes();
}

// Search
searchInput.addEventListener("input", displayNotes);

// Prevent HTML injection
function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

loadNotes();

