const http = require("http");
const fetch = require("node-fetch");

const API_KEY = process.env.YOUTUBE_API_KEY;
const QUERY = "scam";
const CONCURRENCY = 1;
const DISPATCH_INTERVAL = 10000;

let lastResults = [];

async function searchYouTube() {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        QUERY
    )}&type=video&maxResults=1&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        lastResults = data.items || [];
        console.log(`Got ${lastResults.length} videos`);
    } catch (err) {
        console.error("Error:", err.message);
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
        res.end(JSON.stringify({ videos: lastResults }));
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

server.listen(8000, () => {
    console.log("Server listening on port 8000");
});

runFlood();
