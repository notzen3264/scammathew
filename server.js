const fetch = require("node-fetch");

const API_KEY = process.env.YOUTUBE_API_KEY;
const QUERY = "funny cats";
const CONCURRENCY = 1000;

async function searchYouTube() {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        QUERY
    )}&type=video&maxResults=1&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Got ${data.items?.length || 0} videos`);
    } catch (err) {
        console.error("Error:", err.message);
    }
}

async function runFlood() {
    let counter = 0;
    setInterval(() => {
        for (let i = 0; i < CONCURRENCY; i++) {
            searchYouTube();
        }
        counter++;
        console.log(`Batch ${counter} dispatched`);
    }, 1000);
}

runFlood();
