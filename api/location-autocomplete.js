export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  const LOCATION_IQ_API_KEY = process.env.LOCATION_IQ_API_KEY;

  try {
    const response = await fetch(
      `https://api.locationiq.com/v1/autocomplete?key=${LOCATION_IQ_API_KEY}&q=${encodeURIComponent(
        q
      )}&limit=5&format=json`
    );

    if (!response.ok) {
      throw new Error(`LocationIQ API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching from LocationIQ:", error);
    res.status(500).json({ error: "Failed to fetch location data" });
  }
}
