import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ErrorFallback } from "./components/error-fallback";
import { ErrorBoundary } from "react-error-boundary";
import { Loading } from "./components/loading";
import { ApiProvider } from "./contexts/api-context";

const Home = lazy(() =>
  import("./pages/home").then((module) => ({
    default: module.Home,
  }))
);

const NotFound = lazy(() =>
  import("./pages/not-found").then((module) => ({
    default: module.NotFound,
  }))
);

const Login = lazy(() =>
  import("./pages/login").then((module) => ({
    default: module.Login,
  }))
);

const OnboardingConsulta = lazy(() =>
  import("./pages/onboarding-consulta").then((module) => ({
    default: module.OnboardingConsulta,
  }))
);

const TeleConsultaEncaminhamento = lazy(() =>
  import("./pages/teleconsulta").then((module) => ({
    default: module.TeleConsultaEncaminhamento,
  }))
);

const Configuracoes = lazy(() =>
  import("./pages/configuracoes").then((module) => ({
    default: module.Configuracoes,
  }))
);

const AssistenteVirtual = lazy(() =>
  import("./pages/assistente-virtual").then((module) => ({
    default: module.AssistenteVirtual,
  }))
);

const Desenvolvedores = lazy(() =>
  import("./pages/desenvolvedores").then((module) => ({
    default: module.Desenvolvedores,
  }))
);

const Perfil = lazy(() =>
  import("./pages/perfil").then((module) => ({
    default: module.Perfil,
  }))
);

const Lembretes = lazy(() =>
  import("./pages/lembretes").then((module) => ({
    default: module.Lembretes,
  }))
);

const Consultas = lazy(() =>
  import("./pages/consultas").then((module) => ({
    default: module.Consultas,
  }))
);

const AgendarConsulta = lazy(() =>
  import("./pages/agendar-consulta").then((module) => ({
    default: module.AgendarConsulta,
  }))
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthentication();

    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      checkAuthentication();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('userToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  if (loading) {
    return <Loading />
  }

  return (
    <ApiProvider>
      <BrowserRouter>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route
                path="/login"
                element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
              />
              <Route
                path="/"
                element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
              />
              <Route
                path="/onboarding-consulta"
                element={isAuthenticated ? <OnboardingConsulta /> : <Navigate to="/login" />}
              />
              {/* Criar as outras rotas */}

              <Route
                path="/teleconsulta"
                element={isAuthenticated ? <TeleConsultaEncaminhamento /> : <Navigate to="/login" />}
              />

              <Route
                path="/perfil"
                element={isAuthenticated ? <Perfil /> : <Navigate to="/login" />}
              />

              <Route
                path="/lembretes"
                element={isAuthenticated ? <Lembretes /> : <Navigate to="/login" />}
              />

              <Route
                path="/consultas"
                element={isAuthenticated ? <Consultas /> : <Navigate to="/login" />}
              />

              <Route
                path="/configuracoes"
                element={isAuthenticated ? <Configuracoes /> : <Navigate to="/login" />}
              />

              <Route
                path="/assistente-virtual"
                element={isAuthenticated ? <AssistenteVirtual /> : <Navigate to="/login" />}
              />

              <Route
                path="/desenvolvedores"
                element={isAuthenticated ? <Desenvolvedores /> : <Navigate to="/login" />}
              />
              <Route
                path="*"
                element={isAuthenticated ? <NotFound /> : <Navigate to="/login" />}
              />
              <Route
                path="/agendar-consulta"
                element={isAuthenticated ? <AgendarConsulta /> : <Navigate to="/login" />}
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </ApiProvider>
  )
}

export default App
