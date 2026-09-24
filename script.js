const coffeeContainer =
    document.getElementById("coffeeContainer");

const leaderboard =
    document.getElementById("leaderboard");


// Load coffees
async function loadCoffees() {

    try {

        const response =
            await fetch("/api/coffees");

        if (!response.ok) {
            throw new Error(
                "Unable to load coffees"
            );
        }

        const coffees =
            await response.json();

        displayCoffees(coffees);

        displayLeaderboard(coffees);

    } catch (error) {

        console.error(error);

        coffeeContainer.innerHTML = `
            <p>
                Unable to load coffee ratings.
            </p>
        `;
    }
}


// Display coffee cards
function displayCoffees(coffees) {

    coffeeContainer.innerHTML = "";

    coffees.forEach(coffee => {

        const card =
            document.createElement("div");

        card.className = "coffee-card";

        card.innerHTML = `
            <div class="coffee-icon">
                ☕
            </div>

            <h2>
                ${escapeHTML(coffee.name)}
            </h2>

            <p class="description">
                ${escapeHTML(coffee.description)}
            </p>

            <p class="vote-count">
                ⭐ ${coffee.votes} votes
            </p>

            <button
                class="vote-btn"
                data-id="${coffee._id}"
            >
                Vote
            </button>
        `;

        const button =
            card.querySelector(".vote-btn");

        button.addEventListener(
            "click",
            () => voteCoffee(
                coffee._id,
                button
            )
        );

        coffeeContainer.appendChild(card);
    });
}


// Vote for coffee
async function voteCoffee(id, button) {

    button.disabled = true;

    button.textContent = "Voting...";

    try {

        const response =
            await fetch(
                `/api/coffees/${id}/vote`,
                {
                    method: "POST"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Unable to record vote"
            );
        }

        /*
         * Reload the data without
         * refreshing the page.
         */
        await loadCoffees();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to record your vote."
        );

        button.disabled = false;

        button.textContent = "Vote";
    }
}


// Leaderboard
function displayLeaderboard(coffees) {

    leaderboard.innerHTML = "";

    const sorted =
        [...coffees]
            .sort(
                (a, b) =>
                    b.votes - a.votes
            )
            .slice(0, 5);

    if (sorted.length === 0) {

        leaderboard.innerHTML =
            "<p>No ratings yet.</p>";

        return;
    }

    sorted.forEach((coffee, index) => {

        const item =
            document.createElement("div");

        item.className = "leader-item";

        item.innerHTML = `
            <div>
                <span class="rank">
                    #${index + 1}
                </span>

                ${escapeHTML(coffee.name)}
            </div>

            <span class="leader-votes">
                ⭐ ${coffee.votes}
            </span>
        `;

        leaderboard.appendChild(item);
    });
}


// Prevent HTML injection
function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// Initial load
loadCoffees();