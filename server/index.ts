import http from "node:http";

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

if (!SLACK_WEBHOOK) {
  console.error("Missing SLACK_WEBHOOK_URL env var");
  process.exit(1);
}

const PORT = Number(process.env.PORT ?? 4001);

async function sendSlackDm(payload: {
  name: string;
  email: string;
  message: string;
}) {
  const text =
    `*New message from the website* :envelope:\n` +
    `*Name:* ${payload.name}\n` +
    `*Email:* ${payload.email}\n` +
    `*Message:* ${payload.message}`;

  const res = await fetch(SLACK_WEBHOOK!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`Slack responded ${res.status}`);
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST" || req.url !== "/contact") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  let body = "";
  req.on("data", (chunk) => { body += chunk; });

  req.on("end", async () => {
    try {
      const { name, email, message } = JSON.parse(body);

      if (!name || !email || !message) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing name, email, or message" }));
        return;
      }

      await sendSlackDm({ name, email, message });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error("Error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to send notification" }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Contact notification server listening on port ${PORT}`);
});
