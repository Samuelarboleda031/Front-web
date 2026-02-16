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

  const [resetData, setResetData] = useState<{ email: string; token: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setPublicView("landing");
    }

    // Solución REAL: Detectar parámetros y ruta de recuperación
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    const isResetPage = window.location.pathname.includes('reset-password');

    if ((mode === 'resetPassword' || isResetPage) && oobCode) {
      console.log('🎯 Solución REAL: Detectado oobCode, abriendo formulario personalizado');
      setPublicView("login");
      setResetData({ email: '', token: oobCode });

      // Limpiar la URL para una experiencia limpia
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [isAuthenticated]);

  // Render landing page if not authenticated
  if (!isAuthenticated) {
    if (publicView === "login") {
      return (
        <LoginPage
          onRequestRegister={() => setPublicView("register")}
          onBackToLanding={() => setPublicView("landing")}
          initialResetData={resetData}
          onResetComplete={() => setResetData(null)}
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