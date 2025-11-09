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

const Colaborador = lazy(() =>
  import("./pages/colaborador").then((module) => ({
    default: module.Colaborador,
  }))
);

const Agendamentos = lazy(() =>
  import("./pages/agendamentos").then((module) => ({
    default: module.Agendamentos,
  }))
);

const Pacientes = lazy(() =>
  import("./pages/pacientes").then((module) => ({
    default: module.Pacientes,
  }))
);

const NovoAgendamento = lazy(() =>
  import("./pages/novo-agendamento").then((module) => ({
    default: module.NovoAgendamento,
  }))
);

const Relatorios = lazy(() =>
  import("./pages/relatorios").then((module) => ({
    default: module.Relatorios,
  }))
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userType, setUserType] = useState<'PACIENTE' | 'COLABORADOR' | null>(null) // Novo estado
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthentication();

    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      checkAuthentication();
    };

    window.addEventListener('storage', handleStorageChange);

    // Polling para verificar autenticação a cada segundo (fallback)
    const interval = setInterval(checkAuthentication, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    }
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('userToken');
    const userType = localStorage.getItem('userType') as 'PACIENTE' | 'COLABORADOR' | null;
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    setUserType(userType);
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
                element={!isAuthenticated ? <Login /> : <Navigate to={userType === 'COLABORADOR' ? "/colaborador" : "/"} replace />}
              />
              <Route
                path="/"
                element={isAuthenticated && userType === 'PACIENTE' ? <Home /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/onboarding-consulta"
                element={isAuthenticated && userType === 'PACIENTE' ? <OnboardingConsulta /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/colaborador"
                element={isAuthenticated && userType === 'COLABORADOR' ? <Colaborador /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/teleconsulta"
                element={isAuthenticated && userType === 'PACIENTE' ? <TeleConsultaEncaminhamento /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/perfil"
                element={isAuthenticated ? <Perfil /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/lembretes"
                element={isAuthenticated ? <Lembretes /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/consultas"
                element={isAuthenticated ? <Consultas /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/configuracoes"
                element={isAuthenticated ? <Configuracoes /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/assistente-virtual"
                element={isAuthenticated ? <AssistenteVirtual /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/desenvolvedores"
                element={isAuthenticated ? <Desenvolvedores /> : <Navigate to="/login" replace />}
              />
              <Route
                path="*"
                element={isAuthenticated ? <NotFound /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/agendar-consulta"
                element={isAuthenticated ? <AgendarConsulta /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/agendamentos"
                element={isAuthenticated && userType === 'COLABORADOR' ? <Agendamentos /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/pacientes"
                element={isAuthenticated && userType === 'COLABORADOR' ? <Pacientes /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/novo-agendamento"
                element={isAuthenticated && userType === 'COLABORADOR' ? <NovoAgendamento /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/relatorios"
                element={isAuthenticated && userType === 'COLABORADOR' ? <Relatorios /> : <Navigate to="/login" replace />}
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </ApiProvider>
  )
}

export default App