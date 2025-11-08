import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  path: string;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { label: "Painel principal", path: "/" },
    { label: "Agendar Consulta", path: "/agendar-consulta" },
    { label: "Lembretes", path: "/lembretes" },
    { label: "Consultas", path: "/consultas" },
    { label: "Perfil", path: "/perfil" },
    { label: "Assistente virtual", path: "/assistente-virtual" },
    { label: "Configurações", path: "/configuracoes" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Fecha o sidebar após navegar
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-blue-500 text-white transform ${open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-lg z-40`}
    >
      {/* Botão de fechar */}
      <div className="flex justify-end p-4">
        <button
          className="text-3xl font-light cursor-pointer hover:bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
          onClick={onClose}
          aria-label="Fechar menu"
        >
          ✕
        </button>
      </div>

      {/* Lista de itens */}
      <nav className="mt-6 px-6 space-y-4 font-primary">
        <ul className="space-y-4">
          {menuItems.map((item, index) => (
            <li
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className="flex items-center gap-2 text-lg font-medium cursor-pointer p-2 rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-200 group"
            >
              <span className="text-sm font-semibold group-hover:text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="group-hover:font-semibold">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}