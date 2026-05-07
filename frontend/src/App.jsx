import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Skeleton } from "./components/ui/Skeleton";
import { useAuthStore } from "./store/authStore";
import { ActivityPage } from "./pages/ActivityPage";
import { DashboardHome } from "./pages/DashboardHome";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TasksPage } from "./pages/TasksPage";
import { TeamPage } from "./pages/TeamPage";

const Protected = ({ children }) => {
  const { token, isBootstrapping } = useAuthStore();
  if (isBootstrapping) {
    return (
      <div className="mx-auto mt-10 max-w-3xl space-y-2 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { token } = useAuthStore();
  if (token) return <Navigate to="/app" replace />;
  return children;
};

function App() {
  const location = useLocation();

  const page = (element) => (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {element}
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={<PublicOnly>{page(<LoginPage />)}</PublicOnly>}
        />
        <Route
          path="/register"
          element={<PublicOnly>{page(<RegisterPage />)}</PublicOnly>}
        />
        <Route
          path="/app"
          element={
            <Protected>
              <DashboardLayout />
            </Protected>
          }
        >
          <Route index element={page(<DashboardHome />)} />
          <Route path="onboarding" element={page(<OnboardingPage />)} />
          <Route path="tasks" element={page(<TasksPage />)} />
          <Route path="team" element={page(<TeamPage />)} />
          <Route path="activity" element={page(<ActivityPage />)} />
        </Route>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={page(<NotFoundPage />)} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
