"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Send,
  Phone,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useApp } from "./Providers";
import { authClient } from "@/lib/auth-client";

interface ChatMessageItem {
  id: number;
  conversationId: number;
  senderRole: "customer" | "admin" | string;
  senderName: string;
  body: string;
  createdAt: string;
}

interface ChatConversationItem {
  id: number;
  sessionKey: string;
  customerName: string;
  customerPhone: string | null;
  customerArea: string;
  status: string;
  unreadForCustomer: number;
}

const CHAT_SESSION_STORAGE_KEY = "sobji_chat_session_v1";

function getOrCreateChatSessionKey(): string {
  try {
    const existing = localStorage.getItem(CHAT_SESSION_STORAGE_KEY);
    if (existing && existing.length >= 12) return existing;
    const generated =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sobji-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(CHAT_SESSION_STORAGE_KEY, generated);
    return generated;
  } catch {
    return `sobji-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function formatChatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function LiveChatWidget() {
  const pathname = usePathname();
  const { lang, deliveryArea, showToast } = useApp();
  const { data: session } = authClient.useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState("");
  const [conversation, setConversation] = useState<ChatConversationItem | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSessionKey(getOrCreateChatSessionKey());
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    window.addEventListener("sobji:open-chat", openHandler);
    return () => window.removeEventListener("sobji:open-chat", openHandler);
  }, []);

  const fetchChat = useCallback(
    async (markRead: boolean) => {
      if (!sessionKey) return;
      try {
        const res = await fetch(
          `/api/chat?sessionKey=${encodeURIComponent(sessionKey)}${markRead ? "&markRead=1" : ""}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = await res.json();
        setConversation(json.conversation ?? null);
        setMessages(Array.isArray(json.messages) ? json.messages : []);
        setUnreadCount(
          markRead ? 0 : Number(json.conversation?.unreadForCustomer ?? 0)
        );
      } catch {
        // Silent retry on next poll
      }
    },
    [sessionKey]
  );

  useEffect(() => {
    if (!sessionKey || pathname?.startsWith("/admin")) return;
    const initTimer = setTimeout(() => {
      void fetchChat(isOpen);
    }, 0);

    const intervalMs = isOpen ? 4000 : 12000;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchChat(isOpen);
      }
    }, intervalMs);

    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
  }, [sessionKey, isOpen, pathname, fetchChat]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    }
  }, [isOpen, messages.length]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const sendMessageText = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sending || !sessionKey) return;
    setSending(true);
    try {
      const effectiveName = guestName.trim() || session?.user?.name || undefined;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionKey,
          name: effectiveName,
          phone: guestPhone.trim() || undefined,
          area: deliveryArea,
          message: trimmed,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || "Could not send message", "error");
        return;
      }
      setConversation(json.conversation ?? null);
      setMessages(Array.isArray(json.messages) ? json.messages : []);
      setUnreadCount(0);
      setDraft("");
    } catch {
      showToast(
        lang === "bn" ? "মেসেজ পাঠানো যায়নি, আবার চেষ্টা করুন" : "Failed to send message",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessageText(draft);
  };

  const quickTopics =
    lang === "bn"
      ? [
          "আমার অর্ডারটি এখন কোথায় আছে?",
          "সকালের ডেলিভারি স্লট কি খালি আছে?",
          "তাজা পণ্য বা রিপ্লেসমেন্ট সম্পর্কে জানতে চাই",
          "পাইকারি / বড় অর্ডার করতে চাই",
        ]
      : [
          "Where is my order right now?",
          "Are morning delivery slots open?",
          "Question about freshness or exchange",
          "Bulk / wholesale basket inquiry",
        ];

  return (
    <>
      {/* Floating Live Chat Trigger */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={lang === "bn" ? "লাইভ চ্যাট খুলুন" : "Open Live Chat"}
          className="no-print fixed bottom-20 right-4 z-40 inline-flex items-center gap-2.5 rounded-full bg-[#0f7b3f] px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-950/25 transition hover:scale-[1.03] hover:bg-[#0b5e30] md:bottom-6 md:right-6 cursor-pointer"
        >
          <span className="relative flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0f7b3f] bg-emerald-300" />
          </span>
          <span className="hidden sm:inline">
            {lang === "bn" ? "লাইভ চ্যাট" : "Live Chat"}
          </span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 tabular-nums text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expandable Live Chat Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={lang === "bn" ? "লাইভ সাপোর্ট চ্যাট" : "Live Support Chat"}
          className="no-print fixed bottom-20 left-4 right-4 z-50 flex h-[500px] max-h-[76vh] flex-col overflow-hidden rounded-2xl border border-emerald-950/15 bg-white shadow-2xl sm:left-auto sm:right-6 sm:w-[375px] md:bottom-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#0f7b3f] px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">
                  {lang === "bn" ? "sobji.com লাইভ সাপোর্ট" : "sobji.com Live Support"}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span>
                    {lang === "bn"
                      ? "অনলাইন · ঢাকা সাপোর্ট টিম"
                      : "Online · Fast Dhaka Support"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="tel:+8801885592511"
                title="Call +880 1885-592511"
                className="rounded-lg p-1.5 text-emerald-100 transition hover:bg-white/15 hover:text-white"
              >
                <Phone className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Live Chat"
                className="rounded-lg p-1.5 text-emerald-100 transition hover:bg-white/15 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conversation Status Notice */}
          {conversation?.status === "resolved" && (
            <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50/70 px-4 py-2 text-[11px] text-[#0f7b3f]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>
                {lang === "bn"
                  ? "এই চ্যাটটি সমাধান হয়েছে। নতুন মেসেজ পাঠালে আবার চালু হবে।"
                  : "Marked resolved. Send a message anytime to reopen."}
              </span>
            </div>
          )}

          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto bg-[#f8faf8] p-4 space-y-3">
            {/* Initial Greeting & Quick Setup */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#0f7b3f]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{lang === "bn" ? "স্বাগতম!" : "Welcome to sobji.com"}</span>
              </div>
              <p className="text-xs leading-relaxed text-gray-600">
                {lang === "bn"
                  ? "অর্ডার ট্র্যাকিং, তাজা সবজি, ডেলিভারি স্লট বা যেকোনো প্রশ্নে সরাসরি আমাদের টিমকে লিখুন।"
                  : "Ask us directly about order delivery, today's fresh harvest, slots, or substitutions."}
              </p>

              {!conversation && !session?.user && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={lang === "bn" ? "আপনার নাম" : "Your name"}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-[#0f7b3f] focus:bg-white focus:outline-none"
                  />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder={lang === "bn" ? "ফোন (ঐচ্ছিক)" : "Phone (optional)"}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-900 focus:border-[#0f7b3f] focus:bg-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            {messages.length === 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-gray-400 px-1">
                  {lang === "bn" ? "দ্রুত জিজ্ঞাসা করুন:" : "Quick topics:"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      disabled={sending}
                      onClick={() => void sendMessageText(topic)}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-left text-[11px] font-medium text-gray-700 transition hover:border-[#0f7b3f] hover:bg-emerald-50 hover:text-[#0f7b3f] cursor-pointer disabled:opacity-50"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isCustomer = msg.senderRole === "customer";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                >
                  <span className="mb-1 px-1 text-[10px] font-medium text-gray-400">
                    {isCustomer
                      ? lang === "bn"
                        ? "আপনি"
                        : "You"
                      : msg.senderName || "Support"}{" "}
                    · {formatChatTime(msg.createdAt)}
                  </span>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap shadow-2xs ${
                      isCustomer
                        ? "rounded-br-sm bg-[#0f7b3f] text-white"
                        : "rounded-bl-sm border border-gray-200/80 bg-white text-gray-800"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2.5"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                lang === "bn" ? "আপনার মেসেজ লিখুন..." : "Type your message..."
              }
              maxLength={1000}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#0f7b3f] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              aria-label={lang === "bn" ? "মেসেজ পাঠান" : "Send message"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f7b3f] text-white transition hover:bg-[#0b5e30] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
