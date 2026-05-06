import clsx from "clsx";

export const Input = ({ className, label, ...props }) => (
  <label className="flex w-full flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
    {label && <span>{label}</span>}
    <input
      className={clsx(
        "rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-indigo-200 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
        className
      )}
      {...props}
    />
  </label>
);
