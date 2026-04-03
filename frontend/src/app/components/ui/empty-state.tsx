import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  image?: string;
}

export function EmptyState({ icon, title, description, action, image }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {image ? (
        <div className="w-48 h-48 mb-6 rounded-2xl overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover opacity-60" />
        </div>
      ) : (
        <div className="w-20 h-20 mb-6 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
