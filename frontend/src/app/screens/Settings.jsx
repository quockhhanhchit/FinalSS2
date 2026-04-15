import { useEffect, useState } from "react";
import { User, Bell, Lock, Wallet, Target } from "lucide-react";
import { Button } from "../components/ui/button";
import { getAuthSession } from "../lib/auth";
import { apiGet, apiPut } from "../lib/api";
import { showToast } from "../components/ui/toast";

const initialBodyGoalsData = {
  age: "",
  gender: "male",
  height: "",
  weight: "",
  goal: "lose",
  duration: "30",
};

const initialBudgetData = {
  budget: "5000000",
  location: "home",
  mealsPerDay: "3",
  budgetStyle: "normal",
};

const initialNotificationData = {
  dailyReminders: true,
  weightTrackingReminders: true,
  budgetAlerts: true,
};

const initialPasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function hasValidPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

export function Settings() {
  const session = getAuthSession();
  const [bodyGoalsData, setBodyGoalsData] = useState(initialBodyGoalsData);
  const [budgetData, setBudgetData] = useState(initialBudgetData);
  const [notificationData, setNotificationData] = useState(initialNotificationData);
  const [passwordData, setPasswordData] = useState(initialPasswordData);
  const [savedBodyGoalsData, setSavedBodyGoalsData] = useState(initialBodyGoalsData);
  const [savedBudgetData, setSavedBudgetData] = useState(initialBudgetData);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBodyGoals, setIsSavingBodyGoals] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isBodyGoalsEditing, setIsBodyGoalsEditing] = useState(false);
  const [isBudgetEditing, setIsBudgetEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const [profile, notifications] = await Promise.all([
          apiGet("/api/profile"),
          apiGet("/api/profile/notifications"),
        ]);

        if (ignore || !profile) {
          return;
        }

        const nextBodyGoalsData = {
          age: String(profile.age || ""),
          gender: profile.gender || "male",
          height: String(profile.height_cm || ""),
          weight: String(profile.weight_kg || ""),
          goal: profile.goal_type || "lose",
          duration: String(profile.duration_days || "30"),
        };

        const nextBudgetData = {
          budget: String(profile.budget_total || "5000000"),
          location: profile.workout_location || "home",
          mealsPerDay: String(profile.meals_per_day || "3"),
          budgetStyle: profile.budget_style || "normal",
        };

        setBodyGoalsData(nextBodyGoalsData);
        setBudgetData(nextBudgetData);
        setSavedBodyGoalsData(nextBodyGoalsData);
        setSavedBudgetData(nextBudgetData);
        setNotificationData({
          dailyReminders: Boolean(notifications.daily_reminders),
          weightTrackingReminders: Boolean(notifications.weight_tracking_reminders),
          budgetAlerts: Boolean(notifications.budget_alerts),
        });
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleBodyGoalsChange = (key, value) => {
    setBodyGoalsData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleBudgetChange = (key, value) => {
    setBudgetData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleNotificationChange = async (key, value) => {
    const nextNotificationData = {
      ...notificationData,
      [key]: value,
    };

    setNotificationData(nextNotificationData);
    setIsSavingNotifications(true);
    setError("");

    try {
      await apiPut("/api/profile/notifications", nextNotificationData);
      showToast("Notification preferences saved.", "success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleCancelBodyGoals = () => {
    setError("");
    setBodyGoalsData(savedBodyGoalsData);
    setIsBodyGoalsEditing(false);
  };

  const handleCancelBudget = () => {
    setError("");
    setBudgetData(savedBudgetData);
    setIsBudgetEditing(false);
  };

  const handleSaveBodyGoals = async () => {
    setError("");

    if (!hasValidPositiveNumber(bodyGoalsData.age)) {
      setError("Age is required and must be greater than 0.");
      return;
    }

    if (!hasValidPositiveNumber(bodyGoalsData.height)) {
      setError("Height is required and must be greater than 0.");
      return;
    }

    if (!hasValidPositiveNumber(bodyGoalsData.weight)) {
      setError("Weight is required and must be greater than 0.");
      return;
    }

    setIsSavingBodyGoals(true);

    try {
      await apiPut("/api/profile/body-goals", {
        age: Number(bodyGoalsData.age),
        gender: bodyGoalsData.gender,
        height: Number(bodyGoalsData.height),
        weight: Number(bodyGoalsData.weight),
        goal: bodyGoalsData.goal,
        duration: Number(bodyGoalsData.duration),
      });
      setSavedBodyGoalsData(bodyGoalsData);
      setIsBodyGoalsEditing(false);
      showToast("Body & Goals saved to database.", "success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingBodyGoals(false);
    }
  };

  const handleSaveBudget = async () => {
    setError("");

    if (!hasValidPositiveNumber(budgetData.budget)) {
      setError("Budget is required and must be greater than 0.");
      return;
    }

    if (Number(budgetData.budget) < 3000000) {
      setError("Ngân sách tối thiểu là 3,000,000 VND.");
      return;
    }

    setIsSavingBudget(true);

    try {
      await apiPut("/api/profile/budget", {
        budget: Number(budgetData.budget),
        location: budgetData.location,
        mealsPerDay: Number(budgetData.mealsPerDay),
        budgetStyle: budgetData.budgetStyle,
      });
      setSavedBudgetData(budgetData);
      setIsBudgetEditing(false);
      showToast("Budget & Preferences saved to database.", "success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingBudget(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await apiPut("/api/auth/change-password", passwordData);
      setPasswordData(initialPasswordData);
      setShowPasswordForm(false);
      showToast("Password changed successfully. Please sign in again later if needed.", "success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Review and update the information you entered during onboarding
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Account Information</h3>
            <p className="text-sm text-muted-foreground">
              Your account identity comes from authentication
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name</label>
            <input
              type="text"
              value={session?.user?.fullName || session?.name || ""}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <input
              type="email"
              value={session?.user?.email || session?.email || ""}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Body & Goals</h3>
            <p className="text-sm text-muted-foreground">
              These values are loaded from your onboarding profile
            </p>
          </div>
          <Button
            variant={isBodyGoalsEditing ? "outline" : "default"}
            onClick={() => setIsBodyGoalsEditing((current) => !current)}
            disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            className="ml-auto"
          >
            {isBodyGoalsEditing ? "Stop Editing" : "Edit"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Age</label>
              <input
                type="number"
                value={bodyGoalsData.age}
                onChange={(e) => handleBodyGoalsChange("age", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Height (cm)</label>
              <input
                type="number"
                value={bodyGoalsData.height}
                onChange={(e) => handleBodyGoalsChange("height", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
              <input
                type="number"
                value={bodyGoalsData.weight}
                onChange={(e) => handleBodyGoalsChange("weight", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Gender</label>
            <select
              value={bodyGoalsData.gender}
              onChange={(e) => handleBodyGoalsChange("gender", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
            >
              <option value="male">Nam</option>
              <option value="female">Nu</option>
              <option value="other">Khac</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Goal Type</label>
              <select
                value={bodyGoalsData.goal}
                onChange={(e) => handleBodyGoalsChange("goal", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Duration (days)</label>
              <input
                type="number"
                value={bodyGoalsData.duration}
                onChange={(e) => handleBodyGoalsChange("duration", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
              />
            </div>
          </div>
        </div>

        {isBodyGoalsEditing ? (
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={handleCancelBodyGoals}
              disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveBodyGoals}
              disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            >
              {isSavingBodyGoals ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Budget & Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Adjust the same budget preferences used to generate your plan
            </p>
          </div>
          <Button
            variant={isBudgetEditing ? "outline" : "default"}
            onClick={() => setIsBudgetEditing((current) => !current)}
            disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            className="ml-auto"
          >
            {isBudgetEditing ? "Stop Editing" : "Edit"}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Monthly Budget (VND)</label>
            <input
              type="number"
              step="100000"
              min="3000000"
              value={budgetData.budget}
              onChange={(e) => handleBudgetChange("budget", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBudgetEditing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Workout Location</label>
              <select
                value={budgetData.location}
                onChange={(e) => handleBudgetChange("location", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBudgetEditing}
              >
                <option value="home">Home</option>
                <option value="gym">Gym</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Meals Per Day</label>
              <input
                type="number"
                min="2"
                max="6"
                value={budgetData.mealsPerDay}
                onChange={(e) => handleBudgetChange("mealsPerDay", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBudgetEditing}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Budget Style</label>
            <select
              value={budgetData.budgetStyle}
              onChange={(e) => handleBudgetChange("budgetStyle", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBudgetEditing}
            >
              <option value="saving">Saving</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        {isBudgetEditing ? (
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={handleCancelBudget}
              disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveBudget}
              disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            >
              {isSavingBudget ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Preferences are saved to your account
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Daily Reminders</div>
              <div className="text-sm text-muted-foreground">Get notified about your daily tasks</div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.dailyReminders}
              disabled={isSavingNotifications}
              onChange={(event) =>
                handleNotificationChange("dailyReminders", event.target.checked)
              }
              className="w-5 h-5 text-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Weight Tracking</div>
              <div className="text-sm text-muted-foreground">Reminders to log your weight</div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.weightTrackingReminders}
              disabled={isSavingNotifications}
              onChange={(event) =>
                handleNotificationChange(
                  "weightTrackingReminders",
                  event.target.checked
                )
              }
              className="w-5 h-5 text-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Budget Alerts</div>
              <div className="text-sm text-muted-foreground">Notifications when approaching budget limit</div>
            </div>
            <input
              type="checkbox"
              checked={notificationData.budgetAlerts}
              disabled={isSavingNotifications}
              onChange={(event) =>
                handleNotificationChange("budgetAlerts", event.target.checked)
              }
              className="w-5 h-5 text-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">Manage account security</p>
          </div>
        </div>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPasswordForm((current) => !current)}
          >
            Change Password
          </Button>

          {showPasswordForm ? (
            <form
              onSubmit={handleChangePassword}
              className="rounded-xl border border-border bg-secondary/40 p-4 space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isChangingPassword}
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData(initialPasswordData);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Update Password"}
                </Button>
              </div>
            </form>
          ) : null}

          <Button
            variant="outline"
            disabled
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground">
            Delete Account is disabled until a safe account deletion flow is added.
          </p>
        </div>
      </div>
    </div>
  );
}
