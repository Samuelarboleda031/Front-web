import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import { Dashboard } from "./components/Dashboard";
import { ClienteDashboard } from "./components/ClienteDashboard";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";

function AppContent() {
  const { isAuthenticated, isAdmin, isCliente } = useAuth();
  const [publicView, setPublicView] = useState<"landing" | "login" | "register">("landing");

  useEffect(() => {
    if (isAuthenticated) {
      setPublicView("landing");
    }
  }, [isAuthenticated]);

  // Render landing page if not authenticated
  if (!isAuthenticated) {
    if (publicView === "login") {
      return (
        <LoginPage
          onRequestRegister={() => setPublicView("register")}
          onBackToLanding={() => setPublicView("landing")}
        />
      );
    }

    if (publicView === "register") {
      return <RegisterPage onBack={() => setPublicView("login")} />;
    }

    return (
      <LandingPage
        onRequestLogin={() => setPublicView("login")}
        onRequestRegister={() => setPublicView("register")}
      />
    );
  }

  // Full dashboard for admin users
  if (isAdmin()) {
    return <Dashboard />;
  }

  // Cliente dashboard with full navigation
  if (isCliente()) {
    return <ClienteDashboard />;
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}