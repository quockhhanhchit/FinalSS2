import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { apiDelete, apiGet, apiPost } from "../lib/api";
import { useLanguage } from "../LanguageContext";

function MarkdownMessage({ content }) {
  return (
    <div
      className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-current prose-headings:text-current dark:prose-invert"
      data-no-translate
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export function AIAssistantBubble() {
  const { language } = useLanguage();
  const labels = useMemo(
    () =>
      language === "en"
        ? {
            name: "Coach Dat AI",
            subtitle: "Meal, workout, and budget coach",
            placeholder: "Ask about meals, budget, workouts...",
            send: "Send",
            summary: "Weekly summary",
            summaryLoading: "Generating...",
            welcome:
              "Hi, I am **Coach Dat AI**. I can look at your current BudgetFit plan and help with meals, workouts, budget, and weekly progress.",
            helper:
              "I answer only BudgetFit topics and I use your real data when available.",
            remaining: "AI requests left today",
            clearChat: "Clear chat",

            suggestions: [
              "Suggest a dinner under today's budget",
              "Review my spending this week",
              "Swap today's workout to upper body",
            ],
            unavailable:
              "The AI coach is not configured yet. Add `GEMINI_API_KEY` to the backend first.",
          }
        : {
            name: "Trợ lý em Đạt",
            subtitle: "Tư vấn ăn uống, tập luyện và ngân sách",
            placeholder: "Hỏi về bữa ăn, ngân sách, bài tập...",
            send: "Gửi",
            summary: "Tóm tắt tuần",
            summaryLoading: "Đang tạo...",
            welcome:
              "Chào bạn, mình là **trợ lý em Đạt**. Mình có thể đọc kế hoạch BudgetFit hiện tại của bạn để tư vấn bữa ăn, bài tập, ngân sách và tiến độ trong tuần.",
            helper:
              "Mình chỉ trả lời các chủ đề trong BudgetFit và sẽ ưu tiên dữ liệu thật của bạn khi có.",
            remaining: "Lượt AI còn lại hôm nay",
            clearChat: "Xóa đoạn chat",

            suggestions: [
              "Gợi ý bữa tối vừa túi tiền hôm nay",
              "Xem giúp mình chi tiêu tuần này",
              "Đổi bài tập hôm nay sang tập thân trên",
            ],
            unavailable:
              "Trợ lý AI chưa được cấu hình. Hãy thêm `GEMINI_API_KEY` ở backend trước.",
          },
    [language]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: labels.welcome,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [requestsRemaining, setRequestsRemaining] = useState(null);
  const [latestSummary, setLatestSummary] = useState(null);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  // Ref so the open-ai-summary event listener always calls the latest version
  const generateSummaryRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: labels.welcome,
      },
    ]);
    setError("");
  }, [labels.welcome]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    apiGet("/api/ai/history")
      .then((history) => {
        if (history && history.length > 0) {
          const loadedMessages = history.map((msg) => ({
            id: `history-${msg.created_at || Math.random()}`,
            role: msg.role === "model" || msg.role === "assistant" ? "assistant" : "user",
            content: msg.message_text,
          }));
          setMessages([
            { id: "welcome", role: "assistant", content: labels.welcome },
            ...loadedMessages,
          ]);
        }
      })
      .catch(() => {});

    // Fetch the REAL remaining count from the server so it reflects actual DB usage
    apiGet("/api/ai/requests-remaining")
      .then((data) => {
        setRequestsRemaining(data.remaining);
      })
      .catch(() => {});

    apiGet("/api/ai/weekly-summary")
      .then((summary) => {
        setLatestSummary(summary);
      })
      .catch(() => {
        setLatestSummary(null);
      });
  }, [isOpen, labels.welcome]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, latestSummary]);

  // Listen for external trigger: clicking "Tóm tắt tuần" link on the Dashboard
  useEffect(() => {
    const handleOpenSummary = () => {
      setIsOpen(true);
      setTimeout(() => {
        generateSummaryRef.current?.();
      }, 400);
    };

    window.addEventListener("budgetfit:open-ai-summary", handleOpenSummary);
    return () => {
      window.removeEventListener("budgetfit:open-ai-summary", handleOpenSummary);
    };
  }, []);

  const handleSend = async (messageText = input) => {
    const trimmed = String(messageText || "").trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsSending(true);
    setError("");

    try {
      const response = await apiPost("/api/ai/chat", {
        message: trimmed,
        language,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.reply,
        },
      ]);
      setRequestsRemaining(response.requestsRemaining);

      if (response.swapOccurred) {
        window.localStorage.setItem(
          "budgetfit:plan-updated-at",
          String(Date.now())
        );
        window.dispatchEvent(
          new CustomEvent("budgetfit:plan-updated", {
            detail: {
              affectedDayNumbers: response.affectedDayNumbers || [],
              source: "ai-swap",
              updatedDays: response.updatedDays || {},
            },
          })
        );
      }
    } catch (requestError) {
      setError(requestError.message || labels.unavailable);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = async () => {
    if (isClearingChat) {
      return;
    }

    setIsClearingChat(true);
    setError("");

    try {
      await apiDelete("/api/ai/history");
      setMessages([{ id: "welcome", role: "assistant", content: labels.welcome }]);
      setLatestSummary(null);
    } catch (requestError) {
      setError(requestError.message || labels.unavailable);
    } finally {
      setIsClearingChat(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (isLoadingSummary) {
      return;
    }

    setIsLoadingSummary(true);
    setError("");

    try {
      const summary = await apiPost("/api/ai/weekly-summary", { language });
      setLatestSummary(summary);
      setMessages((current) => [
        ...current,
        {
          id: `summary-${Date.now()}`,
          role: "assistant",
          content: summary?.body || "",
        },
      ]);
      // Notify Dashboard card to update without a page refresh
      window.dispatchEvent(
        new CustomEvent("budgetfit:ai-summary-updated", { detail: { summary } })
      );
    } catch (requestError) {
      setError(requestError.message || labels.unavailable);
    } finally {
      setIsLoadingSummary(false);
    }
  };
  // Keep the ref in sync so the event listener always calls the latest version
  generateSummaryRef.current = handleGenerateSummary;


  return (
    <div className="fixed bottom-24 right-5 z-[95] flex flex-col items-end gap-3">
      {isOpen ? (
        <div
          className="w-[min(92vw,24rem)] overflow-hidden rounded-[1.75rem] border border-border bg-card/95 shadow-2xl backdrop-blur-xl"
          data-no-translate
        >
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">{labels.name}</div>
                  <div className="text-xs text-white/85">{labels.subtitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 6 ? (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    disabled={isClearingChat}
                    title={labels.clearChat}
                    className="rounded-full p-2 transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={labels.clearChat}
                  >
                    {isClearingChat ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 transition-colors hover:bg-white/15"
                  aria-label="Close AI assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-border bg-secondary/35 px-4 py-3">
            <div className="mb-2 text-xs text-muted-foreground">{labels.helper}</div>
            <div className="flex flex-wrap gap-2">
              {labels.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[26rem] space-y-3 overflow-y-auto px-4 py-4">
            {latestSummary ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                <div className="mb-2 flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  {labels.summary}
                </div>
                <MarkdownMessage content={latestSummary.body} />
              </div>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground"
                  }`}
                >
                  <MarkdownMessage content={message.content} />
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border bg-card px-4 py-3">
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mb-3 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={isLoadingSummary}
                className="rounded-xl"
              >
                {isLoadingSummary ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoadingSummary ? labels.summaryLoading : labels.summary}
              </Button>

              <div className="text-[11px] text-muted-foreground">
                {labels.remaining}:{" "}
                <span className="font-semibold text-foreground">
                  {requestsRemaining === null ? "–" : requestsRemaining}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={labels.placeholder}
                className="min-h-[3.25rem] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
              <Button
                type="button"
                onClick={() => handleSend()}
                disabled={isSending || !input.trim()}
                className="h-auto rounded-2xl px-4"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{labels.send}</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-3 text-white shadow-2xl transition-transform hover:-translate-y-0.5"
        data-no-translate
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-sm font-semibold">{labels.name}</div>
          <div className="text-xs text-white/85">{labels.subtitle}</div>
        </div>
      </button>
    </div>
  );
}
