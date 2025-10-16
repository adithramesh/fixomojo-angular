export default async function handler(req, res) {
  const { q } = req.query;
  const LOCATION_IQ_API_KEY = 'pk.06165ee01186e3b07b09c63eac711fbb';

  console.log("🔍 LOCATION_IQ_API_KEY in runtime:", LOCATION_IQ_API_KEY ? "Found" : "Missing");

  if (!LOCATION_IQ_API_KEY) {
    return res.status(500).json({ error: "Missing LOCATION_IQ_API_KEY environment variable" });
  }

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  try {
    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?key=${LOCATION_IQ_API_KEY}&q=${encodeURIComponent(q)}&limit=5&format=json`
    );

    if (!response.ok) {
      throw new Error(`LocationIQ API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("🔥 Error in LocationIQ API:", error);
    return res.status(500).json({ error: "Failed to fetch location data" });
  }
}
