import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const status = loading ? "Drafting response…" : answer ? "Draft ready" : "Ready";

  async function handleAsk() {
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 3000,
          stream: true,
          system:
            "You are a pre-sales proposal assistant. Given a procurement/RFP question, draft a clear, structured, professional answer suitable for a government or enterprise client.",
          messages: [{ role: "user", content: question }],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const event = JSON.parse(dataStr);
              if (
                event.type === "content_block_delta" &&
                event.delta?.type === "text_delta"
              ) {
                setAnswer((prev) => prev + event.delta.text);
              }
            } catch {
              // ignore non-JSON lines
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleAsk();
  }

  return (
    <div className="app">
      <header className="masthead">
        <div className="mark">RFP</div>
        <div className="masthead-text">
          <h1>Proposal Response Assistant</h1>
          <p>Draft structured answers to procurement &amp; RFP questions.</p>
        </div>
        <div className={`status status--${loading ? "busy" : answer ? "done" : "idle"}`}>
          <span className="status-dot" />
          {status}
        </div>
      </header>

      <main className="workspace">
        <section className="panel">
          <label className="panel-label" htmlFor="q">Question</label>
          <textarea
            id="q"
            className="question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Describe your approach to data residency and sovereignty for UAE government cloud workloads."
            rows={5}
          />
          <div className="actions">
            <span className="hint">⌘ / Ctrl + Enter to draft</span>
            <button className="draft-btn" onClick={handleAsk} disabled={loading || !question}>
              {loading ? "Drafting…" : "Draft response"}
            </button>
          </div>
        </section>

        {error && (
          <div className="error-bar" role="alert">
            <strong>Couldn’t draft a response.</strong> {error}
          </div>
        )}

        {(answer || loading) && (
          <section className="panel panel--output">
            <label className="panel-label">Drafted response</label>
            <div className="answer">
              {answer}
              {loading && <span className="cursor">▋</span>}
            </div>
          </section>
        )}
      </main>

      <footer className="footnote">
        Demo calls the Anthropic API directly from the browser. A production build
        would proxy requests through a backend so the API key is never exposed.
      </footer>
    </div>
  );
}

export default App;