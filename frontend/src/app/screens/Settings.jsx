import { useEffect, useState } from "react";
import { Flame, User, Bell, Lock, Wallet, Target } from "lucide-react";
import { Button } from "../components/ui/button";
import { getAuthSession } from "../lib/auth";
import { apiGet, apiPost, apiPut } from "../lib/api";
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
  const [planStatus, setPlanStatus] = useState(null);
  const [isReturningToRace, setIsReturningToRace] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const [profile, notifications, currentPlan] = await Promise.all([
          apiGet("/api/profile"),
          apiGet("/api/profile/notifications"),
          apiGet("/api/plans/current").catch(() => null),
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
        setPlanStatus(currentPlan);
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
      showToast("Đã lưu tùy chọn thông báo.", "success");
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
      setError("Tuổi là bắt buộc và phải lớn hơn 0.");
      return;
    }

    if (!hasValidPositiveNumber(bodyGoalsData.height)) {
      setError("Chiều cao là bắt buộc và phải lớn hơn 0.");
      return;
    }

    if (!hasValidPositiveNumber(bodyGoalsData.weight)) {
      setError("Cân nặng là bắt buộc và phải lớn hơn 0.");
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
      window.localStorage.setItem(
        "budgetfit:profile-updated-at",
        String(Date.now())
      );
      window.dispatchEvent(
        new CustomEvent("budgetfit:profile-updated", {
          detail: {
            age: Number(bodyGoalsData.age),
            gender: bodyGoalsData.gender,
            height: Number(bodyGoalsData.height),
            weight: Number(bodyGoalsData.weight),
            goal: bodyGoalsData.goal,
            duration: Number(bodyGoalsData.duration),
          },
        })
      );
      setSavedBodyGoalsData(bodyGoalsData);
      setIsBodyGoalsEditing(false);
      showToast("Đã lưu chỉ số cơ thể và mục tiêu.", "success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingBodyGoals(false);
    }
  };

  const handleSaveBudget = async () => {
    setError("");

    if (!hasValidPositiveNumber(budgetData.budget)) {
      setError("Ngân sách là bắt buộc và phải lớn hơn 0.");
      return;
    }

    if (Number(budgetData.budget) < 3000000) {
      setError("Ngân sách tối thiểu là 3.000.000 VND.");
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
      window.localStorage.setItem(
        "budgetfit:budget-updated-at",
        String(Date.now())
      );
      window.dispatchEvent(
        new CustomEvent("budgetfit:budget-updated", {
          detail: {
            budget: Number(budgetData.budget),
            location: budgetData.location,
            mealsPerDay: Number(budgetData.mealsPerDay),
            budgetStyle: budgetData.budgetStyle,
          },
        })
      );
      setSavedBudgetData(budgetData);
      setIsBudgetEditing(false);
      showToast("Đã lưu ngân sách và tùy chọn.", "success");
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
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await apiPut("/api/auth/change-password", passwordData);
      setPasswordData(initialPasswordData);
      setShowPasswordForm(false);
      showToast("Đã đổi mật khẩu thành công.", "success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleReturnToRace = async () => {
    setIsReturningToRace(true);
    setError("");

    try {
      await apiPost("/api/plans/current/continue", {
        startFromToday: true,
      });
      const currentPlan = await apiGet("/api/plans/current");
      setPlanStatus(currentPlan);
      showToast("Đã khởi động lại cuộc đua 30 ngày từ hôm nay.", "success");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsReturningToRace(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Cài đặt</h1>
        <p className="text-muted-foreground">
          Xem lại và cập nhật thông tin bạn đã nhập trong onboarding
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {planStatus?.has_declined_continuation ? (
        <div className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-6 shadow-sm dark:border-orange-900/60 dark:from-orange-950/50 dark:via-slate-900 dark:to-rose-950/40">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shadow-orange-500/25">
              <Flame className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">Trở lại cuộc đua 30 ngày</h3>
              <p className="text-sm text-muted-foreground">
                Bạn đã tạm dừng sau chu kỳ trước. Bấm nút này để tạo 30 ngày mới bắt đầu từ hôm nay.
              </p>
            </div>
            <Button
              onClick={handleReturnToRace}
              disabled={isReturningToRace || isLoading}
              className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20"
            >
              {isReturningToRace ? "Đang tạo..." : "Bắt đầu lại"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Thông tin tài khoản</h3>
            <p className="text-sm text-muted-foreground">
              Thông tin tài khoản được lấy từ hệ thống đăng nhập
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Họ và tên</label>
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
            <h3 className="text-lg font-semibold">Cơ thể & mục tiêu</h3>
            <p className="text-sm text-muted-foreground">
              Các giá trị này được lấy từ hồ sơ onboarding của bạn
            </p>
          </div>
          <Button
            variant={isBodyGoalsEditing ? "outline" : "default"}
            onClick={() => setIsBodyGoalsEditing((current) => !current)}
            disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            className="ml-auto"
          >
            {isBodyGoalsEditing ? "Dừng sửa" : "Sửa"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tuổi</label>
              <input
                type="number"
                value={bodyGoalsData.age}
                onChange={(e) => handleBodyGoalsChange("age", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Chiều cao (cm)</label>
              <input
                type="number"
                value={bodyGoalsData.height}
                onChange={(e) => handleBodyGoalsChange("height", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cân nặng (kg)</label>
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
            <label className="text-sm font-medium mb-2 block">Giới tính</label>
            <select
              value={bodyGoalsData.gender}
              onChange={(e) => handleBodyGoalsChange("gender", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mục tiêu</label>
              <select
                value={bodyGoalsData.goal}
                onChange={(e) => handleBodyGoalsChange("goal", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBodyGoalsEditing}
              >
                <option value="lose">Giảm cân</option>
                <option value="maintain">Giữ cân</option>
                <option value="gain">Tăng cân</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Thời lượng (ngày)</label>
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
              Hủy
            </Button>
            <Button
              onClick={handleSaveBodyGoals}
              disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            >
              {isSavingBodyGoals ? "Đang lưu..." : "Lưu thay đổi"}
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
            <h3 className="text-lg font-semibold">Ngân sách & tùy chọn</h3>
            <p className="text-sm text-muted-foreground">
              Điều chỉnh các tùy chọn ngân sách dùng để tạo kế hoạch
            </p>
          </div>
          <Button
            variant={isBudgetEditing ? "outline" : "default"}
            onClick={() => setIsBudgetEditing((current) => !current)}
            disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            className="ml-auto"
          >
            {isBudgetEditing ? "Dừng sửa" : "Sửa"}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Ngân sách hàng tháng (VND)</label>
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
              <label className="text-sm font-medium mb-2 block">Địa điểm tập luyện</label>
              <select
                value={budgetData.location}
                onChange={(e) => handleBudgetChange("location", e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBudgetEditing}
              >
                <option value="home">Tại nhà</option>
                <option value="gym">Phòng gym</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Số bữa mỗi ngày</label>
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
            <label className="text-sm font-medium mb-2 block">Phong cách chi tiêu</label>
            <select
              value={budgetData.budgetStyle}
              onChange={(e) => handleBudgetChange("budgetStyle", e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading || isSavingBodyGoals || isSavingBudget || !isBudgetEditing}
            >
              <option value="saving">Tiết kiệm</option>
              <option value="normal">Cân bằng</option>
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
              Hủy
            </Button>
            <Button
              onClick={handleSaveBudget}
              disabled={isLoading || isSavingBodyGoals || isSavingBudget}
            >
              {isSavingBudget ? "Đang lưu..." : "Lưu thay đổi"}
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
            <h3 className="text-lg font-semibold">Thông báo</h3>
            <p className="text-sm text-muted-foreground">
              Tùy chọn sẽ được lưu vào tài khoản của bạn
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Nhắc nhở hằng ngày</div>
              <div className="text-sm text-muted-foreground">Nhận thông báo về nhiệm vụ trong ngày</div>
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
              <div className="font-medium">Theo dõi cân nặng</div>
              <div className="text-sm text-muted-foreground">Nhắc bạn ghi nhận cân nặng</div>
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
              <div className="font-medium">Cảnh báo ngân sách</div>
              <div className="text-sm text-muted-foreground">Thông báo khi gần chạm giới hạn ngân sách</div>
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
            <h3 className="text-lg font-semibold">Bảo mật</h3>
            <p className="text-sm text-muted-foreground">Quản lý bảo mật tài khoản</p>
          </div>
        </div>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPasswordForm((current) => !current)}
          >
            Đổi mật khẩu
          </Button>

          {showPasswordForm ? (
            <form
              onSubmit={handleChangePassword}
              className="rounded-xl border border-border bg-secondary/40 p-4 space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">Mật khẩu hiện tại</label>
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
                <label className="text-sm font-medium mb-2 block">Mật khẩu mới</label>
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
                <label className="text-sm font-medium mb-2 block">Xác nhận mật khẩu mới</label>
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
                  Hủy
                </Button>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Đang đổi..." : "Cập nhật mật khẩu"}
                </Button>
              </div>
            </form>
          ) : null}

          <Button
            variant="outline"
            disabled
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Xóa tài khoản
          </Button>
          <p className="text-xs text-muted-foreground">
            Chức năng xóa tài khoản đang tắt cho đến khi có quy trình xóa an toàn.
          </p>
        </div>
      </div>
    </div>
  );
}
