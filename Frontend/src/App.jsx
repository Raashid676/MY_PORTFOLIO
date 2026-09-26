import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./App.css";

// ---------------------------------------------------------
// FastAPI backend
// ---------------------------------------------------------

const API_BASE_URL = "https://your-portfolio-api.onrender.com";


// ---------------------------------------------------------
// Markdown renderer
// ---------------------------------------------------------

function renderContent(content) {
  if (!content) {
    return null;
  }

  // Defensive cleanup in case the model returns escaped Markdown.
  // Example:
  // \**text\**  -> **text**
  // \### Heading -> ### Heading
  // \- item -> - item
  // \--- -> ---
  const cleanedContent = content
    .replace(/\\\*\*/g, "**")
    .replace(/\\#/g, "#")
    .replace(/\\-/g, "-")
    .replace(/\\\|/g, "|")
    .replace(/\\_/g, "_");

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Prevent huge headings inside chat bubbles
        h1: ({ children }) => <h3>{children}</h3>,
        h2: ({ children }) => <h3>{children}</h3>,
        h3: ({ children }) => <h4>{children}</h4>,

        // Clean paragraphs
        p: ({ children }) => <p>{children}</p>,

        // Lists
        ul: ({ children }) => <ul>{children}</ul>,
        ol: ({ children }) => <ol>{children}</ol>,

        // Code
        code: ({ inline, children }) => {
          if (inline) {
            return <code>{children}</code>;
          }

          return (
            <pre>
              <code>{children}</code>
            </pre>
          );
        },

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),

        // Tables
        table: ({ children }) => (
          <div className="chat-table-wrapper">
            <table>{children}</table>
          </div>
        ),
      }}
    >
      {cleanedContent}
    </ReactMarkdown>
  );
}


// =========================================================
// PORTFOLIO CHAT
// =========================================================

export default function PortfolioChat() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm Raashid's portfolio assistant. Ask me about his skills, projects, or education.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);


  // =======================================================
  // AUTO SCROLL
  // =======================================================

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);


  // =======================================================
  // SEND MESSAGE
  // =======================================================

  async function sendMessage(e) {

    e.preventDefault();

    const question = input.trim();

    if (!question || isLoading) {
      return;
    }


    // -----------------------------------------------------
    // Add user message
    // -----------------------------------------------------

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);


    // -----------------------------------------------------
    // Clear input
    // -----------------------------------------------------

    setInput("");
    setIsLoading(true);
    setError(null);


    // -----------------------------------------------------
    // Add empty assistant message
    //
    // This message will be filled progressively while
    // the FastAPI backend streams the LLM response.
    // -----------------------------------------------------

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);


    try {

      // ---------------------------------------------------
      // Request
      // ---------------------------------------------------

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          question,
        }),
      });


      // ---------------------------------------------------
      // HTTP error
      // ---------------------------------------------------

      if (!res.ok) {
        throw new Error(
          `Server responded with ${res.status}`
        );
      }


      // ---------------------------------------------------
      // Make sure streaming is available
      // ---------------------------------------------------

      if (!res.body) {
        throw new Error(
          "Streaming response is not available."
        );
      }


      // ---------------------------------------------------
      // Create stream reader
      // ---------------------------------------------------

      const reader = res.body.getReader();

      const decoder = new TextDecoder();

      let answer = "";


      // ===================================================
      // READ STREAM
      // ===================================================

      while (true) {

        const { done, value } = await reader.read();

        if (done) {
          break;
        }


        // Convert bytes to text
        const chunk = decoder.decode(value, {
          stream: true,
        });


        // Add new chunk
        answer += chunk;


        // -------------------------------------------------
        // Update assistant message
        // -------------------------------------------------

        setMessages((prev) => {

          const updated = [...prev];

          const lastIndex = updated.length - 1;

          updated[lastIndex] = {
            role: "assistant",
            content: answer,
          };

          return updated;
        });
      }


      // ===================================================
      // FLUSH DECODER
      // ===================================================

      const finalChunk = decoder.decode();

      if (finalChunk) {

        answer += finalChunk;

        setMessages((prev) => {

          const updated = [...prev];

          const lastIndex = updated.length - 1;

          updated[lastIndex] = {
            role: "assistant",
            content: answer,
          };

          return updated;
        });
      }

    } catch (err) {

      console.error("Chat error:", err);


      // ---------------------------------------------------
      // Remove incomplete assistant message
      // ---------------------------------------------------

      setMessages((prev) => {

        const updated = [...prev];

        if (
          updated.length > 0 &&
          updated[updated.length - 1].role === "assistant"
        ) {
          updated.pop();
        }

        return updated;
      });


      setError(
        "Couldn't reach the assistant. Make sure the backend is running."
      );

    } finally {

      setIsLoading(false);

      inputRef.current?.focus();
    }
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="chat-app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="chat-app-header">

        <div className="chat-app-header-inner">

          <div
            className="chat-avatar"
            aria-hidden="true"
          >
            MR
          </div>

          <div>

            <p className="chat-app-name">
              Mohammad Raashid
            </p>

            <p className="chat-app-status">

              <span className="status-dot" />

              Portfolio assistant &middot; online

            </p>

          </div>

        </div>

      </header>


      {/* =================================================
          MESSAGES
      ================================================= */}

      <main className="chat-app-messages">

        <div className="chat-app-messages-inner">

          {messages.map((msg, i) => (

            <div
              key={i}
              className={`chat-row ${
                msg.role === "user"
                  ? "chat-row-user"
                  : "chat-row-assistant"
              }`}
            >

              <div
                className={`chat-bubble ${
                  msg.role === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-assistant"
                }`}
              >

                {/* ---------------------------------------
                    Assistant streaming indicator
                    Only shown before first token
                --------------------------------------- */}

                {msg.role === "assistant" &&
                isLoading &&
                i === messages.length - 1 &&
                msg.content === "" ? (

                  <div className="chat-bubble-typing">

                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />

                  </div>

                ) : (

                  renderContent(msg.content)

                )}

              </div>

            </div>

          ))}


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="chat-error">
              {error}
            </div>
          )}


          {/* Scroll anchor */}

          <div ref={scrollRef} />

        </div>

      </main>


      {/* =================================================
          INPUT
      ================================================= */}

      <form
        className="chat-app-input-row"
        onSubmit={sendMessage}
      >

        <div className="chat-app-input-inner">

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skills, projects, education…"
            className="chat-input"
            disabled={isLoading}
            autoFocus
          />

          <button
            type="submit"
            className="chat-send-btn"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>

        </div>

      </form>

    </div>
  );
}