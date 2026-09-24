const teamContainer =
    document.getElementById("teamContainer");

const memberForm =
    document.getElementById("memberForm");

const nameInput =
    document.getElementById("name");

const roleInput =
    document.getElementById("role");

const lastUpdated =
    document.getElementById("lastUpdated");


// Load team members
async function loadTeam() {

    try {

        const response =
            await fetch("/api/team");

        const members =
            await response.json();

        displayTeam(members);

        lastUpdated.textContent =
            "Last updated: " +
            new Date().toLocaleTimeString();

    } catch (error) {

        console.error(error);

        teamContainer.innerHTML = `
            <p>Unable to load team members.</p>
        `;
    }
}


// Display team
function displayTeam(members) {

    teamContainer.innerHTML = "";

    if (members.length === 0) {

        teamContainer.innerHTML = `
            <p>No team members available.</p>
        `;

        return;
    }

    members.forEach(member => {

        const card =
            document.createElement("div");

        card.className = "member-card";

        const firstLetter =
            member.name
                .charAt(0)
                .toUpperCase();

        const statusClass =
            member.status.toLowerCase();

        card.innerHTML = `
            <div class="member-top">

                <div class="avatar">
                    ${firstLetter}
                </div>

                <div class="member-info">

                    <h3>
                        ${escapeHTML(member.name)}
                    </h3>

                    <p>
                        ${escapeHTML(member.role)}
                    </p>

                </div>

            </div>

            <div class="status ${statusClass}">
                ${member.status}
            </div>

            <div class="status-buttons">

                <button
                    onclick="updateStatus(
                        '${member._id}',
                        'Available'
                    )"
                >
                    Available
                </button>

                <button
                    onclick="updateStatus(
                        '${member._id}',
                        'Busy'
                    )"
                >
                    Busy
                </button>

                <button
                    onclick="updateStatus(
                        '${member._id}',
                        'Away'
                    )"
                >
                    Away
                </button>

            </div>

            <button
                class="delete-btn"
                onclick="deleteMember('${member._id}')"
            >
                Delete
            </button>
        `;

        teamContainer.appendChild(card);
    });
}


// Add member
memberForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const name =
            nameInput.value.trim();

        const role =
            roleInput.value.trim();

        try {

            const response =
                await fetch("/api/team", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        role
                    })
                });

            if (!response.ok) {
                throw new Error(
                    "Unable to add member"
                );
            }

            nameInput.value = "";
            roleInput.value = "";

            loadTeam();

        } catch (error) {

            console.error(error);

            alert(
                "Unable to add team member."
            );
        }
    }
);


// Update status
async function updateStatus(id, status) {

    try {

        const response =
            await fetch(
                `/api/team/${id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status
                    })
                }
            );

        if (!response.ok) {
            throw new Error(
                "Unable to update status"
            );
        }

        loadTeam();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to update member status."
        );
    }
}


// Delete member
async function deleteMember(id) {

    if (
        !confirm(
            "Delete this team member?"
        )
    ) {
        return;
    }

    try {

        await fetch(
            `/api/team/${id}`,
            {
                method: "DELETE"
            }
        );

        loadTeam();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete team member."
        );
    }
}


// Auto-refresh every 5 seconds
setInterval(() => {
    loadTeam();
}, 5000);


// Prevent HTML injection
function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// Initial load
loadTeam();