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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setAnswer(data.answer);
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
        Requests are proxied through a serverless backend so the API key is never
        exposed to the browser.
      </footer>
    </div>
  );
}

export default App;