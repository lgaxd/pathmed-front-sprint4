import { OnboardingContainer } from '../components/onboarding/onboarding-container';
import { OnboardingHeader } from '../components/onboarding/onboarding-header';
import { OnboardingStep } from '../components/onboarding/etapa-onboarding';
import { ProgressIndicator } from '../components/onboarding/indicador-progresso';
import { OnboardingButtons } from '../components/onboarding/botoes-onboarding';
import { useOnboarding } from '../hooks/usar-onboardings';
import { onboardingSteps } from '../utils/lista-etapas-onboarding';
import { Sidebar } from '../components/sidebar';
import { Overlay } from '../components/overlay';
import { Header } from '../components/header';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function OnboardingConsulta() {
  const navigate = useNavigate();
  const totalPassos = onboardingSteps.length;
  const { passoAtual, avancarPasso, voltarPasso } = useOnboarding({ totalPassos });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate("/login");
    console.log("Usuário deslogado!");
  };

  const passoAtualData = onboardingSteps[passoAtual - 1];

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <OnboardingContainer>
        <OnboardingHeader
          nomePaciente="Nelson"
        />

        <div className="mb-8">
          <OnboardingStep
            imagem={passoAtualData.imagem}
            titulo={passoAtualData.titulo}
            descricao={passoAtualData.descricao}
          />
        </div>

        <ProgressIndicator
          passoAtual={passoAtual}
          totalPassos={totalPassos}
        />

        <OnboardingButtons
          passoAtual={passoAtual}
          totalPassos={totalPassos}
          onVoltar={voltarPasso}
          onAvancar={avancarPasso}
        />
      </OnboardingContainer>
    </>
  );
}