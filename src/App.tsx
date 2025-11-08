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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

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
              {/* Proteger todas as outras rotas */}
              <Route 
                path="*" 
                element={isAuthenticated ? <NotFound /> : <Navigate to="/login" />} 
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </ApiProvider>
  )
}

export default App
