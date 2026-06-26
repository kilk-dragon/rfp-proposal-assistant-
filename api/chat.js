export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: "Missing question" });
    }

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 3000,
                system:
                    "You are a pre-sales proposal assistant. Given a procurement/RFP question, draft a clear, structured, professional answer suitable for a government or enterprise client.",
                messages: [{ role: "user", content: question }],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "Request failed",
            });
        }

        return res.status(200).json({ answer: data.content[0].text });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}