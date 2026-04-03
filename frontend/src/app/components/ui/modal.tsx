import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, children, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-card rounded-3xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-auto`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  children: ReactNode;
  icon?: ReactNode;
}

export function ModalHeader({ children, icon }: ModalHeaderProps) {
  return (
    <div className="px-8 pt-8 pb-4 border-b border-border">
      {icon && (
        <div className="mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      )}
      {children}
    </div>
  );
}

export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="px-8 py-6">{children}</div>;
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="px-8 pb-8 pt-4 flex items-center justify-end gap-3 border-t border-border">{children}</div>;
}
