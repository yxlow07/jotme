let allstars = document.getElementsByClassName("backgroundstar");

// random top and left for each star
for (let i = 0; i < allstars.length; i++) {
    let top = Math.floor(Math.random() * 60) + 20 + "%";
    let left = Math.floor(Math.random() * 60) + 20 + "%";
    allstars[i].style.top = top;
    allstars[i].style.left = left;
}

function processMoodColors() {
    let allmoodcards = document.getElementsByClassName("moodscore");

    for (let i = 0; i < allmoodcards.length; i++) {
        let score = allmoodcards[i].innerText;
        if (score < 25) {
            allmoodcards[i].style.backgroundColor = "red";
        } else if (score < 50) {
            allmoodcards[i].style.backgroundColor = "darkorange";
        } else if (score < 75) {
            allmoodcards[i].style.backgroundColor = "yellow";
            allmoodcards[i].style.color = "black";
        } else {
            allmoodcards[i].style.backgroundColor = "green";
        }
    }
}

async function fetchEntries() {
    try {
        const response = await fetch("http://127.0.0.1:8000/list_all");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        renderEntries(data.entries);
    } catch (error) {
        console.error("There has been a problem with the fetch operation:", error);
    }
}

async function fetchSuggestedPrompts() {
    try {
        const response = await fetch("http://127.0.1:8000/suggestive_prompts");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const promptContainer = document.getElementById("suggestedprompts");
        data.prompts.forEach(prompt => {
            const promptP = document.createElement("p");
            promptP.innerText = prompt;
            promptContainer.insertBefore(promptP, promptContainer.firstChild);
        });
    }
    catch (error) {
        console.error("There has been a problem with the fetch operation:", error);
    }
}

function renderEntries(entries) {
    const entriesContainer = document.getElementById("entries");
    while (entriesContainer.children.length > 2) {
        entriesList.removeChild(entriesList.lastChild);
    }
    entries.forEach(entry => {
        const entryDiv = document.createElement("div");
        entryDiv.className = "entry glossy";

        const entryName = document.createElement("h4");
        entryName.className = "entryname";
        entryName.innerText = entry.title;

        const moodWrap = document.createElement("div");
        moodWrap.className = "moodscore-wrap";
        moodWrap.style.display = "flex";
        moodWrap.style.alignItems = "center";
        moodWrap.style.gap = "6px";

        const moodScore = document.createElement("p");
        moodScore.className = "moodscore";
        moodScore.innerText = entry.mood_score;

        entryDiv.appendChild(entryName);

        if (entry.mood_score < 40) {
            const warningIcon = document.createElement("i");
            warningIcon.className = "fa-solid fa-triangle-exclamation moodscore";
            warningIcon.style.marginLeft = "8px";
            warningIcon.style.color = "orange";
            moodWrap.appendChild(warningIcon);
        }
        
        moodWrap.appendChild(moodScore);
        entryDiv.appendChild(moodWrap);

        entryDiv.addEventListener("click", () => {
            document.getElementById("nameofentry").value = entry.title;
            document.getElementById("dateofentry").value = entry.date;
            // convert \n to new lines
            entry.text = entry.text.split("\\n").join("\n");
            document.getElementById("entrytext").value = entry.text;
            document.getElementById("suggestedprompts").style.display = "none";
            document.getElementById("entrytext").setAttribute("readonly", "true");
        });

        entriesContainer.insertBefore(entryDiv, entriesContainer.children[2]);
    });
    processMoodColors();
}

function saveEntry() {
    let title = document.getElementById("nameofentry").value;
    let date = document.getElementById("dateofentry").value;
    let content = document.getElementById("entrytext").value;
    if (!title || !date || !content) {
        alert("Please fill in title, date and content.");
        return;
    }

    content = content.split("\n").join("\\n");

    const response = fetch("http://127.0.1:8000/save_diary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            date: date,
            text: content
        })
    });

    response.then(res => {
        if (res.ok) {
            alert("Entry saved successfully!");
            document.getElementById("nameofentry").value = "";
            document.getElementById("dateofentry").value = "";
            document.getElementById("entrytext").value = "";
            fetchEntries();
        } else {
            alert("Failed to save entry. Please try again.");
        }
    }).catch(error => {
        console.error("Error saving entry:", error);
        alert("There was an error saving your entry. Please try again later.");
    });

    document.getElementById("nameofentry").value = "";
    document.getElementById("dateofentry").value = "";
    document.getElementById("entrytext").value = "";

    fetchEntries();
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addEntry() {
    document.getElementById("nameofentry").value = "";
    document.getElementById("dateofentry").value = getCurrentDate();
    document.getElementById("entrytext").value = "";
    document.getElementById("suggestedprompts").style.display = "block";
    document.getElementById("entrytext").removeAttribute("readonly");
}

addEntry();
fetchEntries();
fetchSuggestedPrompts();