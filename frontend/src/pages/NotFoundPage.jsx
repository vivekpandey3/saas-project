import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-900">
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-slate-500">Page not found.</p>
      <Link to="/app" className="mt-4 inline-block text-indigo-600">
        Go to dashboard
      </Link>
    </div>
  </div>
);
