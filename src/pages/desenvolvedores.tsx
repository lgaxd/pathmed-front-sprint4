import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { DevCard } from "../components/desenvolvedores/dev-cards";
import Lucas from "../assets/imgs/utils/lucasgrillo.png";   
import Augusto from "../assets/imgs/utils/augusto.jpg";   
import Pietro from "../assets/imgs/utils/pietro.png";

export function Desenvolvedores() {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
        console.log("Usuário deslogado!");
    };

    return (
        <>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="min-h-screen bg-gray-50 p-6">
                <h1 className="text-2xl font-bold mb-6">Desenvolvedores</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DevCard
                        nome="Lucas Grillo Alcântara"
                        rm="561413"
                        foto={Lucas}
                        linkedin="https://www.linkedin.com/in/lgaxd/"
                        github="https://github.com/lgaxd"
                    />
                    <DevCard
                        nome="Augusto Buguas Rodrigues"
                        rm="563858"
                        foto={Augusto}
                        linkedin="https://www.linkedin.com/in/augusto-buguas-154308280/"
                        github="https://github.com/augustofiap"
                    />
                    <DevCard
                        nome="Pietro Abrahamian"
                        rm="561469"
                        foto={Pietro}
                        linkedin="https://www.linkedin.com/in/pietro-abrahamian/"
                        github="https://github.com/pietroabrahamian"
                    />
                </div>
            </div>
        </>
    );
}