export default async function handler(req, res) {
  const { lat, lon } = req.query;
  const key ='pk.06165ee01186e3b07b09c63eac711fbb';

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon" });
  }

  try {
    const response = await fetch(
      `https://api.locationiq.com/v1/reverse?key=${key}&lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Reverse lookup failed" });
  }
}
