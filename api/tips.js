const KEY = "dannywash:tips:cents";
const TIP_CENTS = 6;
const MAX_ABS_CENTS = 50000;

function kvConfig() {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!base || !token) {
    throw new Error("Tip store is not configured");
  }
  return { base: base.replace(/\/$/, ""), token };
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
    throw new Error(data.error || "Tip store request failed");
  }
  return Number(data.result) || 0;
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

function parseDeltaCents(body) {
  if (body == null || body.cents == null || body.cents === "") {
    return TIP_CENTS;
  }
  const n = Number(body.cents);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n === 0) {
    return null;
  }
  if (Math.abs(n) > MAX_ABS_CENTS) {
    return null;
  }
  return n;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");

  try {
    if (req.method === "GET") {
      const cents = await kvCommand(["GET", KEY]);
      return res.status(200).json({ cents: Math.max(0, cents) });
    }

    if (req.method === "POST") {
      const delta = parseDeltaCents(readBody(req));
      if (delta == null) {
        return res.status(400).json({ error: "Invalid cents" });
      }
      let cents = await kvCommand(["INCRBY", KEY, delta]);
      if (cents < 0) {
        await kvCommand(["SET", KEY, "0"]);
        cents = 0;
      }
      return res.status(200).json({ cents });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: "Tip store unavailable" });
  }
}
