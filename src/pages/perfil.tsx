import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { PerfilCard } from "../components/perfil/card-perfil";
import fotoUsuario from "../assets/imgs/onboarding/paciente-passo-3.png";

export function Perfil() {

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
            <PerfilCard
                nome="Nelson Oliveira Lima"
                dataNascimento="10/05/1962"
                tipoSanguineo="AB+"
                imagemUrl={fotoUsuario}
                telefone="(11) 91234-5678"
                email="nelson@gmail.com"
                endereco="Rua das Flores, 123 - São Paulo, SP"
                rghc="1234567890"
            />
        </>
    );
}