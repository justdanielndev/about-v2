import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const text =
    `*New message from the website* :envelope:\n` +
    `*Name:* ${name}\n` +
    `*Email:* ${email}\n` +
    `*Message:* ${message}`;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`Slack ${res.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Slack notification failed:", err);
    return NextResponse.json({ error: "Failed to notify" }, { status: 502 });
  }
}
