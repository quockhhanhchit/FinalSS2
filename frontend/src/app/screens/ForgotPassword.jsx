import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle2, Activity } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { apiPost } from "../lib/api";
import fitnessIllustration from "../../assets/undraw_fitness-tracker_y5q5.svg";

function getEmailAppLink(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const domain = normalizedEmail.split("@")[1] || "";

  if (domain === "gmail.com" || domain === "googlemail.com") {
    return "https://mail.google.com";
  }

  if (
    domain === "outlook.com" ||
    domain === "hotmail.com" ||
    domain === "live.com" ||
    domain === "msn.com"
  ) {
    return "https://outlook.live.com/mail/0/";
  }

  if (domain === "yahoo.com" || domain === "yahoo.com.vn") {
    return "https://mail.yahoo.com";
  }

  return `mailto:${normalizedEmail}`;
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiPost("/api/auth/forgot-password", { email });
      setResetUrl(response?.resetUrl || "");
      setIsSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEmailApp = () => {
    const destination = getEmailAppLink(email);

    if (destination.startsWith("mailto:")) {
      window.location.href = destination;
      return;
    }

    window.open(destination, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-primary/5 flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-10 bg-gradient-to-br from-primary/10 to-accent/10">
          <img
            src={fitnessIllustration}
            alt="Minh họa đặt lại mật khẩu"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end w-full h-full p-16">
          <div className="max-w-[500px] bg-black/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Chúng tôi sẽ hỗ trợ bạn
            </h2>
            <p className="text-white/95 text-lg leading-relaxed drop-shadow-md">
              Đặt lại mật khẩu để quay lại kế hoạch. Tiến độ của bạn vẫn được giữ
              nguyên trong khi khôi phục truy cập.
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
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Đặt lại mật khẩu
            </h1>
            <p className="text-lg text-muted-foreground">
              {isSubmitted
                ? "Kiểm tra email để xem hướng dẫn đặt lại mật khẩu"
                : "Nhập email để nhận hướng dẫn đặt lại mật khẩu"}
            </p>
          </div>

          <div className="bg-card rounded-3xl p-14 md:p-16 shadow-xl border border-border">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email">Địa chỉ email</Label>
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
                    Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 text-xl font-semibold rounded-xl shadow-lg"
                >
                  {isSubmitting ? "Đang xử lý..." : "Gửi liên kết đặt lại"}
                </Button>

                <div className="flex items-center justify-center gap-2 text-base">
                  <ArrowLeft className="w-4 h-4" />
                  <Link to="/" className="text-primary hover:underline font-medium">
                    Quay lại đăng nhập
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
                    <h3 className="text-2xl font-semibold">Kiểm tra email</h3>
                    <p className="text-muted-foreground">
                      Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được
                      chuẩn bị cho:
                    </p>
                    <p className="font-medium text-foreground text-lg">{email}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                    Chưa nhận được email? Hãy kiểm tra thư rác hoặc{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setResetUrl("");
                        setIsSubmitted(false);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      thử lại
                    </button>
                    .
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-14 rounded-xl"
                  onClick={handleOpenEmailApp}
                >
                  Mở ứng dụng email
                </Button>

                {resetUrl ? (
                  <a
                    href={resetUrl}
                    className="block w-full rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    Mở link đặt lại mật khẩu
                  </a>
                ) : null}

                <div className="flex items-center justify-center gap-2 text-base">
                  <ArrowLeft className="w-4 h-4" />
                  <Link to="/" className="text-primary hover:underline font-medium">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </div>
            )}
          </div>

          {!isSubmitted ? (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Nhớ mật khẩu rồi?{" "}
                <Link to="/" className="text-primary font-medium hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
