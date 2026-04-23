import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { Flame, Sparkles, Trophy } from "lucide-react";
import { Button } from "./ui/button";

const MILESTONE_CONFIG = {
  30: {
    title: "Khởi động bùng cháy",
    accent: "from-orange-500 via-amber-400 to-yellow-300",
    glow: "shadow-[0_0_80px_rgba(249,115,22,0.45)]",
    Icon: Flame,
    quotes: [
      "Hòn than đang đỏ rực! Khởi động hoàn hảo, giữ vững nhịp độ nhé!",
      "Bước đầu tiên là bước khó nhất. Bạn đã làm được!",
    ],
  },
  60: {
    title: "Vượt dốc cực gắt",
    accent: "from-orange-600 via-rose-500 to-amber-300",
    glow: "shadow-[0_0_90px_rgba(244,63,94,0.4)]",
    Icon: Flame,
    quotes: [
      "Vượt qua nửa chặng đường rồi! Kỷ luật tạo nên sức mạnh!",
      "Mồ hôi của hôm nay là nụ cười của ngày mai. Tiếp tục thôi!",
    ],
  },
  90: {
    title: "Cận đích rồi",
    accent: "from-rose-600 via-orange-500 to-yellow-300",
    glow: "shadow-[0_0_100px_rgba(234,88,12,0.45)]",
    Icon: Flame,
    quotes: [
      "Cố lên! Đỉnh núi ngay trước mắt rồi! Đừng dừng lại lúc này!",
      "Chỉ còn 10% nữa thôi. Đốt cháy nốt năng lượng nào!",
    ],
  },
  100: {
    title: "Hoàn hảo tuyệt đối",
    accent: "from-amber-300 via-yellow-300 to-orange-400",
    glow: "shadow-[0_0_120px_rgba(250,204,21,0.45)]",
    Icon: Trophy,
    quotes: [
      "HOÀN HẢO! Một ngày kỷ luật thép đỉnh cao. Tự hào về bạn! Giờ thì nghỉ ngơi thật tốt nhé.",
    ],
  },
};

function getRandomQuote(quotes = []) {
  if (quotes.length === 0) return "";
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function MotivationalPopup({ milestone, quote, isOpen, onClose }) {
  const config = milestone ? MILESTONE_CONFIG[milestone] : null;

  useEffect(() => {
    if (!isOpen || !milestone) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, 4000);

    if (milestone === 100) {
      const count = 180;
      const defaults = {
        origin: { y: 0.65 },
        spread: 80,
        ticks: 220,
        zIndex: 90,
      };

      confetti({
        ...defaults,
        particleCount: count / 2,
        startVelocity: 45,
        origin: { x: 0.2, y: 0.65 },
      });

      confetti({
        ...defaults,
        particleCount: count / 2,
        startVelocity: 45,
        origin: { x: 0.8, y: 0.65 },
      });
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, milestone, onClose]);

  if (!config) {
    return null;
  }

  const { Icon, title, accent, glow } = config;
  const displayQuote = quote || getRandomQuote(config.quotes);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className={`relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/90 p-8 text-white ${glow}`}
            initial={{ opacity: 0, scale: 0.72, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 18,
            }}
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
            <div className="absolute -left-14 top-10 h-36 w-36 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-yellow-400/20 blur-3xl" />

            <div className="relative flex flex-col items-center text-center">
              <motion.div
                className={`mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-slate-950`}
                animate={{
                  rotate: milestone === 100 ? [0, -8, 8, 0] : [0, -4, 4, 0],
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: milestone === 100 ? 1.4 : 1.2,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                }}
              >
                <Icon className="h-14 w-14" />
              </motion.div>

              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/80">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                Đã chạm mốc {milestone}%
              </div>

              <h2 className="mb-3 text-3xl font-black tracking-tight sm:text-4xl">
                {title}
              </h2>
              <p className="max-w-lg text-base leading-7 text-white/85 sm:text-lg">
                {displayQuote}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  Tiến độ hôm nay: <span className="font-semibold text-white">{milestone}%</span>
                </div>
                <Button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-xl bg-white text-slate-950 hover:bg-white/90"
                >
                  Tiếp tục lụm!
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
