"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin } from "@/utils/auth";
import Loader from "@/components/commonComponent/Loader";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        ToastNotification("error", "Please login to access this page");
        router.push("/auth/login");
        return;
      }

      if (!isAdmin()) {
        ToastNotification("error", "Access denied. Admin privileges required.");
        router.push("/dashboard");
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <Loader />;
  }

  if (!authorized) {
    return null;
  }

  return children;
};

export default AdminProtectedRoute;