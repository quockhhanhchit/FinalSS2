import { useEffect, useMemo, useState } from "react";
import { Plus, Calendar, DollarSign, Pencil, Trash2, Activity } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";
import { formatShortDate } from "../lib/formatters";

const EMPTY_WEIGHT = { date: "", weight: "", note: "" };
const EMPTY_EXPENSE = {
  date: "",
  amount: "",
  description: "",
};

function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

function getItems(payload) {
  return Array.isArray(payload) ? payload : payload?.items || [];
}

function getPagination(payload, page) {
  if (Array.isArray(payload)) {
    return { page, totalPages: 1, total: payload.length };
  }

  return {
    page: payload?.page || page,
    totalPages: payload?.totalPages || 1,
    total: payload?.total || 0,
  };
}

function PaginationControls({ pagination, onPrevious, onNext }) {
  return (
    <div className="flex items-center justify-between pt-4">
      <div className="text-sm text-muted-foreground">
        Page {pagination.page} / {pagination.totalPages} · {pagination.total} logs
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={onPrevious}
        >
          Trước
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pagination.page >= pagination.totalPages}
          onClick={onNext}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function Tracking() {
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [weightLog, setWeightLog] = useState([]);
  const [expenseLog, setExpenseLog] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [weightPagination, setWeightPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [expensePagination, setExpensePagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [period, setPeriod] = useState("all");
  const [weightPage, setWeightPage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const [editingWeightId, setEditingWeightId] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newWeight, setNewWeight] = useState(EMPTY_WEIGHT);
  const [newExpense, setNewExpense] = useState(EMPTY_EXPENSE);

  async function loadTrackingData() {
    setIsLoading(true);
    setError("");

    try {
      const query = `period=${period}&limit=8`;
      const [weights, expenses, summary] = await Promise.all([
        apiGet(`/api/tracking/weights?${query}&page=${weightPage}`),
        apiGet(`/api/tracking/expenses?${query}&page=${expensePage}`),
        apiGet("/api/dashboard/summary"),
      ]);

      setWeightLog(
        getItems(weights).map((entry) => ({
          id: entry.id,
          date: entry.log_date,
          weight: Number(entry.weight_kg),
          note: entry.note || "",
        })),
      );
      setExpenseLog(
        getItems(expenses).map((entry) => ({
          id: entry.id,
          date: entry.log_date,
          amount: Number(entry.amount),
          description: entry.description || "",
        })),
      );
      setWeightPagination(getPagination(weights, weightPage));
      setExpensePagination(getPagination(expenses, expensePage));
      setDashboard(summary);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTrackingData();
  }, [period, weightPage, expensePage]);

  const resetWeightForm = () => {
    setNewWeight(EMPTY_WEIGHT);
    setEditingWeightId(null);
    setShowWeightForm(false);
  };

  const resetExpenseForm = () => {
    setNewExpense(EMPTY_EXPENSE);
    setEditingExpenseId(null);
    setShowExpenseForm(false);
  };

  const handleAddOrUpdateWeight = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        date: newWeight.date,
        weight: Number(newWeight.weight),
        note: newWeight.note,
      };

      if (editingWeightId) {
        await apiPut(`/api/tracking/weights/${editingWeightId}`, payload);
      } else {
        await apiPost("/api/tracking/weights", payload);
        setWeightPage(1);
      }

      resetWeightForm();
      await loadTrackingData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOrUpdateExpense = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        date: newExpense.date,
        amount: Number(newExpense.amount),
        description: newExpense.description,
      };

      if (editingExpenseId) {
        await apiPut(`/api/tracking/expenses/${editingExpenseId}`, payload);
      } else {
        await apiPost("/api/tracking/expenses", payload);
        setExpensePage(1);
      }

      resetExpenseForm();
      await loadTrackingData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWeight = async (entryId) => {
    if (!window.confirm("Xóa bản ghi cân nặng này?")) return;

    try {
      await apiDelete(`/api/tracking/weights/${entryId}`);
      await loadTrackingData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDeleteExpense = async (entryId) => {
    if (!window.confirm("Xóa bản ghi chi tiêu này?")) return;

    try {
      await apiDelete(`/api/tracking/expenses/${entryId}`);
      await loadTrackingData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const beginEditWeight = (entry) => {
    setEditingWeightId(entry.id);
    setNewWeight({
      date: toInputDate(entry.date),
      weight: String(entry.weight),
      note: entry.note || "",
    });
    setShowWeightForm(true);
  };

  const beginEditExpense = (entry) => {
    setEditingExpenseId(entry.id);
    setNewExpense({
      date: toInputDate(entry.date),
      amount: String(entry.amount),
      description: entry.description || "",
    });
    setShowExpenseForm(true);
  };

  const weeklyExpenses = useMemo(() => {
    const logs = dashboard?.expenseLogs || [];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return logs
      .filter((entry) => new Date(entry.log_date) >= weekAgo)
      .reduce((sum, entry) => sum + Number(entry.amount), 0);
  }, [dashboard]);

  const currentWeight = Number(dashboard?.currentWeight || 0);
  const startWeight = Number(dashboard?.startWeight || 0);
  const weightChange =
    currentWeight && startWeight ? currentWeight - startWeight : 0;
  const goalWeight = Number(dashboard?.goalWeight || 0);
  const totalExpenses = Number(dashboard?.totalSpent || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Theo dõi</h1>
          <p className="text-muted-foreground">
            Theo dõi tiến độ cân nặng và chi tiêu của bạn
          </p>
        </div>
        <select
          value={period}
          onChange={(event) => {
            setPeriod(event.target.value);
            setWeightPage(1);
            setExpensePage(1);
          }}
          className="h-10 px-3 rounded-lg border border-border bg-background"
        >
          <option value="all">Tất cả</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white shadow-lg dark:border-emerald-800">
        <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-semibold">
              Hãy cập nhật cân nặng của bạn mỗi tuần
            </div>
            <p className="text-sm text-white/85">
              Ghi nhận đều đặn giúp hệ thống theo dõi tiến độ và điều chỉnh kế hoạch chính xác hơn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Cân nặng hiện tại</div>
          <div className="text-2xl font-bold">{currentWeight || "--"} kg</div>
          <div className={`text-xs mt-1 ${weightChange <= 0 ? "text-primary" : "text-orange-500"}`}>
            {currentWeight && startWeight ? `${weightChange.toFixed(1)} kg so với ban đầu` : "Chưa có dữ liệu"}
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Cân nặng mục tiêu</div>
          <div className="text-2xl font-bold">
            {goalWeight ? `${goalWeight.toFixed(1)} kg` : "-- kg"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Từ mục tiêu hồ sơ</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Chi tiêu tuần</div>
          <div className="text-2xl font-bold">{Math.round(weeklyExpenses / 1000)}k</div>
          <div className="text-xs text-muted-foreground mt-1">VND</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Tổng đã chi</div>
          <div className="text-2xl font-bold">{Math.round(totalExpenses / 1000)}k</div>
          <div className="text-xs text-primary mt-1">Dữ liệu từ hệ thống</div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Đang lấy dữ liệu...
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Nhật ký cân nặng</h3>
            <Button
              size="sm"
              onClick={() => {
                setShowWeightForm(!showWeightForm);
                setEditingWeightId(null);
                setNewWeight(EMPTY_WEIGHT);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm bản ghi
            </Button>
          </div>

          {showWeightForm ? (
            <form onSubmit={handleAddOrUpdateWeight} className="mb-6 p-4 bg-secondary/50 rounded-xl space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weightDate">Ngày</Label>
                <Input
                  id="weightDate"
                  type="date"
                  value={newWeight.date}
                  onChange={(event) => setNewWeight({ ...newWeight, date: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightValue">Cân nặng (kg)</Label>
                <Input
                  id="weightValue"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={newWeight.weight}
                  onChange={(event) => setNewWeight({ ...newWeight, weight: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightNote">Ghi chú (tùy chọn)</Label>
                <Input
                  id="weightNote"
                  type="text"
                  placeholder="Cân buổi sáng"
                  value={newWeight.note}
                  onChange={(event) => setNewWeight({ ...newWeight, note: event.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : editingWeightId ? "Cập nhật" : "Lưu"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={resetWeightForm}>
                  Hủy
                </Button>
              </div>
            </form>
          ) : null}

          <div className="space-y-2">
            {!isLoading && weightLog.length === 0 ? (
              <EmptyState message="Bạn chưa ghi nhận cân nặng nào. Hãy thêm mới ngay!" />
            ) : null}

            {weightLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{entry.weight} kg</div>
                    {entry.note ? (
                      <div className="text-xs text-muted-foreground">{entry.note}</div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    {formatShortDate(entry.date)}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => beginEditWeight(entry)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteWeight(entry.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!isLoading ? (
            <PaginationControls
              pagination={weightPagination}
              onPrevious={() => setWeightPage((page) => Math.max(page - 1, 1))}
              onNext={() => setWeightPage((page) => page + 1)}
            />
          ) : null}
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Nhật ký chi tiêu</h3>
            <Button
              size="sm"
              onClick={() => {
                setShowExpenseForm(!showExpenseForm);
                setEditingExpenseId(null);
                setNewExpense(EMPTY_EXPENSE);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm chi tiêu
            </Button>
          </div>

          {showExpenseForm ? (
            <form onSubmit={handleAddOrUpdateExpense} className="mb-6 p-4 bg-secondary/50 rounded-xl space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Ngày</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={newExpense.date}
                  onChange={(event) => setNewExpense({ ...newExpense, date: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseAmount">Số tiền (VND)</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  placeholder="50000"
                  value={newExpense.amount}
                  onChange={(event) => setNewExpense({ ...newExpense, amount: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDescription">Mô tả (tùy chọn)</Label>
                <Input
                  id="expenseDescription"
                  type="text"
                  placeholder="Bữa ăn trong ngày"
                  value={newExpense.description}
                  onChange={(event) => setNewExpense({ ...newExpense, description: event.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : editingExpenseId ? "Cập nhật" : "Lưu"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={resetExpenseForm}>
                  Hủy
                </Button>
              </div>
            </form>
          ) : null}

          <div className="space-y-2">
            {!isLoading && expenseLog.length === 0 ? (
              <EmptyState message="Bạn chưa ghi nhận chi tiêu nào. Hãy thêm mới ngay!" />
            ) : null}

            {expenseLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {entry.amount.toLocaleString("vi-VN")} VND
                    </div>
                    {entry.description ? (
                      <div className="text-xs text-muted-foreground">
                        {entry.description}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded-md border border-green-200 bg-green-50 text-xs text-green-700">
                    Ăn uống
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatShortDate(entry.date)}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => beginEditExpense(entry)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteExpense(entry.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!isLoading ? (
            <PaginationControls
              pagination={expensePagination}
              onPrevious={() => setExpensePage((page) => Math.max(page - 1, 1))}
              onNext={() => setExpensePage((page) => page + 1)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
