import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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

  return (
    <ApiProvider>
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding-consulta" element={<OnboardingConsulta />} />
            <Route path="/teleconsulta" element={<TeleConsultaEncaminhamento />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/assistente-virtual" element={<AssistenteVirtual />} />
            <Route path="/desenvolvedores" element={<Desenvolvedores />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/lembretes" element={<Lembretes />} />
            <Route path="/consultas" element={<Consultas />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
    </ApiProvider>
  )
}

export default App
