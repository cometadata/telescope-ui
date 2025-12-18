"use client";

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  mobile?: boolean;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
  className = "",
  mobile = false,
}: FilterSelectProps) {
  const baseClasses = mobile
    ? "w-full px-3 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-neutral-600"
    : "px-3 py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md text-sm text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:border-gray-400 dark:hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-neutral-600";

  if (mobile) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClasses} ${className}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseClasses} ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
