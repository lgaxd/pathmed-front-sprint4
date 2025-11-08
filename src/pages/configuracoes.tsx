import { useNavigate } from 'react-router-dom';
import { ConfigContainer } from '../components/configuracoes/config-container';
import { ConfiguracoesHeader } from '../components/configuracoes/configuracoes-header';
import { UserInfoCard } from '../components/configuracoes/card-info-usuario';
import { ConfigSection } from '../components/configuracoes/config';
import { ListItem } from '../components/configuracoes/lista-item';
import { Sidebar } from '../components/sidebar';
import { Overlay } from '../components/overlay';
import { Header } from '../components/header';
import { useState } from 'react';

export function Configuracoes() {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        navigate("/login");
        console.log("Usuário deslogado!");
    };

    return (
        <>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <ConfigContainer>
                <ConfiguracoesHeader titulo="Configurações" />

                <UserInfoCard
                    nome="Nelson Oliveira Lima"
                    idade="63"
                    tipoSanguineo="AB+"
                />

                <ConfigSection titulo="Suporte">
                    <ListItem
                        texto="Central de suporte"
                        onClick={() => handleNavigation('/suporte')}
                    />
                    <ListItem
                        texto="Envie um feedback"
                        onClick={() => handleNavigation('/feedback')}
                    />
                    <ListItem
                        texto="Reporte um bug"
                        onClick={() => handleNavigation('/reportar-bug')}
                    />
                    <ListItem
                        texto="Política de Privacidade"
                        onClick={() => handleNavigation('/privacidade')}
                    />
                    <ListItem
                        texto="Termos e Condições"
                        onClick={() => handleNavigation('/termos-condicoes')}
                    />
                </ConfigSection>

                <ConfigSection titulo="Mais">
                    <ListItem
                        texto="Desenvolvedores"
                        onClick={() => handleNavigation('/desenvolvedores')}
                    />
                </ConfigSection>
            </ConfigContainer>
        </>
    );
}