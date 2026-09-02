import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./VisualizacaoBarbeiro.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuLateral from "./MenuLateral";
import { CalendarDays, RefreshCcw, Info, Check, X } from "lucide-react";
import { agendamentoApi, servicoApi, clienteApi, barbeiroApi } from "../services/api.js";

const normalizarData = (data) => {
  if (!data) return "";
  if (Array.isArray(data)) {
    const [ano, mes, dia] = data;
    return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  }
  return String(data).slice(0, 10);
};

const paraDataLocal = (dataIso) => new Date(`${dataIso}T12:00:00`);

const VisualizacaoBarbeiro = () => {
  const hoje = new Date().toISOString().slice(0, 10);

  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [mesExibido, setMesExibido] = useState(paraDataLocal(hoje));
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregarDados = () => {
    setCarregando(true);
    // Agenda compartilhada: qualquer barbeiro logado ve os agendamentos de todos.
    Promise.all([
      agendamentoApi.listar(),
      servicoApi.listar(),
      clienteApi.listar(),
      barbeiroApi.listar(),
    ])
      .then(([agds, srvs, clis, bars]) => {
        setTodosAgendamentos(agds);
        setServicos(srvs);
        setClientes(clis);
        setBarbeiros(bars);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alterarStatus = async (agdCodigo, status) => {
    try {
      await agendamentoApi.alterarStatus(agdCodigo, status);
      carregarDados();
    } catch {
      /* mantem estado em caso de falha */
    }
  };

  const agendamentos = useMemo(() => {
    const mapaServico = {};
    servicos.forEach((s) => (mapaServico[s.srvCodigo] = s.srvNome));
    const mapaCliente = {};
    clientes.forEach((c) => (mapaCliente[c.cliCodigo] = c.cliNome));
    const mapaBarbeiro = {};
    barbeiros.forEach((b) => (mapaBarbeiro[b.barCodigo] = b.barNome));

    return todosAgendamentos
      .filter((a) => normalizarData(a.agdData) === dataSelecionada)
      .sort((a, b) => (String(a.agdHorario) > String(b.agdHorario) ? 1 : -1))
      .map((a) => ({
        codigo: a.agdCodigo,
        horario: String(a.agdHorario).slice(0, 5),
        cliente: a.agdIdentificacao || mapaCliente[a.cliCodigo] || "Cliente",
        servico: mapaServico[a.srvCodigo] || "Serviço",
        barbeiro: mapaBarbeiro[a.barCodigo] || "—",
        status: a.agdStatus,
      }));
  }, [todosAgendamentos, dataSelecionada, servicos, clientes, barbeiros]);

  const dataFormatada = useMemo(() => {
    return new Date(dataSelecionada + "T12:00:00").toLocaleDateString("pt-BR");
  }, [dataSelecionada]);

  const diasOcupados = useMemo(
    () => todosAgendamentos
      .map((agendamento) => normalizarData(agendamento.agdData))
      .filter(Boolean)
      .map(paraDataLocal),
    [todosAgendamentos]
  );

  return (
    <>
      <Header />
      <div className="visualizacao-page">
        <MenuLateral />
        <main className="visualizacao-main">
          <div className="top-menu">
            <button className="menu-link active-link">
              <CalendarDays size={14} />
              Visualizar Agenda do Dia
            </button>
          </div>

          <section className="agenda-header">
            <h1>Agenda do Dia</h1>
            <p>Consulte os agendamentos programados para uma data específica.</p>
          </section>

          <section className="date-card">
            <label>Selecionar Data</label>

            <div className="date-actions">
              <div className="calendar-content custom-calendar-wrapper barber-calendar-wrapper">
                <DayPicker
                  mode="single"
                  selected={paraDataLocal(dataSelecionada)}
                  onSelect={(dia) => dia && setDataSelecionada(dia.toISOString().slice(0, 10))}
                  month={mesExibido}
                  onMonthChange={setMesExibido}
                  showOutsideDays
                  modifiers={{ ocupado: diasOcupados }}
                  modifiersClassNames={{ ocupado: "barber-calendar-occupied" }}
                  className="custom-calendar"
                />
              </div>

              <button
                className="update-button"
                onClick={carregarDados}
                disabled={carregando}
              >
                <RefreshCcw size={15} className={carregando ? "girando" : ""} />
                {carregando ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </section>

          <section className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Barbeiro</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {agendamentos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                      {carregando ? "Carregando..." : "Nenhum agendamento para esta data."}
                    </td>
                  </tr>
                ) : (
                  agendamentos.map((agendamento, idx) => (
                    <tr key={`${agendamento.horario}-${idx}`}>
                      <td>{agendamento.horario}</td>

                      <td>
                        <div className="cliente-cell">
                          <div className="cliente-avatar">
                            {agendamento.cliente.charAt(0)}
                          </div>
                          <span>{agendamento.cliente}</span>
                        </div>
                      </td>

                      <td>{agendamento.servico}</td>

                      <td>{agendamento.barbeiro}</td>

                      <td>
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background:
                              agendamento.status === "Concluido"
                                ? "#d1fae5"
                                : agendamento.status === "Cancelado"
                                ? "#fee2e2"
                                : "#e0f2fe",
                            color:
                              agendamento.status === "Concluido"
                                ? "#065f46"
                                : agendamento.status === "Cancelado"
                                ? "#991b1b"
                                : "#0369a1",
                          }}
                        >
                          {agendamento.status}
                        </span>
                      </td>

                      <td>
                        {agendamento.status !== "Concluido" &&
                        agendamento.status !== "Cancelado" ? (
                          <div className="acoes-agenda">
                            <button
                              className="acao-concluir"
                              onClick={() => alterarStatus(agendamento.codigo, "Concluido")}
                              title="Marcar como concluído"
                            >
                              <Check size={14} />
                              Concluir
                            </button>
                            <button
                              className="acao-cancelar"
                              onClick={() => alterarStatus(agendamento.codigo, "Cancelado")}
                              title="Cancelar agendamento"
                            >
                              <X size={14} />
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af", fontSize: "12px" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="bottom-info">
            <div className="left-info">
              <Info size={15} />
              <span>
                Total de agendamentos:
                <strong> {agendamentos.length}</strong>
              </span>
            </div>

            <span className="selected-date">
              Data selecionada: {dataFormatada}
            </span>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default VisualizacaoBarbeiro;
