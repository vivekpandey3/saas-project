export const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}>
    {children}
  </div>
);
