import BarberCadLog from './components/Cadastro-Login-Barber.jsx'
import AgendamentoCliente from './components/AgendamentoCliente.jsx'
import VisualizacaoBarbeiro from "./components/VisualizacaoBarbeiro.jsx";
import GestaoFinanceira from "./components/GestaoFinanceira.jsx";
import AvaliacaoCliente from "./components/AvaliacaoCliente.jsx";
import AvaliacaoBarbeiro from "./components/AvaliacaoBarbeiro.jsx";
import Indicadores from "./components/Indicadores.jsx";
import Ajustes from "./components/Ajustes.jsx";
import Estoque from "./components/Estoque.jsx";
import PrivateRoute from './components/PrivateRoute.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<BarberCadLog />} />

      {/* Tela inicial do cliente: agendamento simples, sem exigir login */}
      <Route path="/" element={<AgendamentoCliente />} />
      <Route path="/agendamento-cliente" element={<AgendamentoCliente />} />
      <Route path="/visualizacao-barbeiro" element={<PrivateRoute><VisualizacaoBarbeiro /></PrivateRoute>} />
      <Route path="/gestao-financeira" element={<PrivateRoute><GestaoFinanceira /></PrivateRoute>} />
      <Route path="/avaliacao-cliente" element={<PrivateRoute><AvaliacaoCliente /></PrivateRoute>} />
      <Route path="/avaliacao-barbeiro" element={<PrivateRoute><AvaliacaoBarbeiro /></PrivateRoute>} />
      <Route path="/indicadores" element={<PrivateRoute><Indicadores /></PrivateRoute>} />
      <Route path="/estoque" element={<PrivateRoute><Estoque /></PrivateRoute>} />
      <Route path="/ajustes" element={<PrivateRoute><Ajustes /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
