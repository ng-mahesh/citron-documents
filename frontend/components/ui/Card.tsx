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
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200">
          {title && (
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
      )}
      <div className="px-4 py-5 sm:px-6 sm:py-6">{children}</div>
    </div>
  );
};
