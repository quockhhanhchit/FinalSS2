import { Modal, ModalHeader, ModalBody, ModalFooter } from "./ui/modal";
import { Button } from "./ui/button";
import { Trophy, Sparkles, Gift } from "lucide-react";
import { AchievementBadge } from "./ui/achievement-badge";

interface SuccessCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: string;
  reward?: {
    type: string;
    value: string;
    code?: string;
  };
}

export function SuccessCelebration({ isOpen, onClose, achievement, reward }: SuccessCelebrationProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative">
        {/* Confetti effect placeholder */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
          <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="absolute top-10 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
          <div className="absolute top-10 right-1/3 w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>

        <ModalHeader icon={<Trophy className="w-8 h-8" />}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Congratulations!
            </h2>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-muted-foreground">You've achieved an incredible milestone!</p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Achievement Display */}
            <div className="text-center py-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20">
              <div className="flex justify-center mb-4">
                <AchievementBadge type="complete" title="Goal Achieved!" size="lg" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{achievement}</h3>
              <p className="text-muted-foreground">
                You've reached your target weight within the 30-day plan!
              </p>
            </div>

            {/* Reward Section */}
            {reward && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Your Reward</h4>
                    <p className="text-sm text-muted-foreground">Exclusive offer for achievers!</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{reward.type}</span>
                    <span className="text-2xl font-bold text-primary">{reward.value}</span>
                  </div>
                  {reward.code && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Code:</span>
                      <code className="font-mono font-bold text-primary">{reward.code}</code>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  * Valid for 7 days. Terms and conditions apply.
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-primary mb-1">30</div>
                <div className="text-xs text-muted-foreground">Days Completed</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-xs text-muted-foreground">Goal Achieved</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-primary mb-1">🔥</div>
                <div className="text-xs text-muted-foreground">Perfect Streak</div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {reward && (
            <Button onClick={() => alert("Reward claimed!")}>
              Claim Voucher
            </Button>
          )}
        </ModalFooter>
      </div>
    </Modal>
  );
}
