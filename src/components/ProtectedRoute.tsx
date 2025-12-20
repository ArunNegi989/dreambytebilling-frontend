import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const tokenValid = isTokenValid();
  const user = localStorage.getItem("user");

  if (!tokenValid || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
