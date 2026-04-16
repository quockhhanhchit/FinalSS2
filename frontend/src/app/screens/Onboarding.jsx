import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Home, Dumbbell } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { apiGet, apiPost } from "../lib/api";
import { isAuthenticated } from "../lib/auth";
import {
  isOnboardingComplete,
  setCachedOnboardingStatus,
} from "../lib/onboarding";

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "male",
    goal: "lose",
    duration: "30",
    budget: "5000000",
    location: "home",
    mealsPerDay: "3",
    budgetStyle: "normal",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const hasValidPositiveNumber = (value) =>
    Number.isFinite(Number(value)) && Number(value) > 0;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      if (!isAuthenticated()) {
        return;
      }

      try {
        const profile = await apiGet("/api/profile");

        if (ignore) {
          return;
        }

        if (!profile) {
          setCachedOnboardingStatus(false);
          setIsCheckingProfile(false);
          return;
        }

        const completed = isOnboardingComplete(profile);
        setCachedOnboardingStatus(completed);

        if (completed) {
          navigate("/app", { replace: true });
          return;
        }

        setFormData({
          age: String(profile.age || ""),
          gender: profile.gender || "male",
          height: String(profile.height_cm || ""),
          weight: String(profile.weight_kg || ""),
          goal: profile.goal_type || "lose",
          duration: String(profile.duration_days || "30"),
          budget: String(profile.budget_total || "5000000"),
          location: profile.workout_location || "home",
          mealsPerDay: String(profile.meals_per_day || "3"),
          budgetStyle: profile.budget_style || "normal",
        });
        setIsCheckingProfile(false);
      } catch {
        // First-time onboarding can proceed without an existing profile.
        if (!ignore) {
          setCachedOnboardingStatus(false);
          setIsCheckingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleNext = async () => {
    setError("");

    if (step === 1) {
      if (!hasValidPositiveNumber(formData.age)) {
        setError("Tuổi là bắt buộc và phải lớn hơn 0.");
        return;
      }

      if (!hasValidPositiveNumber(formData.height)) {
        setError("Chiều cao là bắt buộc và phải lớn hơn 0.");
        return;
      }

      if (!hasValidPositiveNumber(formData.weight)) {
        setError("Cân nặng là bắt buộc và phải lớn hơn 0.");
        return;
      }
    }

    if (step < totalSteps) {
      if (step === 2 && Number(formData.budget) < 3000000) {
        setError("Ngân sách tối thiểu là 3.000.000 VND.");
        return;
      }

      setStep(step + 1);
    } else {
      if (Number(formData.budget) < 3000000) {
        setError("Ngân sách tối thiểu là 3.000.000 VND.");
        return;
      }

      setIsSubmitting(true);

      try {
        await apiPost("/api/profile", {
          age: Number(formData.age),
          gender: formData.gender,
          height: Number(formData.height),
          weight: Number(formData.weight),
          goal: formData.goal,
          duration: Number(formData.duration),
          budget: Number(formData.budget),
          location: formData.location,
          mealsPerDay: Number(formData.mealsPerDay),
          budgetStyle: formData.budgetStyle,
        });

        setCachedOnboardingStatus(true);
        await apiPost("/api/plans/generate", {});
        navigate("/app/budget-breakdown");
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (isCheckingProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2">Hãy cho chúng tôi biết về bạn</h1>
          <p className="text-muted-foreground">
            Thông tin này sẽ được dùng để tạo kế hoạch cá nhân hóa cho bạn
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Bước {step} / {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Thông tin cá nhân</h2>
                <p className="text-sm text-muted-foreground">
                  Nhập các chỉ số cơ bản của bạn
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Tuổi</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                  <p className="text-xs text-muted-foreground">tuổi</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Chiều cao</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                  <p className="text-xs text-muted-foreground">cm</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Cân nặng</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Giới tính</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "male", label: "Nam" },
                    { value: "female", label: "Nữ" },
                    { value: "other", label: "Khác" },
                  ].map((gender) => (
                    <button
                      key={gender.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, gender: gender.value })
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.gender === gender.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium text-sm">{gender.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mục tiêu của bạn là gì?</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "lose", label: "Giảm cân" },
                    { value: "maintain", label: "Giữ cân" },
                    { value: "gain", label: "Tăng cân" },
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, goal: goal.value })
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.goal === goal.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{goal.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Thời lượng kế hoạch</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="h-12"
                  required
                />
                <p className="text-xs text-muted-foreground">ngày</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Lập ngân sách</h2>
                <p className="text-sm text-muted-foreground">
                  Thiết lập ngân sách hàng tháng cho kế hoạch này
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Ngân sách hàng tháng</Label>
                <div className="relative">
                  <Input
                    id="budget"
                    type="text"
                    min="3000000"
                    placeholder="5,000,000"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="h-14 text-lg pr-16"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    VND
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tối thiểu 3.000.000 VND -{" "}
                  {parseInt(formData.budget || "0", 10).toLocaleString("vi-VN")} VND
                </p>
              </div>

              <div className="space-y-2">
                <Label>Phong cách chi tiêu</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "saving",
                      label: "Tiết kiệm",
                      desc: "Tối ưu chi phí",
                    },
                    {
                      value: "normal",
                      label: "Cân bằng",
                      desc: "Phân bổ hợp lý",
                    },
                  ].map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, budgetStyle: style.value })
                      }
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.budgetStyle === style.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{style.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {style.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Ngân sách ước tính mỗi ngày
                </div>
                <div className="text-2xl font-semibold">
                  {Math.round(
                    parseInt(formData.budget || "0", 10) /
                      parseInt(formData.duration || "30", 10)
                  ).toLocaleString("vi-VN")}{" "}
                  VND
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Sở thích của bạn</h2>
                <p className="text-sm text-muted-foreground">
                  Tùy chỉnh kế hoạch theo lối sống của bạn
                </p>
              </div>

              <div className="space-y-2">
                <Label>Địa điểm tập luyện</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "home",
                      label: "Tập tại nhà",
                      icon: Home,
                    },
                    {
                      value: "gym",
                      label: "Tập tại phòng gym",
                      icon: Dumbbell,
                    },
                  ].map((location) => {
                    const Icon = location.icon;
                    return (
                      <button
                        key={location.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, location: location.value })
                        }
                        className={`p-6 rounded-xl border-2 transition-all ${
                          formData.location === location.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className="w-8 h-8 mb-2 mx-auto" />
                        <div className="font-medium">{location.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealsPerDay">Số bữa mỗi ngày</Label>
                <Input
                  id="mealsPerDay"
                  type="number"
                  placeholder="3"
                  min="2"
                  max="6"
                  value={formData.mealsPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, mealsPerDay: e.target.value })
                  }
                  className="h-12"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Khuyến nghị: 3-4 bữa mỗi ngày
                </p>
              </div>

              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Sẵn sàng bắt đầu!</div>
                    <div className="text-sm text-muted-foreground">
                      Chúng tôi sẽ tạo kế hoạch 30 ngày dựa trên sở thích và
                      ngân sách của bạn.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-12 px-6"
              >
                Quay lại
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex-1 h-12"
            >
              {step === totalSteps
                ? isSubmitting
                  ? "Đang tạo..."
                  : "Tạo kế hoạch"
                : "Tiếp tục"}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
