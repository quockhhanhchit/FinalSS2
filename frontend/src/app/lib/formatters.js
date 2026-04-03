export function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function formatShortDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
