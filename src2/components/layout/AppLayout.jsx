import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { selectAuthLoading } from "../../store/slices/authSlice";
import { useAuth } from "../../hooks/useAuth";

export const AppLayout = () => {
  const isLoading = useSelector(selectAuthLoading);
  const location = useLocation();
  const { initializeAuth } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Never show loading spinner on auth pages to prevent component remounting
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  console.log(
    "AppLayout render: isLoading:",
    isLoading,
    "isAuthPage:",
    isAuthPage,
    "path:",
    location.pathname,
  );

  if (isLoading && !isAuthPage) {
    console.log("AppLayout: Showing loading spinner for non-auth page");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
