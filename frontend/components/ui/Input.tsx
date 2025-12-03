import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`block w-full px-4 py-2.5 border rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 text-slate-900 ${
            error
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30"
              : "border-slate-300 bg-white hover:border-slate-400"
          } ${
            props.type === "date"
              ? "[color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="inline-block">⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
