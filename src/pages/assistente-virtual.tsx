import { ChatContainer } from '../components/assistente/chat-container';
import { ChatHeader } from '../components/assistente/chat-header';
import { MessageList } from '../components/assistente/lista-mensagens';
import { MessageInput } from '../components/assistente/input-mensagem';
import { useChat } from '../hooks/usar-chat';
import { useState } from 'react';
import { Sidebar } from "../components/sidebar";
import { Overlay } from "../components/overlay";
import { Header } from "../components/header";
import { useNavigate } from "react-router-dom";

export function AssistenteVirtual() {
    const mensagensIniciais = [
        { id: 1, texto: "Bom dia sou o assistente do HC, em que posso te ajudar?", bot: true },
        { id: 2, texto: "Eu preciso de ajuda para remarcar minha consulta", bot: false }
    ];

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
        console.log("Usuário deslogado!");
    };

    const { mensagens, novaMensagem, setNovaMensagem, enviarMensagem } = useChat(mensagensIniciais);

    return (
        <>
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Overlay visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <ChatContainer>
                <ChatHeader
                    nomePaciente="Olá, Nelson!"
                    nomeAssistente="Assistente do HC"
                    status="Online"
                />

                <MessageList mensagens={mensagens} />

                <MessageInput
                    value={novaMensagem}
                    onChange={setNovaMensagem}
                    onSend={enviarMensagem}
                    placeholder="Digite uma mensagem"
                />
            </ChatContainer>
        </>
    );
}