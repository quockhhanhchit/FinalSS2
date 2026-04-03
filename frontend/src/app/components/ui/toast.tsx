import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastCounter = 0;
const toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function showToast(message: string, type: ToastType = "info", duration = 4000) {
  const id = `toast-${toastCounter++}`;
  const newToast: Toast = { id, message, type, duration };
  toasts = [...toasts, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts);
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-96">
      {currentToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-green-50 text-green-900 border-green-200",
    error: "bg-red-50 text-red-900 border-red-200",
    info: "bg-blue-50 text-blue-900 border-blue-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl border shadow-lg animate-in slide-in-from-right ${styles[toast.type]}`}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="flex-shrink-0 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
