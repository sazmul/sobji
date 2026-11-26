"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircle,
  Search,
  Send,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Phone,
  MapPin,
  RefreshCw,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useApp } from "./Providers";

export interface AdminChatConversation {
  id: number;
  sessionKey: string;
  userId: string | null;
  customerName: string;
  customerPhone: string | null;
  customerArea: string;
  status: string;
  unreadForAdmin: number;
  unreadForCustomer: number;
  lastMessageText: string | null;
  lastMessageAt: string;
  createdAt: string;
}

interface AdminChatMessage {
  id: number;
  conversationId: number;
  senderRole: string;
  senderName: string;
  body: string;
  createdAt: string;
}

interface AdminChatConsoleProps {
  onUnreadChange?: (unreadCount: number) => void;
}

const CANNED_REPLIES = [
  "Hello! We are checking your order status right now and will update you shortly.",
  "Your morning delivery slot is confirmed. Our rider will call 10 mins before arrival.",
  "We have approved a free instant replacement for this item on our next dispatch!",
];

function formatRelativeTime(iso: string) {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
}

export function AdminChatConsole({ onUnreadChange }: AdminChatConsoleProps) {
  const { showToast } = useApp();
  const [conversations, setConversations] = useState<AdminChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "unread" | "resolved">("all");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chats", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const list: AdminChatConversation[] = Array.isArray(json.conversations)
        ? json.conversations
        : [];
      setConversations(list);
      onUnreadChange?.(Number(json.unreadTotal ?? 0));
    } finally {
      setLoadingList(false);
    }
  }, [onUnreadChange]);

  const loadThread = useCallback(
    async (convId: number, silent = false) => {
      if (!silent) setLoadingThread(true);
      try {
        const res = await fetch(`/api/admin/chats/${convId}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        setMessages(Array.isArray(json.messages) ? json.messages : []);
        if (json.conversation) {
          setConversations((prev) =>
            prev.map((c) => (c.id === convId ? json.conversation : c))
          );
        }
        void loadConversations();
      } finally {
        if (!silent) setLoadingThread(false);
      }
    },
    [loadConversations]
  );

  useEffect(() => {
    void loadConversations();
    const timer = setInterval(() => {
      void loadConversations();
      if (selectedId) {
        void loadThread(selectedId, true);
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [loadConversations, loadThread, selectedId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 40);
    }
  }, [messages.length, selectedId]);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const filterOk =
        statusFilter === "all" ||
        (statusFilter === "open" && c.status === "open") ||
        (statusFilter === "resolved" && c.status === "resolved") ||
        (statusFilter === "unread" && c.unreadForAdmin > 0);
      const qOk =
        !q ||
        c.customerName.toLowerCase().includes(q) ||
        (c.customerPhone || "").toLowerCase().includes(q) ||
        c.customerArea.toLowerCase().includes(q) ||
        (c.lastMessageText || "").toLowerCase().includes(q);
      return filterOk && qOk;
    });
  }, [conversations, search, statusFilter]);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const selectConversation = (convId: number) => {
    setSelectedId(convId);
    void loadThread(convId);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/chats/${activeConv.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || "Reply failed", "error");
        return;
      }
      setReplyText("");
      setMessages(Array.isArray(json.messages) ? json.messages : []);
      if (json.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConv.id ? json.conversation : c))
        );
      }
      void loadConversations();
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!activeConv) return;
    const nextStatus = activeConv.status === "resolved" ? "open" : "resolved";
    const res = await fetch(`/api/admin/chats/${activeConv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      showToast(
        nextStatus === "resolved" ? "Conversation marked resolved" : "Conversation reopened"
      );
      void loadConversations();
    }
  };

  const handleDeleteConv = async (convId: number) => {
    const res = await fetch(`/api/admin/chats/${convId}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Conversation removed");
      if (selectedId === convId) {
        setSelectedId(null);
        setMessages([]);
      }
      void loadConversations();
    }
  };

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadForAdmin, 0);
  const openCount = conversations.filter((c) => c.status === "open").length;

  return (
    <div className="space-y-4">
      {/* Summary Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Sync Active
          </span>
          <span className="text-gray-500">
            Total Threads: <strong className="text-gray-900">{conversations.length}</strong>
          </span>
          <span className="text-gray-500">
            Open: <strong className="text-[#0f7b3f]">{openCount}</strong>
          </span>
          <span className="text-gray-500">
            Unread Messages:{" "}
            <strong className={unreadTotal > 0 ? "text-orange-600" : "text-gray-900"}>
              {unreadTotal}
            </strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadConversations();
            if (selectedId) void loadThread(selectedId, true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#0f7b3f] hover:text-[#0f7b3f] cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Split Chat Inbox */}
      <div className="grid min-h-[540px] overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid-cols-12">
        {/* Left: Conversation List */}
        <div
          className={`border-b border-gray-200 lg:col-span-4 lg:border-b-0 lg:border-r flex flex-col ${
            selectedId ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="border-b border-gray-100 p-3.5 space-y-2.5">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, phone, area..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-xs focus:border-[#0f7b3f] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "open", "unread", "resolved"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize cursor-pointer ${
                    statusFilter === tab
                      ? "bg-[#0f7b3f] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[480px] lg:max-h-[540px]">
            {loadingList ? (
              <div className="flex items-center justify-center py-16 text-xs text-gray-400 gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading chats...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-5 py-16 text-center text-xs text-gray-500">
                No customer chats found. Messages sent from the storefront Live Chat widget appear here immediately.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full px-4 py-3.5 text-left transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/75 border-l-4 border-l-[#0f7b3f]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {conv.customerName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {conv.customerArea}
                          {conv.customerPhone ? ` · ${conv.customerPhone}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] text-gray-400">
                          {formatRelativeTime(conv.lastMessageAt)}
                        </span>
                        {conv.unreadForAdmin > 0 ? (
                          <span className="rounded-full bg-orange-500 px-1.5 py-0.5 tabular-nums text-[10px] font-bold text-white">
                            {conv.unreadForAdmin} new
                          </span>
                        ) : (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                              conv.status === "resolved"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-emerald-50 text-[#0f7b3f]"
                            }`}
                          >
                            {conv.status}
                          </span>
                        )}
                      </div>
                    </div>
                    {conv.lastMessageText && (
                      <p className="mt-1.5 truncate text-xs text-gray-600">
                        {conv.lastMessageText}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Conversation Thread */}
        <div
          className={`lg:col-span-8 flex flex-col bg-[#f9faf9] ${
            selectedId ? "flex" : "hidden lg:flex"
          }`}
        >
          {!activeConv ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#0f7b3f]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900">
                Select a customer conversation
              </h3>
              <p className="mt-1 max-w-xs text-xs text-gray-500">
                Choose any thread from the inbox on the left to read messages, send instant replies, or resolve support tickets.
              </p>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="lg:hidden rounded-lg border border-gray-200 p-1.5 text-gray-600 cursor-pointer"
                    aria-label="Back to chat list"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-gray-900">
                        {activeConv.customerName}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          activeConv.status === "resolved"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-emerald-50 text-[#0f7b3f]"
                        }`}
                      >
                        {activeConv.status}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#0f7b3f]" />
                        {activeConv.customerArea}
                      </span>
                      {activeConv.customerPhone && (
                        <a
                          href={`tel:${activeConv.customerPhone}`}
                          className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-[#0f7b3f]"
                        >
                          <Phone className="h-3 w-3 text-[#0f7b3f]" />
                          {activeConv.customerPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleStatus}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      activeConv.status === "resolved"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-emerald-200 bg-emerald-50 text-[#0f7b3f]"
                    }`}
                  >
                    {activeConv.status === "resolved" ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reopen
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Resolved
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteConv(activeConv.id)}
                    className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:border-red-200 hover:text-red-600 cursor-pointer"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 max-h-[360px] min-h-[300px]">
                {loadingThread ? (
                  <div className="flex items-center justify-center py-12 text-xs text-gray-400 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading messages...
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                      >
                        <span className="mb-1 px-1 text-[10px] font-medium text-gray-400">
                          {msg.senderName} ·{" "}
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap shadow-2xs ${
                            isAdmin
                              ? "rounded-br-sm bg-[#0f7b3f] text-white"
                              : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                          }`}
                        >
                          {msg.body}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              {/* Quick Canned Replies */}
              <div className="border-t border-gray-200/80 bg-white px-4 pt-2.5 pb-1 flex flex-wrap gap-1.5">
                {CANNED_REPLIES.map((snippet) => (
                  <button
                    key={snippet}
                    type="button"
                    onClick={() => setReplyText(snippet)}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600 hover:border-[#0f7b3f] hover:bg-emerald-50 hover:text-[#0f7b3f] cursor-pointer truncate max-w-[260px]"
                    title={snippet}
                  >
                    + {snippet}
                  </button>
                ))}
              </div>

              {/* Admin Reply Composer */}
              <form
                onSubmit={handleSendReply}
                className="flex items-center gap-2 bg-white px-4 py-3 border-t border-gray-100"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeConv.customerName}...`}
                  maxLength={1000}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:border-[#0f7b3f] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f7b3f] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0b5e30] disabled:opacity-50 cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
