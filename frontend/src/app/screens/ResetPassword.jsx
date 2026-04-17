import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { Lock, Eye, EyeOff, CheckCircle2, Activity } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { apiPost } from "../lib/api";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất một chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất một chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất một số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function validateToken() {
      if (!token) {
        setError("Liên kết đặt lại mật khẩu không hợp lệ.");
        setIsTokenValid(false);
        setIsCheckingToken(false);
        return;
      }

      setIsCheckingToken(true);
      setError("");

      try {
        await apiPost("/api/auth/reset-password/validate", { token });

        if (!ignore) {
          setIsTokenValid(true);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
          setIsTokenValid(false);
        }
      } finally {
        if (!ignore) {
          setIsCheckingToken(false);
        }
      }
    }

    validateToken();

    return () => {
      ignore = true;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse(formData);

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
      await apiPost("/api/auth/reset-password", {
        token,
        newPassword: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#22c55e] via-[#34d399] to-[#8b5cf6] rounded-3xl mb-5 shadow-lg">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Đặt lại mật khẩu
          </h1>
          <p className="text-lg text-muted-foreground">
            Tạo mật khẩu mới để tiếp tục đăng nhập vào BudgetFit
          </p>
        </div>

        <div className="bg-card rounded-3xl p-10 md:p-14 shadow-xl border border-border">
          {isCheckingToken ? (
            <div className="text-center text-muted-foreground">
              Đang kiểm tra liên kết đặt lại mật khẩu...
            </div>
          ) : isSuccess ? (
            <div className="space-y-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Đổi mật khẩu thành công
                  </h2>
                  <p className="text-muted-foreground">
                    Bạn có thể dùng mật khẩu mới để đăng nhập.
                  </p>
                </div>
              </div>

              <Button
                className="w-full h-14 rounded-xl"
                onClick={() => navigate("/")}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          ) : !isTokenValid ? (
            <div className="space-y-6 text-center">
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error || "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex text-primary font-medium hover:underline"
              >
                Yêu cầu liên kết mới
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className={`pl-14 pr-14 h-16 text-lg rounded-xl ${fieldErrors.password ? "border-red-300 focus-visible:ring-red-300" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
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
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                    className={`pl-14 pr-14 h-16 text-lg rounded-xl ${fieldErrors.confirmPassword ? "border-red-300 focus-visible:ring-red-300" : ""}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
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
                  <p className="text-sm text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-16 text-xl font-semibold rounded-xl shadow-lg"
              >
                {isSubmitting ? "Đang cập nhật..." : "Đặt mật khẩu mới"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
