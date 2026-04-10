import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle2, Activity } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import fitnessIllustration from "../../assets/undraw_fitness-tracker_y5q5.svg";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-primary/5 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-10 bg-gradient-to-br from-primary/10 to-accent/10">
          <img
            src={fitnessIllustration}
            alt="Reset password illustration"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end w-full h-full p-16">
          <div className="max-w-[500px] bg-black/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              We&apos;ve Got You Covered
            </h2>
            <p className="text-white/95 text-lg leading-relaxed drop-shadow-md">
              Reset your password and get back to your plan. Your progress stays
              here while you recover access.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#22c55e] via-[#34d399] to-[#8b5cf6] rounded-3xl mb-5 shadow-lg">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Reset Password</h1>
            <p className="text-lg text-muted-foreground">
              {isSubmitted
                ? "Check your email for reset instructions"
                : "Enter your email to receive reset instructions"}
            </p>
          </div>

          <div className="bg-card rounded-3xl p-14 md:p-16 shadow-xl border border-border">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-14 h-16 text-lg rounded-xl"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    We&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 text-xl font-semibold rounded-xl shadow-lg"
                >
                  Send Reset Link
                </Button>

                <div className="flex items-center justify-center gap-2 text-base">
                  <ArrowLeft className="w-4 h-4" />
                  <Link to="/" className="text-primary hover:underline font-medium">
                    Back to login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">Check Your Email</h3>
                    <p className="text-muted-foreground">
                      We&apos;ve sent password reset instructions to:
                    </p>
                    <p className="font-medium text-foreground text-lg">{email}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                    Didn&apos;t receive the email? Check spam or{" "}
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="text-primary hover:underline font-medium"
                    >
                      try again
                    </button>
                    .
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-14 rounded-xl"
                  onClick={() => {
                    window.location.href = "mailto:";
                  }}
                >
                  Open Email App
                </Button>

                <div className="flex items-center justify-center gap-2 text-base">
                  <ArrowLeft className="w-4 h-4" />
                  <Link to="/" className="text-primary hover:underline font-medium">
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {!isSubmitted ? (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link to="/" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
