const KEY = "dannywash:reviews:latest";
const MAX_REVIEWS = 10;
const MAX_COMMENT = 280;

function kvConfig() {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!base || !token) {
    throw new Error("Review store is not configured");
  }
  return { base: base.replace(/\/$/, ""), token };
}

async function kvPipeline(commands) {
  const { base, token } = kvConfig();
  const response = await fetch(`${base}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Review store request failed");
  }
  return data;
}

async function kvCommand(parts) {
  const { base, token } = kvConfig();
  const path = parts.map((part) => encodeURIComponent(String(part))).join("/");
  const response = await fetch(`${base}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Review store request failed");
  }
  return data.result;
}

function parseReview(raw) {
  try {
    const item = typeof raw === "string" ? JSON.parse(raw) : raw;
    const stars = Math.max(1, Math.min(5, Number(item.stars) || 0));
    const comment = String(item.comment || "").trim().slice(0, MAX_COMMENT);
    if (!stars) return null;
    return {
      stars,
      comment,
      at: Number(item.at) || Date.now(),
    };
  } catch {
    return null;
  }
}

function readBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");

  try {
    if (req.method === "GET") {
      const rows = (await kvCommand(["LRANGE", KEY, "0", String(MAX_REVIEWS - 1)])) || [];
      const reviews = (Array.isArray(rows) ? rows : [])
        .map(parseReview)
        .filter(Boolean);
      return res.status(200).json({ reviews });
    }

    if (req.method === "POST") {
      const body = readBody(req);
      const stars = Math.max(1, Math.min(5, Math.round(Number(body.stars) || 0)));
      const comment = String(body.comment || "").replace(/\s+/g, " ").trim().slice(0, MAX_COMMENT);
      if (!stars) {
        return res.status(400).json({ error: "Stars required" });
      }

      const review = {
        stars,
        comment,
        at: Date.now(),
      };

      await kvPipeline([
        ["LPUSH", KEY, JSON.stringify(review)],
        ["LTRIM", KEY, "0", String(MAX_REVIEWS - 1)],
      ]);

      const rows = (await kvCommand(["LRANGE", KEY, "0", String(MAX_REVIEWS - 1)])) || [];
      const reviews = (Array.isArray(rows) ? rows : [])
        .map(parseReview)
        .filter(Boolean);
      return res.status(200).json({ reviews });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: "Review store unavailable" });
  }
}
