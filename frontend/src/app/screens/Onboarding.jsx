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
        setError("Age is required and must be greater than 0.");
        return;
      }

      if (!hasValidPositiveNumber(formData.height)) {
        setError("Height is required and must be greater than 0.");
        return;
      }

      if (!hasValidPositiveNumber(formData.weight)) {
        setError("Weight is required and must be greater than 0.");
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);

      try {
        await apiPost("/api/profile", {
          age: Number(formData.age),
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
          <h1 className="text-3xl font-semibold mb-2">Let's get to know you</h1>
          <p className="text-muted-foreground">
            We'll use this information to create your personalized plan
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
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
                <h2 className="text-xl font-semibold mb-1">Personal Information</h2>
                <p className="text-sm text-muted-foreground">
                  Tell us about yourself
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
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
                  <p className="text-xs text-muted-foreground">years</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
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
                  <Label htmlFor="weight">Weight</Label>
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
                <Label>What's your goal?</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "lose", label: "Lose weight" },
                    { value: "maintain", label: "Maintain" },
                    { value: "gain", label: "Gain weight" },
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
                <Label htmlFor="duration">Duration</Label>
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
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Budget Planning</h2>
                <p className="text-sm text-muted-foreground">
                  Set your monthly budget for this plan
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget</Label>
                <div className="relative">
                  <Input
                    id="budget"
                    type="text"
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
                  {parseInt(formData.budget || "0", 10).toLocaleString("vi-VN")} VND
                </p>
              </div>

              <div className="space-y-2">
                <Label>Budget Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "saving",
                      label: "Saving",
                      desc: "Minimize costs",
                    },
                    {
                      value: "normal",
                      label: "Normal",
                      desc: "Balanced approach",
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
                  Estimated daily budget
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
                <h2 className="text-xl font-semibold mb-1">Your Preferences</h2>
                <p className="text-sm text-muted-foreground">
                  Customize your plan to fit your lifestyle
                </p>
              </div>

              <div className="space-y-2">
                <Label>Workout Location</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "home",
                      label: "Home Workouts",
                      icon: Home,
                    },
                    {
                      value: "gym",
                      label: "Gym Workouts",
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
                <Label htmlFor="mealsPerDay">Meals per day</Label>
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
                  Recommended: 3-4 meals per day
                </p>
              </div>

              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Ready to start!</div>
                    <div className="text-sm text-muted-foreground">
                      We'll generate a personalized 30-day plan based on your
                      preferences and budget.
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
                Back
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
                  ? "Generating..."
                  : "Generate Plan"
                : "Continue"}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
