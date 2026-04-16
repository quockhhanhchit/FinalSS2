export function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function formatShortDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("vi-VN", {
    month: "short",
    day: "numeric",
  });
}
