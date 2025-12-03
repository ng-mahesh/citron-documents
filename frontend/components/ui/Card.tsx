import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  subtitle,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-8 py-5 border-b border-slate-200">
          {title && (
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
      )}
      <div className="px-8 py-6">{children}</div>
    </div>
  );
};
