import { Trophy, Gift, Star, Zap, Award, Crown, Sparkles, Tag } from "lucide-react";
import { AchievementBadge } from "../components/ui/achievement-badge";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { SuccessCelebration } from "../components/SuccessCelebration";

export function Rewards() {
  const [showCelebration, setShowCelebration] = useState(false);

  // User stats
  const totalPoints = 2450;
  const currentLevel = 5;
  const nextLevelPoints = 3000;

  // Achievements
  const achievements = [
  { type: "streak", level: 7, title: "7-Day Streak", description: "Completed 7 days in a row", earned: true },
  { type: "streak", level: 14, title: "14-Day Streak", description: "Completed 14 days in a row", earned: true },
  { type: "streak", level: 30, title: "30-Day Streak", description: "Completed 30 days in a row", earned: false },
  { type: "weight", title: "First 1kg Lost", description: "Lost your first kilogram", earned: true },
  { type: "weight", title: "5kg Milestone", description: "Lost 5 kilograms", earned: false },
  { type: "budget", title: "Budget Master", description: "Stayed under budget for 7 days", earned: true },
  { type: "complete", title: "Week 1 Complete", description: "Finished first week", earned: true },
  { type: "complete", title: "Week 2 Complete", description: "Finished second week", earned: true },
  { type: "milestone", title: "Perfect Day", description: "100% completion on a day", earned: true },
  { type: "milestone", title: "Early Bird", description: "Logged breakfast 7 days in a row", earned: true },
  { type: "special", title: "Fitness Champion", description: "Completed 20 workouts", earned: true },
  { type: "special", title: "Hydration Hero", description: "Hit water goal 14 days", earned: false },
];
  // Available vouchers/rewards
  const vouchers = [
    {
      brand: "Shopee",
      discount: "50,000₫",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
      points: 500,
      available: 5,
      claimed: false,
    },
    {
      brand: "Grab Food",
      discount: "30,000₫",
      image: "https://images.unsplash.com/photo-1661257711676-79a0fc533569?w=400",
      points: 300,
      available: 3,
      claimed: false,
    },
    {
      brand: "The Coffee House",
      discount: "25,000₫",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
      points: 250,
      available: 10,
      claimed: true,
    },
    {
      brand: "Decathlon",
      discount: "100,000₫",
      image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400",
      points: 1000,
      available: 2,
      claimed: false,
    },
  ];

  // Recent rewards
  const recentRewards = [
    { date: "March 24, 2026", reward: "The Coffee House 25,000₫", points: 250 },
    { date: "March 20, 2026", reward: "7-Day Streak Badge", points: 100 },
    { date: "March 15, 2026", reward: "Week 2 Complete Badge", points: 150 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with illustration */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Rewards & Achievements</h1>
              <p className="text-white/90">Earn points and unlock exclusive perks</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Points</span>
          </div>
          <div className="text-3xl font-bold text-primary">{totalPoints.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Current Level</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">Level {currentLevel}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Next Level</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{nextLevelPoints - totalPoints} pts</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Progress to Level {currentLevel + 1}</h3>
          </div>
          <span className="text-sm text-muted-foreground">{totalPoints} / {nextLevelPoints} points</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${(totalPoints / nextLevelPoints) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Your Achievements</h3>
          </div>
          <Badge variant="purple">
            {achievements.filter((a) => a.earned).length}/{achievements.length} Earned
          </Badge>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {achievements.map((achievement, index) => (
            <AchievementBadge
              key={index}
              type={achievement.type}
              level={achievement.level}
              title={achievement.title}
              description={achievement.description}
              earned={achievement.earned}
              size="md"
            />
          ))}
        </div>
      </div>

      {/* Available Vouchers */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Redeem Vouchers</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setShowCelebration(true)
            }
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {vouchers.map((voucher, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border ${
                voucher.claimed ? "border-muted bg-muted/30" : "border-border bg-card"
              }`}
            >
              <div className="h-32 overflow-hidden">
                <img src={voucher.image} alt={voucher.brand} className="w-full h-full object-cover" />
                {voucher.claimed && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="success">Claimed</Badge>
                  </div>
                )}
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
                    <span className="font-medium">{voucher.points} points</span>
                  </div>
                  {!voucher.claimed && (
                    <Button
                      size="sm"
                      disabled={totalPoints < voucher.points}
                      onClick={() => alert(`Redeemed ${voucher.brand} voucher!`)}
                    >
                      Redeem
                    </Button>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {voucher.available} available
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Rewards History */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Recent Rewards</h3>
        </div>
        <div className="space-y-3">
          {recentRewards.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <div className="font-medium">{item.reward}</div>
                <div className="text-sm text-muted-foreground">{item.date}</div>
              </div>
              <Badge variant="success" icon={<Star className="w-3 h-3 fill-current" />}>
                +{item.points} pts
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Success Celebration Modal */}
      <SuccessCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        achievement="30-Day Goal Completed"
        reward={{
          type: "Shopee Voucher",
          value: "50,000₫",
          code: "HEALTH2026",
        }}
      />
    </div>
  );
}
