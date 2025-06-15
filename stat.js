let allstars = document.getElementsByClassName("backgroundstar");

for (let i = 0; i < allstars.length; i++) {
    let top = Math.floor(Math.random() * 100) + 10 + "%";
    let left = Math.floor(Math.random() * 60) + "%";
    allstars[i].style.top = top;
    allstars[i].style.left = left;
}

async function fetchEntries() {
    try {
        const response = await fetch("http://127.0.0.1:8000/list_all");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        updateStats(data.entries);
        plotMoodScores(data.entries);
    } catch (error) {
        console.error("There has been a problem with your fetch operation:", error);
    }
}

function getTopEmotion(emotions) {
    if (!emotions || typeof emotions !== "object") return { name: "neutral", value: 0 };
    let top = { name: "neutral", value: -Infinity };
    for (const [key, value] of Object.entries(emotions)) {
        if (value > top.value) {
            top = { name: key, value };
        }
    }
    return top;
}

function emotionToEmoji(emotion) {
    switch (emotion) {
        case "joy": return "😄";
        case "anger": return "😠";
        case "neutral": return "😐";
        case "surprise": return "😲";
        case "disgust": return "🤢";
        case "sadness": return "😢";
        case "fear": return "😨";
        default: return "🙂";
    }
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function softmax(obj) {
    const values = Object.values(obj);
    if (values.length === 0) return {};
    const max = Math.max(...values);
    const exps = values.map(v => Math.exp(v - max));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    const keys = Object.keys(obj);
    const result = {};
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = exps[i] / sumExp;
    }
    return result;
}


function updateStats(entries) {
    const totalEntries = entries.length;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const latestWeekEntries = entries
        .filter(e => e.emotions && e.mood_score)
        .filter(e => {
            const entryDate = new Date(e.date);
            return entryDate >= startOfWeek && entryDate < endOfWeek;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const weekEntries = latestWeekEntries.length;
    const weekMoodSum = latestWeekEntries.reduce((sum, e) => sum + (Number(e.mood_score) || 0), 0);

    const avgMood = weekEntries > 0 ? (weekMoodSum / weekEntries) : 0;
    document.querySelectorAll('.birdseyestats .box')[0].querySelector('h2').innerText = totalEntries;
    document.querySelectorAll('.birdseyestats .box')[1].querySelector('h2').innerText = weekEntries;
    document.querySelectorAll('.birdseyestats .box')[2].querySelector('h2').innerText = weekEntries > 0 ? (avgMood).toFixed(0) + " / 100" : "N/A";

    const topEmotionCounts = {};
    latestWeekEntries.forEach(entry => {
        const topEmotion = getTopEmotion(entry.emotions);
        if (!topEmotionCounts[topEmotion.name]) topEmotionCounts[topEmotion.name] = 0;
        topEmotionCounts[topEmotion.name]++;
    });

    const emotionPercents = softmax(topEmotionCounts);

    const moodcardsDiv = document.querySelector('.moodcards');
    moodcardsDiv.innerHTML = "";
    Object.entries(emotionPercents)
        .sort((a, b) => b[1] - a[1])
        .forEach(([emotion, percent]) => {
            const card = document.createElement('h4');
            card.className = 'glossy';
            card.innerText = `${capitalize(emotion)}: ${(percent * 100).toFixed(0)}`;
            moodcardsDiv.appendChild(card);
        });

    const emojiCounts = {};
    for (const entry of latestWeekEntries) {
        const topEmotion = getTopEmotion(entry.emotions);
        const emoji = emotionToEmoji(topEmotion.name);
        if (!emojiCounts[emoji]) emojiCounts[emoji] = 0;
        emojiCounts[emoji]++;
    }

    const uniqueEmojis = Object.keys(emojiCounts)
        .map(emoji => ({
            emoji,
            count: emojiCounts[emoji],
            latestIndex: latestWeekEntries.findIndex(entry => emotionToEmoji(getTopEmotion(entry.emotions).name) === emoji)
        }))
        .sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.latestIndex - b.latestIndex;
        })
        .map(e => e.emoji)
        .slice(0, 5);

    const emojiIds = ['mainemoji', 'subemoji1', 'subemoji2', 'smallemoji1', 'smallemoji2'];
    for (let i = 0; i < emojiIds.length; i++) {
        const el = document.getElementById(emojiIds[i]);
        if (uniqueEmojis[i]) {
            el.innerText = uniqueEmojis[i];
            el.style.visibility = "visible";
        } else {
            el.innerText = "";
            el.style.visibility = "hidden";
        }
    }
}

function plotMoodScores(entries) {
    if (!entries || entries.length === 0) return;

    const sorted = entries
        .filter(e => e.date && typeof e.mood_score !== "undefined")
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sorted.map(e => e.date);
    const data = sorted.map(e => Number(e.mood_score));

    const xLabels = labels.map((label, idx) => {
        if (idx === 0) return label;
        if (idx === labels.length - 1) return label;
        return "";
    });

    if (window.moodChart) window.moodChart.destroy();

    const ctx = document.getElementById('sentimentChart');
    window.moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [{
                label: 'Mood Score',
                data: data,
                fill: false,
                borderColor: '#af59ff',
                backgroundColor: '#af59ff',
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#af59ff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Date' },
                    ticks: {
                        autoSkip: false,
                        callback: function (value, index) {
                            return xLabels[index];
                        }
                    },
                    grid: { display: false }
                },
                y: {
                    title: { display: true, text: 'Mood Score' },
                    beginAtZero: true,
                    suggestedMax: 100
                }
            }
        }
    });
}

fetchEntries();

async function fetchMonthlySummary() {
    try {
        const response = await fetch("http://127.0.0.1:8000/monthly_summary");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        displayMonthlySummary(data.summary);
    } catch (error) {
        console.error("There has been a problem with your fetch operation:", error);
    }
}

function displayMonthlySummary(summary) {
    const suggestionBox = document.querySelector('.suggestion.glossy');
    suggestionBox.appendChild(document.createElement('p')).innerText = summary || "No summary available.";
}

fetchMonthlySummary();