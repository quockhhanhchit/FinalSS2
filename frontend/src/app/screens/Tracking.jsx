import { useEffect, useMemo, useState } from "react";
import { Plus, Calendar, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { apiGet, apiPost } from "../lib/api";
import { formatShortDate } from "../lib/formatters";

export function Tracking() {
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [weightLog, setWeightLog] = useState([]);
  const [expenseLog, setExpenseLog] = useState([]);
  const [error, setError] = useState("");

  const [newWeight, setNewWeight] = useState({ date: "", weight: "", note: "" });
  const [newExpense, setNewExpense] = useState({
    date: "",
    category: "Food",
    amount: "",
    description: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadTrackingData() {
      try {
        const [weights, expenses] = await Promise.all([
          apiGet("/api/tracking/weights"),
          apiGet("/api/tracking/expenses"),
        ]);

        if (!ignore) {
          setWeightLog(
            weights.map((entry) => ({
              id: entry.id,
              date: entry.log_date,
              weight: Number(entry.weight_kg),
              note: entry.note || "",
            })),
          );
          setExpenseLog(
            expenses.map((entry) => ({
              id: entry.id,
              date: entry.log_date,
              category: entry.category,
              amount: Number(entry.amount),
              description: entry.description || "",
            })),
          );
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadTrackingData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleAddWeight = async (e) => {
    e.preventDefault();

    try {
      const weight = await apiPost("/api/tracking/weights", {
        date: newWeight.date,
        weight: Number(newWeight.weight),
        note: newWeight.note,
      });

      setWeightLog([{ ...weight, weight: Number(weight.weight) }, ...weightLog]);
      setNewWeight({ date: "", weight: "", note: "" });
      setShowWeightForm(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    try {
      const expense = await apiPost("/api/tracking/expenses", {
        date: newExpense.date,
        category: newExpense.category,
        amount: Number(newExpense.amount),
        description: newExpense.description,
      });

      setExpenseLog([{ ...expense, amount: Number(expense.amount) }, ...expenseLog]);
      setNewExpense({ date: "", category: "Food", amount: "", description: "" });
      setShowExpenseForm(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const totalExpenses = useMemo(
    () => expenseLog.reduce((sum, exp) => sum + exp.amount, 0),
    [expenseLog],
  );
  const weeklyExpenses = expenseLog
    .filter((exp) => new Date(exp.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const weightChange =
    weightLog.length >= 2 ? weightLog[0].weight - weightLog[weightLog.length - 1].weight : 0;

  const getCategoryColor = (category) => {
    switch (category) {
      case "Food":
        return "bg-green-50 text-green-700 border-green-200";
      case "Workout":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Wellness":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Buffer":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Tracking</h1>
        <p className="text-muted-foreground">
          Monitor your weight progress and expenses
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Current Weight</div>
          <div className="text-2xl font-bold">{weightLog[0]?.weight || "--"} kg</div>
          <div className={`text-xs mt-1 ${weightChange < 0 ? "text-primary" : "text-orange-500"}`}>
            {weightChange > 0 ? "+" : ""}
            {weightChange.toFixed(1)} kg
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Goal Weight</div>
          <div className="text-2xl font-bold">65.0 kg</div>
          <div className="text-xs text-muted-foreground mt-1">Track from dashboard</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Weekly Spending</div>
          <div className="text-2xl font-bold">{Math.round(weeklyExpenses / 1000)}k</div>
          <div className="text-xs text-muted-foreground mt-1">VND</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
          <div className="text-2xl font-bold">{Math.round(totalExpenses / 1000)}k</div>
          <div className="text-xs text-primary mt-1">Live backend data</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Weight Log</h3>
            <Button
              size="sm"
              onClick={() => setShowWeightForm(!showWeightForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </Button>
          </div>

          {showWeightForm && (
            <form onSubmit={handleAddWeight} className="mb-6 p-4 bg-secondary/50 rounded-xl space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weightDate">Date</Label>
                <Input
                  id="weightDate"
                  type="date"
                  value={newWeight.date}
                  onChange={(e) => setNewWeight({ ...newWeight, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightValue">Weight (kg)</Label>
                <Input
                  id="weightValue"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={newWeight.weight}
                  onChange={(e) => setNewWeight({ ...newWeight, weight: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightNote">Note (optional)</Label>
                <Input
                  id="weightNote"
                  type="text"
                  placeholder="Morning weight"
                  value={newWeight.note}
                  onChange={(e) => setNewWeight({ ...newWeight, note: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowWeightForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {weightLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{entry.weight} kg</div>
                    {entry.note && (
                      <div className="text-xs text-muted-foreground">{entry.note}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatShortDate(entry.date)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Expense Log</h3>
            <Button
              size="sm"
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>

          {showExpenseForm && (
            <form onSubmit={handleAddExpense} className="mb-6 p-4 bg-secondary/50 rounded-xl space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Date</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseCategory">Category</Label>
                <select
                  id="expenseCategory"
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                  required
                >
                  <option value="Food">Food</option>
                  <option value="Workout">Workout</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Buffer">Buffer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseAmount">Amount (VND)</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  placeholder="50000"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDescription">Description</Label>
                <Input
                  id="expenseDescription"
                  type="text"
                  placeholder="Daily meals"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowExpenseForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
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
                    <div className="text-xs text-muted-foreground">
                      {entry.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-md border text-xs ${getCategoryColor(entry.category)}`}>
                    {entry.category}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatShortDate(entry.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
