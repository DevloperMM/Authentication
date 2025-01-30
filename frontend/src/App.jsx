import React, { useEffect } from "react";
import Floats from "./components/Floats";
import Loader from "./components/Loader";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import { useAuthStore } from "./store/authStore";

const ProtectAuthRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user.isVerified) return <Navigate to="/verify-email" replace />;

  return children;
};

const RedirectAuthUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) return <Navigate to="/" replace />;

  return children;
};

function App() {
  const { checkAuth, isCheckingAuth, setError } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    setError();
  }, [location.pathname]);

  if (isCheckingAuth) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden select-none">
      <Floats
        color="bg-green-500"
        size="w-56 h-56"
        top="-5%"
        left="10%"
        delay={0}
      />
      <Floats
        color="bg-emerald-500"
        size="w-42 h-42"
        top="70%"
        left="80%"
        delay={5}
      />
      <Floats
        color="bg-lime-500"
        size="w-28 h-28"
        top="40%"
        left="-10%"
        delay={2}
      />

      <Routes>
        <Route
          path="/"
          element={
            <ProtectAuthRoute>
              <HomePage />
            </ProtectAuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectAuthUser>
              <SignupPage />
            </RedirectAuthUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthUser>
              <LoginPage />
            </RedirectAuthUser>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
      </Routes>
    </div>
  );
}

export default App;
