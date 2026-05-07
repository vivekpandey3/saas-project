export const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur transition dark:border-slate-800 dark:bg-slate-950/80 ${className}`}
  >
    {children}
  </div>
);
