import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiService } from "../hooks/usar-api-service";

interface RegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistroSuccess: () => void;
}

function RegistroModal({ isOpen, onClose, onRegistroSuccess }: RegistroModalProps) {
  const [formData, setFormData] = useState({
    identificadorRghc: "",
    cpfPaciente: "",
    nomePaciente: "",
    dataNascimento: "",
    tipoSanguineo: "",
    email: "",
    telefone: "",
    usuario: "",
    senha: "",
    confirmarSenha: ""
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const apiService = useApiService();

  const tiposSanguineos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpar erro quando o usuário começar a digitar
    if (erro) setErro(null);
  };

  const formatarCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
  };

  const formatarTelefone = (telefone: string) => {
    telefone = telefone.replace(/\D/g, '');
    telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
    telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');
    return telefone;
  };

  const validarFormulario = () => {
    if (!formData.identificadorRghc) return "RGHC é obrigatório";
    if (!formData.cpfPaciente || formData.cpfPaciente.length < 14) return "CPF completo é obrigatório";
    if (!formData.nomePaciente) return "Nome completo é obrigatório";
    if (!formData.dataNascimento) return "Data de nascimento é obrigatória";
    if (!formData.tipoSanguineo) return "Tipo sanguíneo é obrigatório";
    if (!formData.email) return "Email é obrigatório";
    if (!formData.telefone || formData.telefone.length < 15) return "Telefone completo é obrigatório";
    if (!formData.usuario) return "Usuário é obrigatório";
    if (!formData.senha) return "Senha é obrigatória";
    if (formData.senha.length < 6) return "A senha deve ter no mínimo 6 caracteres";
    if (formData.senha !== formData.confirmarSenha) return "As senhas não coincidem";
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Email inválido";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      // Preparar dados para a API (remover máscaras)
      const dadosRegistro = {
        ...formData,
        cpfPaciente: formData.cpfPaciente.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        // Remover campo de confirmação de senha
        confirmarSenha: undefined
      };

      // Remover o campo confirmarSenha do objeto final
      delete (dadosRegistro as any).confirmarSenha;

      console.log('Enviando dados de registro:', dadosRegistro);

      const response = await apiService.registerPaciente(dadosRegistro);
      
      if (response.sucesso || response.idPaciente) {
        alert('Registro realizado com sucesso! Você já pode fazer login.');
        onRegistroSuccess();
        onClose();
      } else {
        setErro(response.mensagem || 'Erro ao realizar registro');
      }
    } catch (error: any) {
      console.error('Registro error:', error);
      setErro(error.message || 'Erro ao realizar registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Registrar Novo Paciente</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* RGHC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RGHC *
              </label>
              <input
                type="text"
                value={formData.identificadorRghc}
                onChange={(e) => handleChange('identificadorRghc', e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: RGHC09966"
                required
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cpfPaciente}
                onChange={(e) => handleChange('cpfPaciente', formatarCPF(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>

            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nomePaciente}
                onChange={(e) => handleChange('nomePaciente', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Michael Pibble"
                required
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => handleChange('dataNascimento', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Tipo Sanguíneo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo Sanguíneo *
              </label>
              <select
                value={formData.tipoSanguineo}
                onChange={(e) => handleChange('tipoSanguineo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione o tipo sanguíneo</option>
                {tiposSanguineos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="exemplo@email.com"
                required
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', formatarTelefone(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(11) 99999-9999"
                maxLength={15}
                required
              />
            </div>

            {/* Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário *
              </label>
              <input
                type="text"
                value={formData.usuario}
                onChange={(e) => handleChange('usuario', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escolha um nome de usuário"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha *
              </label>
              <input
                type="password"
                value={formData.confirmarSenha}
                onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm text-center">{erro}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function LoginForm() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showRegistro, setShowRegistro] = useState(false);
    const navigate = useNavigate();
    const apiService = useApiService();

    const handleLogin = async () => {
        if (!usuario || !password) {
            setErro('Usuário e senha são obrigatórios');
            return;
        }

        setLoading(true);
        setErro(null);

        try {
            const credentials = {
                usuario: usuario,
                senha: password,
                tipoUsuario: 'PACIENTE'
            };

            const response = await apiService.login(credentials);
            
            if (response.sucesso) {
                // Salvar token/user info no localStorage
                localStorage.setItem('userToken', JSON.stringify(response));
                localStorage.setItem('userId', response.idUsuario?.toString() || '');
                
                // Disparar evento de storage para atualizar o App.tsx
                window.dispatchEvent(new Event('storage'));
                
                // Forçar uma atualização do estado de autenticação
                setTimeout(() => {
                    // Redirecionar para home após login bem-sucedido
                    navigate("/", { replace: true });
                    // Recarregar a página para garantir que todos os estados sejam resetados
                    window.location.reload();
                }, 100);
                
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

    const handleRegistrar = () => {
        setShowRegistro(true);
    };

    const handleRegistroSuccess = () => {
        // Limpar formulário de login após registro bem-sucedido
        setUsuario('');
        setPassword('');
        setErro(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    useEffect(() => {
        if (erro && (usuario || password)) {
            setErro(null);
        }
    }, [usuario, password]);

    return (
        <>
            <div className="font-primary flex flex-col items-center w-full px-6 mt-10">
                <h1 className="text-white text-lg font-semibold mb-6">
                    Insira seus dados
                </h1>

                {/* Campos do formulário */}
                <div className="relative w-full max-w-sm mb-4">
                    <input
                        id="usuario"
                        placeholder="Digite seu usuário"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        className="w-full rounded-lg px-4 py-3 pr-12 bg-white text-gray-700 placeholder-gray-400 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                </div>

                <div className="relative w-full max-w-sm mb-2">
                    <input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        className="w-full rounded-lg px-4 py-3 pr-12 bg-white text-gray-700 placeholder-gray-400 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-3 cursor-pointer disabled:opacity-50"
                        onClick={() => setPasswordVisible((v) => !v)}
                        disabled={loading}
                    >
                        {passwordVisible ? (
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>

                <button 
                    className="text-sm text-white underline mb-6 cursor-pointer disabled:opacity-50 hover:text-blue-200 transition-colors"
                    onClick={handleRegistrar}
                    disabled={loading}
                >
                    Registrar usuário
                </button>

                <button
                    className="w-full max-w-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>

                {erro && (
                    <div className="mt-4 bg-white p-3 rounded-lg shadow w-full max-w-sm">
                        <p className="text-red-500 text-sm text-center">{erro}</p>
                    </div>
                )}
            </div>

            <RegistroModal 
                isOpen={showRegistro}
                onClose={() => setShowRegistro(false)}
                onRegistroSuccess={handleRegistroSuccess}
            />
        </>
    );
}