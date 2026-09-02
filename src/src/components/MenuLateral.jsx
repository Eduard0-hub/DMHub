import './MenuLateral.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext.jsx';
import { ehBarbeiro } from '../services/api.js';

import {
  House,
  CalendarDays,
  Star,
  Settings,
  Users,
  DollarSign,
  BarChart3,
  Boxes,
  X,
} from 'lucide-react';

// 'tipos' define quem ve cada item: 'cliente', 'barbeiro' ou ambos.
const itens = [
  { rota: '/', icone: House, rotulo: 'Home', tipos: ['cliente', 'barbeiro'] },
  { rota: '/agendamento-cliente', icone: CalendarDays, rotulo: 'Agendar', tipos: ['cliente'] },
  { rota: '/visualizacao-barbeiro', icone: Users, rotulo: 'Agenda', tipos: ['barbeiro'] },
  { rota: '/avaliacao-cliente', icone: Star, rotulo: 'Avaliar', tipos: ['cliente'] },
  { rota: '/avaliacao-barbeiro', icone: Star, rotulo: 'Avaliações', tipos: ['barbeiro'] },
  { rota: '/estoque', icone: Boxes, rotulo: 'Estoque', tipos: ['barbeiro'] },
  { rota: '/gestao-financeira', icone: DollarSign, rotulo: 'Financeiro', tipos: ['barbeiro'] },
  { rota: '/indicadores', icone: BarChart3, rotulo: 'Indicadores', tipos: ['barbeiro'] },
];

const itensConfig = [
  { rota: '/ajustes', icone: Settings, rotulo: 'Ajustes', tipos: ['barbeiro'] },
];

const MenuLateral = () => {
  const navigate = useNavigate();
  const local = useLocation();
  const { colapsado, abertoMobile, fecharMobile } = useSidebar();

  const tipoAtual = ehBarbeiro() ? 'barbeiro' : 'cliente';
  const visiveis = itens.filter((item) => item.tipos.includes(tipoAtual));
  const visiveisConfig = itensConfig.filter((item) => item.tipos.includes(tipoAtual));

  const irPara = (rota) => {
    fecharMobile();
    navigate(rota);
  };

  const classes = [
    'menu-lateral',
    colapsado ? 'menu-colapsado' : '',
    abertoMobile ? 'menu-aberto-mobile' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {abertoMobile && <div className="menu-overlay" onClick={fecharMobile} />}

      <aside className={classes}>
        <button
          className="botao-fechar-mobile"
          onClick={fecharMobile}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>

        <div className="menu-section">
          <span className="menu-title">Menu</span>

          <nav className="menu-nav">
            {visiveis.map((item) => {
              const Icone = item.icone;
              const ativo = local.pathname === item.rota;
              return (
                <button
                  key={item.rota}
                  className={`menu-item ${ativo ? 'active-item' : ''}`}
                  onClick={() => irPara(item.rota)}
                  title={item.rotulo}
                >
                  <Icone size={18} />
                  <span className="menu-rotulo">{item.rotulo}</span>
                </button>
              );
            })}
          </nav>

          {visiveisConfig.length > 0 && (
            <>
              <span className="menu-title">Configurações</span>

              <nav className="menu-nav">
                {visiveisConfig.map((item) => {
                  const Icone = item.icone;
                  const ativo = local.pathname === item.rota;
                  return (
                    <button
                      key={item.rota}
                      className={`menu-item ${ativo ? 'active-item' : ''}`}
                      onClick={() => irPara(item.rota)}
                      title={item.rotulo}
                    >
                      <Icone size={18} />
                      <span className="menu-rotulo">{item.rotulo}</span>
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default MenuLateral;
