import clsx from "clsx";

export const Button = ({ className, variant = "primary", ...props }) => (
  <button
    className={clsx(
      "rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
      variant === "primary" &&
        "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/30 dark:bg-indigo-500 dark:hover:bg-indigo-400",
      variant === "secondary" &&
        "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
      variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
      className
    )}
    {...props}
  />
);
