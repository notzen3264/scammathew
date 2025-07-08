const http = require("http");
const https = require("https");

const API_KEY = process.env.YOUTUBE_API_KEY;
const QUERY = "your api key just got scammed";
const CONCURRENCY = 5;
const DISPATCH_INTERVAL = 1000;

let lastResults = [];
let lastResponseRaw = null;

async function searchYouTube() {
    const options = {
        hostname: 'www.googleapis.com',
        path: `/youtube/v3/search?part=snippet&q=${encodeURIComponent(QUERY)}&type=video&maxResults=10&key=${API_KEY}`,
        method: 'GET',
        headers: {
            'Referer': 'https://obsidian-video-search.netlify.app',
            'User-Agent': 'Node.js Client', // optional but good practice
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            console.log(`Response Status: ${res.statusCode}`);
            console.log("Headers:");
            for (let [key, value] of Object.entries(res.headers)) {
                console.log(`  ${key}: ${value}`);
            }

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    lastResults = data.items || [];
                    lastResponseRaw = data;
                    console.log("Response Body:", JSON.stringify(data, null, 2));
                    console.log(`Got ${lastResults.length} videos`);
                    resolve();
                } catch (err) {
                    console.error("Error parsing response:", err.message);
                    reject(err);
                }
            });
        });

        req.on('error', (err) => {
            console.error("Error during request:", err.message);
            reject(err);
        });

        req.end();
    });
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
