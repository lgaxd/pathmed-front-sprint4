export function useValidarCredenciais(usuario: string, password: string, setErro: (parameter : any) => void, navigationHandler: () => void) {

    const validar = () => {
        // Validação de formatação de usuário (exemplo simples)
        if (usuario.length >= 3 && password.length >= 6) {
            setErro(null);
            navigationHandler();
        } else {
            setErro('O usuário deve ter no mínimo 3 caracteres e a senha deve ter no mínimo 6 caracteres.');
        }
    };

    return {
        validar
    };
}