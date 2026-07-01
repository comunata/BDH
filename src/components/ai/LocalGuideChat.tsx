"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

export function LocalGuideChat({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(question?: string) {
    const q = (question ?? input).trim();
    if (!q || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/local-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, locale }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: dict.errors.generic }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions =
    locale === "ro"
      ? ["Ce pot vizita în zonă?", "Unde mâncăm?", "Ce facem cu copiii?", "Ce facem dacă plouă?", "Fă-mi un plan pentru 3 zile."]
      : ["What can I visit nearby?", "Where should we eat?", "What can we do with kids?", "What if it rains?", "Plan me 3 days here."];

  return (
    <div className="rounded-sm border border-platinum/15 bg-graphite p-6 md:p-8">
      <p className="font-display text-2xl text-ivory">{dict.ai.localGuide.title}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full border border-champagne/30 px-3 py-1.5 text-xs text-champagne hover:bg-champagne/10">
            {s}
          </button>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="mt-6 max-h-80 space-y-3 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-sm font-medium text-champagne" : "text-sm text-ivory"}>
              {m.content}
            </div>
          ))}
          {loading && <p className="text-xs text-stone">{dict.common.loading}</p>}
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={dict.ai.localGuide.placeholder}
          className="flex-1 rounded-sm border border-platinum/20 bg-midnight px-4 py-3 text-sm text-ivory placeholder:text-stone focus:border-champagne focus:outline-none"
        />
        <button onClick={() => send()} className="rounded-sm bg-champagne px-5 text-xs font-medium uppercase tracking-widest text-midnight">
          →
        </button>
      </div>
    </div>
  );
}
