const KEY = "dannywash:tips:cents";
const TIP_CENTS = 6;

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

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");

  try {
    if (req.method === "GET") {
      const cents = await kvCommand(["GET", KEY]);
      return res.status(200).json({ cents });
    }

    if (req.method === "POST") {
      const cents = await kvCommand(["INCRBY", KEY, TIP_CENTS]);
      return res.status(200).json({ cents });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: "Tip store unavailable" });
  }
}
