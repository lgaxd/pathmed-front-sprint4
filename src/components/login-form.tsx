// src/components/login-form.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useValidarCredenciais } from "../hooks/validar-credenciais";
import { useApiService } from "../hooks/usar-api-service";

export function LoginForm() {
    const [rghc, setRghc] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const apiService = useApiService();

    const handleLogin = async () => {
        if (!rghc || !password) {
            setErro('RGHC e senha são obrigatórios');
            return;
        }

        setLoading(true);
        setErro(null);

        try {
            const credentials = {
                usuario: rghc,
                senha: password,
                tipoUsuario: 'PACIENTE'
            };

            const response = await apiService.login(credentials);
            
            if (response.sucesso) {
                // Salvar token/user info no localStorage
                localStorage.setItem('userToken', JSON.stringify(response));
                localStorage.setItem('userId', response.idUsuario?.toString() || '');
                navigate("/");
            } else {
                setErro(response.mensagem || 'Erro ao fazer login');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErro('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (erro && (rghc || password)) {
            setErro(null);
        }
    }, [rghc, password]);

    return (
        <div className="font-primary flex flex-col items-center w-full px-6 mt-10">
            <h1 className="text-white text-lg font-semibold mb-6">
                Insira seus dados
            </h1>

            {/* Campos do formulário */}
            <div className="relative w-full max-w-sm mb-4">
                <input
                    id="rghc"
                    placeholder="Digite seu RGHC"
                    value={rghc}
                    onChange={(e) => setRghc(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg px-4 py-3 pr-12 bg-white text-gray-700 placeholder-gray-400 shadow focus:outline-none disabled:opacity-50"
                />
            </div>

            <div className="relative w-full max-w-sm mb-2">
                <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg px-4 py-3 pr-12 bg-white text-gray-700 placeholder-gray-400 shadow focus:outline-none disabled:opacity-50"
                />
                <button
                    type="button"
                    className="absolute right-3 top-3 cursor-pointer disabled:opacity-50"
                    onClick={() => setPasswordVisible((v) => !v)}
                    disabled={loading}
                >
                    {/* Ícone de visibilidade */}
                </button>
            </div>

            <button className="text-sm text-white underline mb-6 cursor-pointer disabled:opacity-50">
                Consultar RGHC
            </button>

            <button
                className="w-full max-w-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLogin}
                disabled={loading}
            >
                {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {erro && (
                <div className="mt-4 bg-white p-3 rounded-lg shadow w-full max-w-sm">
                    <p className="text-red-500 text-sm">{erro}</p>
                </div>
            )}
        </div>
    );
}