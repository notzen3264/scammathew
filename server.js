const http = require("http");
const fetch = require("node-fetch");

const API_KEY = process.env.YOUTUBE_API_KEY;
const QUERY = "your api key just got scammed";
const CONCURRENCY = 5;
const DISPATCH_INTERVAL = 1000;

let lastResults = [];
let lastResponseRaw = null;

async function searchYouTube() {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        QUERY
    )}&type=video&maxResults=1&key=${API_KEY}`;

    try {
        const response = await fetch(url);

        // Log HTTP status and headers
        console.log(`Response Status: ${response.status}`);
        console.log("Headers:");
        for (let [key, value] of response.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        const data = await response.json();
        lastResults = data.items || [];
        lastResponseRaw = data;

        console.log("Response Body:", JSON.stringify(data, null, 2));
        console.log(`Got ${lastResults.length} videos`);
    } catch (err) {
        console.error("Error during fetch:", err.message);
    }
}

function runFlood() {
    let counter = 0;
    setInterval(() => {
        for (let i = 0; i < CONCURRENCY; i++) {
            searchYouTube();
        }
        counter++;
        console.log(`Batch ${counter} dispatched`);
    }, DISPATCH_INTERVAL);
}

const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/results") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ videos: lastResults, raw: lastResponseRaw }));
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

server.listen(8000, () => {
    console.log("Server listening on port 8000");
});

runFlood();
