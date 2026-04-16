import { Award, Flame, Trophy } from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatVnd(value) {
  return `${Math.round(Number(value || 0)).toLocaleString("vi-VN")} VND`;
}

function badgeIcon(name) {
  if (name === "3-Day Streak") return <Flame className="w-5 h-5" />;
  if (name === "Budget Master") return <Trophy className="w-5 h-5" />;
  return <Award className="w-5 h-5" />;
}

export function DashboardAnalytics({ analytics }) {
  if (!analytics) return null;

  const budget = analytics.budget_summary || {};
  const actualSpent = Number(budget.actual_cost_so_far || 0);
  const remaining = Math.max(Number(budget.remaining_budget || 0), 0);
  const donutData = [
    { name: "Đã chi", value: actualSpent },
    { name: "Còn lại", value: remaining },
  ];
  const chartData = analytics.chart_data || [];
  const badges = analytics.badges || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold">Ngân sách thực tế</h3>
            <p className="text-sm text-muted-foreground">
              So sánh chi tiêu thực tế với ngân sách kế hoạch
            </p>
          </div>
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#d1fae5" />
                  </Pie>
                  <Tooltip formatter={(value) => formatVnd(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Đã chi thực tế</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatVnd(actualSpent)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Còn lại</div>
                <div className="text-lg font-semibold">{formatVnd(remaining)}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                Kế hoạch: {formatVnd(budget.planned_cost_so_far)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold">7 ngày gần nhất</h3>
            <p className="text-sm text-muted-foreground">
              Chi phí dự kiến và chi phí thực tế theo ngày
            </p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="day" tickFormatter={(value) => `N${value}`} />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value) => formatVnd(value)} />
                <Line
                  type="monotone"
                  dataKey="planned_cost"
                  name="Dự kiến"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="actual_cost"
                  name="Thực tế"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Huy hiệu đã mở khóa</h3>
            <p className="text-sm text-muted-foreground">
              Ghi nhận chuỗi hoàn thành và kiểm soát ngân sách
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {badges.length} huy hiệu
          </div>
        </div>
        {badges.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Chưa có huy hiệu. Hoàn thành lịch hằng ngày và nhập chi phí thực tế để mở khóa.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.badge_name}
                className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm ring-1 ring-emerald-100"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  {badgeIcon(badge.badge_name)}
                </div>
                <div className="font-semibold">{badge.badge_name}</div>
                <div className="text-xs text-emerald-700">
                  {new Date(badge.earned_at).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
