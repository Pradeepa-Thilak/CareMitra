// frontend/src/components/Chatbot.jsx
import React, { useEffect, useRef, useState } from "react";
import { FiSend, FiCopy, FiCheck, FiArrowDown } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------------------------------------------
     Check scroll position to show scroll button
  --------------------------------------------- */
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show scroll button if user is scrolled up more than 200px
    setShowScrollButton(distanceFromBottom > 200);
  };

  /* ---------------------------------------------
     Manual scroll to bottom function
  --------------------------------------------- */
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  /* ---------------------------------------------
     Initial welcome message
  --------------------------------------------- */
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm CareMitra AI. I provide general healthcare guidance. I cannot diagnose or prescribe medicines. How can I help you today?",
      },
    ]);
  }, []);

  /* ---------------------------------------------
     Send Message with STREAMING (FIXED SPACING)
  --------------------------------------------- */
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const assistantId = `${Date.now()}-ai`;

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.content }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const token = line.replace("data:", "").trim();
          if (!token || token === "[DONE]") continue;

          // FIXED: Add space before token (except for punctuation)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { 
                    ...msg, 
                    content: msg.content + (
                      // Don't add space before punctuation or if content is empty
                      msg.content === "" || /^[.,!?;:]/.test(token) 
                        ? token 
                        : " " + token
                    )
                  }
                : msg
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("AI connection failed");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "Sorry, something went wrong. Please try again.",
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  /* ---------------------------------------------
     Copy message
  --------------------------------------------- */
  const copyText = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <FaRobot className="text-emerald-600 text-2xl" />
          <h1 className="text-xl font-bold">CareMitra AI</h1>
          <span className="ml-auto text-sm text-gray-500">
            Healthcare Assistant
          </span>
        </div>

        {/* Messages - NO AUTO SCROLL */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-6 relative"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-xl whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.content || (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}

                {m.role === "assistant" && m.content && (
                  <button
                    onClick={() => copyText(m.content, m.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {copiedId === m.id ? (
                      <>
                        <FiCheck /> Copied
                      </>
                    ) : (
                      <>
                        <FiCopy /> Copy
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />

          {/* Scroll to bottom button - Manual control only */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-32 right-8 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10 animate-bounce"
              aria-label="Scroll to bottom"
            >
              <FiArrowDown size={20} />
            </button>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4 bg-gray-50">
          <form onSubmit={handleSend} className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Ask a health question... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 border rounded-xl p-3 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
            >
              <FiSend />
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>

          <div className="mt-2 text-xs text-gray-500 text-center">
            💡 CareMitra AI provides general health information only. Always consult a doctor for medical advice.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;