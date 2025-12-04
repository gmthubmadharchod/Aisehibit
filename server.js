import express from "express";
import { exec } from "child_process";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Auto header guesser
function guessHeaders(url) {
    if (url.includes("appx")) {
        return ' --header="referer: https://appx.co.in/" ';
    } else if (url.includes("static-db")) {
        return ' --header="referer: https://static-db.app/" ';
    } else if (url.includes("akamakai") || url.includes("akamai")) {
        return ' --header="referer: https://player.akamai.net.in/" ';
    }
    return ' --header="referer: https://google.com/" ';
}

// Extension detector
function ext(url) {
    let clean = url.split("?")[0];
    return clean.split(".").pop();
}

app.post("/test", (req, res) => {
    const url = req.body.url;

    if (!url) return res.json({ error: "URL missing" });

    const extension = ext(url);
    const headers = guessHeaders(url);

    const cmd = `aria2c -x 16 -s 16 -k 1M ${headers} -o test.${extension} "${url}"`;

    // Run aria2c command
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            return res.json({
                success: false,
                cmd,
                output: stderr
            });
        }

        // Delete downloaded file
        exec(`rm test.${extension}`);

        res.json({
            success: true,
            cmd,
            output: stdout
        });
    });
});

// Render.com PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
