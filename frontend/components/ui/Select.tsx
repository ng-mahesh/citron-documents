import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`block w-full px-4 py-2.5 h-[42px] border rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 appearance-none bg-no-repeat bg-right ${
            error
              ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30'
              : 'border-slate-300 bg-white hover:border-slate-400'
          } ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.5rem 1.5rem',
            paddingRight: '2.5rem',
          }}
          {...props}
        >
          <option value="" className="text-slate-400">Select an option...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-slate-900">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="inline-block">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
