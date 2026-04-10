import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Activity } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import fitnessIllustration from "../../assets/undraw_fitness-tracker_y5q5.svg";
import { setAuthSession } from "../lib/auth";
import { apiPost } from "../lib/api";
import { fetchOnboardingStatus } from "../lib/onboarding";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

async function completeSignIn(navigate, data) {
  setAuthSession({
    token: data.token,
    refreshToken: data.refreshToken,
    user: data.user,
    name: data.user?.fullName,
    email: data.user?.email,
    loggedInAt: Date.now(),
    onboardingCompleted: false,
  });

  const onboardingCompleted = await fetchOnboardingStatus();
  navigate(onboardingCompleted ? "/app" : "/onboarding");
}

export function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    const handleGoogleCredential = async (response) => {
      setError("");
      setIsGoogleSubmitting(true);

      try {
        const data = await apiPost("/api/auth/google", {
          idToken: response.credential,
        });

        await completeSignIn(navigate, data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsGoogleSubmitting(false);
      }
    };

    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) {
      return undefined;
    }

    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        locale: "en",
        width: 200,
      });

      return true;
    };

    if (renderGoogleButton()) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (renderGoogleButton()) {
        window.clearInterval(intervalId);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await apiPost("/api/auth/login", {
        email,
        password,
      });

      await completeSignIn(navigate, data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <img
            src={fitnessIllustration}
            alt="Fitness illustration"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end w-full h-full p-16">
          <div className="max-w-[500px]">
            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
                Start Your Health Journey
              </h2>
              <p className="text-white/95 text-lg leading-relaxed drop-shadow-md">
                Achieve your weight goals while staying within budget. Track
                meals, workouts, and expenses all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#22c55e] via-[#34d399] to-[#8b5cf6] rounded-3xl mb-5 shadow-lg">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-lg text-muted-foreground">
              Sign in to continue your health journey
            </p>
          </div>

          <div className="bg-card rounded-3xl p-14 md:p-16 shadow-xl border border-border">
            <form onSubmit={handleLogin} className="space-y-8">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-14 h-16 text-lg rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-14 pr-14 h-16 text-lg rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-base">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full h-16 text-xl font-semibold rounded-xl shadow-lg"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-card px-3 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center">
                  <div
                    ref={googleButtonRef}
                    className={isGoogleSubmitting ? "pointer-events-none opacity-60" : ""}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Google Sign-In is unavailable until <code>VITE_GOOGLE_CLIENT_ID</code> is set.
                </div>
              )}
            </form>

            <p className="text-center text-lg text-muted-foreground mt-10">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-primary text-xl font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
