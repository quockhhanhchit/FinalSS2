import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { Mail, Lock, User, Eye, EyeOff, Activity } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import runnerIllustration from "../../assets/Fitness-stats-amico.svg";
import { setAuthSession } from "../lib/auth";
import { apiPost } from "../lib/api";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters long"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[a-z]/, "Password must include at least one lowercase letter")
      .regex(/[0-9]/, "Password must include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const parsed = registerSchema.safeParse(formData);

    if (!parsed.success) {
      const nextErrors = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0];

        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiPost("/api/auth/register", {
        fullName: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      });

      setAuthSession({
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user,
        name: data.user?.fullName,
        email: data.user?.email,
        loggedInAt: Date.now(),
        onboardingCompleted: false,
      });

      navigate("/onboarding");
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
            src={runnerIllustration}
            alt="Runner illustration"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end w-full h-full p-16">
          <div className="max-w-[500px]">
            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
                Track Every Step
              </h2>
              <p className="text-white/95 text-lg leading-relaxed drop-shadow-md">
                Monitor your progress with real-time metrics. Stay motivated
                with personalized goals and achievements.
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
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Create Account</h1>
            <p className="text-lg text-muted-foreground">
              Start your health journey today
            </p>
          </div>

          <div className="bg-card rounded-3xl p-14 md:p-16 shadow-xl border border-border">
            <form onSubmit={handleRegister} className="space-y-8">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`pl-14 h-16 text-lg rounded-xl ${fieldErrors.name ? "border-red-300 focus-visible:ring-red-300" : ""}`}
                    required
                  />
                </div>
                {fieldErrors.name ? (
                  <p className="text-sm text-red-600">{fieldErrors.name}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`pl-14 h-16 text-lg rounded-xl ${fieldErrors.email ? "border-red-300 focus-visible:ring-red-300" : ""}`}
                    required
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="text-sm text-red-600">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className={`pl-14 pr-14 h-16 text-lg rounded-xl ${fieldErrors.password ? "border-red-300 focus-visible:ring-red-300" : ""}`}
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
                {fieldErrors.password ? (
                  <p className="text-sm text-red-600">{fieldErrors.password}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`pl-14 pr-14 h-16 text-lg rounded-xl ${fieldErrors.confirmPassword ? "border-red-300 focus-visible:ring-red-300" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword ? (
                  <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-16 text-xl font-semibold rounded-xl shadow-lg"
              >
                {isSubmitting ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <p className="text-center text-lg text-muted-foreground mt-10">
              Already have an account?{" "}
              <Link to="/" className="text-primary text-xl font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
