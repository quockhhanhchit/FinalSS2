import { useEffect, useMemo, useState } from "react";
import { Trophy, Gift, Star, Zap, Award, Crown, Sparkles, Tag } from "lucide-react";
import { AchievementBadge } from "../components/ui/achievement-badge";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { SuccessCelebration } from "../components/SuccessCelebration";
import { apiGet, apiPost } from "../lib/api";
import { formatShortDate } from "../lib/formatters";
import { useLanguage } from "../LanguageContext";

export function Rewards() {
  const { language, t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationReward, setCelebrationReward] = useState(null);

  async function loadRewards() {
    setIsLoading(true);
    setError("");

    try {
      const data = await apiGet("/api/rewards/summary");
      setSummary(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, []);

  const totalPoints = Number(summary?.totalPoints || 0);
  const currentLevel = Number(summary?.currentLevel || 1);
  const nextLevelPoints = Number(summary?.nextLevelPoints || 500);
  const achievements = summary?.achievements || [];
  const vouchers = summary?.vouchers || [];
  const recentRewards = summary?.recentRewards || [];
  const earnedCount = achievements.filter((achievement) => achievement.earned).length;
  const levelProgress = nextLevelPoints
    ? Math.min(100, Math.round((totalPoints / nextLevelPoints) * 100))
    : 0;

  const pointsToNextLevel = useMemo(
    () => Math.max(nextLevelPoints - totalPoints, 0),
    [nextLevelPoints, totalPoints],
  );

  const handleRedeem = async (voucher) => {
    setRedeemingId(voucher.id);
    setError("");

    try {
      const response = await apiPost("/api/rewards/redeem", {
        voucherId: voucher.id,
      });

      setSummary(response.summary);
      setCelebrationReward({
        type: `Voucher ${voucher.brand}`,
        value: voucher.discount,
        code: response.redeemCode,
      });
      setSelectedVoucher(null);
      setShowCelebration(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRedeemingId(null);
    }
  };
  const getAchievementTitle = (achievement) =>
    language === "en"
      ? achievement.title_en || achievement.titleEn || t(achievement.title)
      : achievement.title;
  const getAchievementDescription = (achievement) =>
    language === "en"
      ? achievement.description_en || achievement.descriptionEn || t(achievement.description || "")
      : achievement.description;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-3xl bg-secondary animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-secondary animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Phần thưởng & thành tựu</h1>
              <p className="text-white/90">Tích điểm và mở khóa các ưu đãi riêng</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Tổng điểm</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {totalPoints.toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Cấp hiện tại</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">Cấp {currentLevel}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Cấp tiếp theo</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {pointsToNextLevel} điểm
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Tiến độ tới cấp {currentLevel + 1}</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalPoints} / {nextLevelPoints} điểm
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Thành tựu của bạn</h3>
          </div>
          <Badge variant="purple">
            {earnedCount}/{achievements.length} đã đạt
          </Badge>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.title}
              type={achievement.type}
              level={achievement.level}
              title={getAchievementTitle(achievement)}
              description={getAchievementDescription(achievement)}
              earned={achievement.earned}
              size="md"
            />
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Đổi voucher</h3>
          </div>
          <Button variant="outline" size="sm" onClick={loadRewards}>
            Làm mới
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`relative overflow-hidden rounded-2xl border ${
                voucher.claimed ? "border-muted bg-muted/30" : "border-border bg-card"
              }`}
            >
              <div className="h-32 overflow-hidden">
                <img src={voucher.image} alt={voucher.brand} className="w-full h-full object-cover" />
                {voucher.claimed ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="success">Đã nhận</Badge>
                  </div>
                ) : null}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{voucher.brand}</h4>
                  <Badge variant="purple" icon={<Tag className="w-3 h-3" />}>
                    {voucher.discount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-current text-primary" />
                    <span className="font-medium">{voucher.points} điểm</span>
                  </div>
                  {!voucher.claimed ? (
                    <Button
                      size="sm"
                      disabled={
                        totalPoints < voucher.points ||
                        voucher.available <= 0 ||
                        redeemingId === voucher.id
                      }
                      onClick={() => setSelectedVoucher(voucher)}
                    >
                      {redeemingId === voucher.id ? "Đang đổi..." : "Đổi"}
                    </Button>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Còn {voucher.available} lượt trong tuần này
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Lịch sử phần thưởng</h3>
        </div>
        <div className="space-y-3">
          {recentRewards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Chưa có lịch sử phần thưởng. Hoàn thành thành tựu hoặc đổi voucher để xem tại đây.
            </div>
          ) : null}
          {recentRewards.map((item, index) => (
            <div key={`${item.reward}-${index}`} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <div className="font-medium">{item.reward}</div>
                <div className="text-sm text-muted-foreground">
                  {formatShortDate(item.date)}
                </div>
              </div>
              <Badge
                variant={Number(item.points) >= 0 ? "success" : "outline"}
                icon={<Star className="w-3 h-3 fill-current" />}
              >
                {Number(item.points) >= 0 ? "+" : ""}
                {item.points} điểm
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <SuccessCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        achievement="Đã đổi voucher"
        reward={celebrationReward || {
          type: "Voucher",
          value: "",
          code: "",
        }}
      />

      {selectedVoucher ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="h-36 overflow-hidden">
              <img
                src={selectedVoucher.image}
                alt={selectedVoucher.brand}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Xác nhận đổi voucher</h3>
                <Badge variant="purple">{selectedVoucher.discount}</Badge>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Bạn có chắc muốn dùng {selectedVoucher.points} điểm để nhận voucher {selectedVoucher.brand}? Nếu bấm Close, giao dịch sẽ bị hủy và voucher chưa được nhận.
              </p>
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                Voucher được làm mới theo tuần. Tuần sau bạn có thể đổi lại voucher này nếu còn đủ điểm và còn lượt.
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedVoucher(null)}
                  disabled={redeemingId === selectedVoucher.id}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => handleRedeem(selectedVoucher)}
                  disabled={
                    totalPoints < selectedVoucher.points ||
                    selectedVoucher.available <= 0 ||
                    redeemingId === selectedVoucher.id
                  }
                >
                  {redeemingId === selectedVoucher.id ? "Đang nhận..." : "Claim"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
