import "./GestaoFinanceira.css";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import MenuLateral from "../components/MenuLateral.jsx";
import { useEffect, useMemo, useState } from "react";

import {
  Wallet,
  Users,
  Receipt,
  Plus,
  Check,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import GraficoFinanceiro from "../components/GraficoFinanceiro";
import { financeiroApi, kpiApi } from "../services/api.js";

const resumoPadrao = {
  totalRecebido: 0,
  recebidoHoje: 0,
  ticketMedio: 0,
  pagamentosPagos: 0,
  pagamentosPendentes: 0,
};

const ITENS_POR_PAGINA = 5;

const formatarMoeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarHora = (hora) => {
  if (!hora) return "--:--";
  return String(hora).slice(0, 5);
};

const GestaoFinanceira = () => {
  const [periodo, setPeriodo] = useState("semana");
  const [resumo, setResumo] = useState(resumoPadrao);
  const [atendimentos, setAtendimentos] = useState([]);
  const [grafico, setGrafico] = useState([]);
  const [atualizando, setAtualizando] = useState(false);
  const [origem, setOrigem] = useState("exemplo");

  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const carregar = () => {
    setAtualizando(true);
    return Promise.allSettled([
      financeiroApi.resumo(),
      financeiroApi.recentes(),
      kpiApi.faturamentoPorDia(periodo),
    ])
      .then(([r, a, g]) => {
        // Aplica cada resultado individualmente para nao perder atualizacoes
        // quando apenas uma das chamadas falha (ex.: grafico indisponivel).
        if (r.status === "fulfilled") setResumo(r.value);
        if (a.status === "fulfilled") setAtendimentos(a.value);
        if (g.status === "fulfilled") setGrafico(g.value);
        setOrigem(
          r.status === "fulfilled" && a.status === "fulfilled" ? "banco" : "exemplo"
        );
      })
      .catch(() => {
        setOrigem("exemplo");
      })
      .finally(() => setAtualizando(false));
  };

  useEffect(() => {
    carregar();

    const aoFocar = () => carregar();
    window.addEventListener("focus", aoFocar);
    const intervalo = setInterval(carregar, 15000);

    return () => {
      window.removeEventListener("focus", aoFocar);
      clearInterval(intervalo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  const atendimentosFiltrados = useMemo(() => {
    if (filtroStatus === "todos") return atendimentos;
    return atendimentos.filter((a) => a.finStatus === filtroStatus);
  }, [atendimentos, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(atendimentosFiltrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const atendimentosPagina = atendimentosFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  useEffect(() => {
    setPagina(1);
  }, [filtroStatus, atendimentos.length]);

  const marcarPago = async (finCodigo) => {
    try {
      await financeiroApi.marcarComoPago(finCodigo);
      carregar();
    } catch {
      /* mantem estado atual em caso de falha */
    }
  };

  const exportarCsv = () => {
    const cabecalho = ["Horario", "Cliente", "Servico", "Valor", "Status"];
    const linhas = atendimentosFiltrados.map((a) => [
      formatarHora(a.horario),
      a.cliente,
      a.servico,
      Number(a.finValorPago || 0).toFixed(2).replace(".", ","),
      a.finStatus || a.statusAgendamento || "",
    ]);
    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atendimentos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <div className="financeiro-container">
        <MenuLateral />

        <div className="financeiro-content">
          <div className="financeiro-topo">
            <h1>Gestão Financeira</h1>

            <div className="financeiro-acoes-topo">
              {origem === "exemplo" && (
                <span className="badge-offline">Backend offline</span>
              )}
              <button
                className="botao-atualizar"
                onClick={carregar}
                disabled={atualizando}
              >
                <RefreshCw size={15} className={atualizando ? "girando" : ""} />
                {atualizando ? "Atualizando" : "Atualizar"}
              </button>
            </div>
          </div>

          <div className="financeiro-cards">
            <div className="financeiro-card">
              <div className="card-icon">
                <Wallet size={18} />
              </div>
              <span>Total Recebido (Hoje)</span>
              <h2>{formatarMoeda(resumo.recebidoHoje)}</h2>
              <p>{formatarMoeda(resumo.totalRecebido)} no total</p>
            </div>

            <div className="financeiro-card">
              <div className="card-icon">
                <Users size={18} />
              </div>
              <span>Atendimentos</span>
              <h2>{(resumo.pagamentosPagos || 0) + (resumo.pagamentosPendentes || 0)}</h2>
              <p>{resumo.pagamentosPendentes || 0} pendentes</p>
            </div>

            <div className="financeiro-card">
              <div className="card-icon">
                <Receipt size={18} />
              </div>
              <span>Ticket Médio</span>
              <h2>{formatarMoeda(resumo.ticketMedio)}</h2>
              <p>Calculado com base nos pagamentos</p>
            </div>
          </div>

          <div className="financeiro-grid">
            <div className="pagamentos-card">
              <div className="pagamentos-header">
                <h3>Resumo Rápido</h3>
                <Plus size={18} />
              </div>

              <div className="pagamentos-body">
                <div className="resumo-linha">
                  <span>Pagamentos confirmados</span>
                  <strong>{resumo.pagamentosPagos || 0}</strong>
                </div>
                <div className="resumo-linha">
                  <span>Pagamentos pendentes</span>
                  <strong>{resumo.pagamentosPendentes || 0}</strong>
                </div>
                <div className="resumo-linha">
                  <span>Total geral</span>
                  <strong>{formatarMoeda(resumo.totalRecebido)}</strong>
                </div>
              </div>
            </div>

            <div className="table-card">
              <div className="table-header">
                <h3>Atendimentos Recentes</h3>

                <div className="table-actions">
                  <div className="filtro-status">
                    <Filter size={15} />
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      aria-label="Filtrar por status"
                    >
                      <option value="todos">Todos</option>
                      <option value="Pago">Pagos</option>
                      <option value="Pendente">Pendentes</option>
                      <option value="Cancelado">Cancelados</option>
                    </select>
                  </div>

                  <button onClick={exportarCsv} disabled={!atendimentosFiltrados.length}>
                    <Download size={15} />
                    Exportar
                  </button>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>HORÁRIO</th>
                    <th>CLIENTE</th>
                    <th>SERVIÇO</th>
                    <th>VALOR</th>
                    <th>STATUS</th>
                    <th>AÇÃO</th>
                  </tr>
                </thead>

                <tbody>
                  {atendimentosPagina.length === 0 && (
                    <tr>
                      <td colSpan={6} className="tabela-vazia">
                        Nenhum atendimento registrado ainda.
                      </td>
                    </tr>
                  )}
                  {atendimentosPagina.map((item) => (
                    <tr key={item.finCodigo}>
                      <td>{formatarHora(item.horario)}</td>
                      <td className="cliente-name">{item.cliente}</td>
                      <td>{item.servico}</td>
                      <td className="valor-cell">{formatarMoeda(item.finValorPago)}</td>
                      <td>
                        <span
                          className={`status ${
                            item.finStatus === "Pago"
                              ? "done"
                              : item.finStatus === "Cancelado"
                              ? "cancelado"
                              : "scheduled"
                          }`}
                        >
                          {item.finStatus || item.statusAgendamento}
                        </span>
                      </td>
                      <td>
                        {item.finStatus === "Pago" ? (
                          <span className="status done">Pago</span>
                        ) : item.finStatus === "Cancelado" ? (
                          <span className="status cancelado">Cancelado</span>
                        ) : (
                          <button
                            className="botao-marcar-pago"
                            onClick={() => marcarPago(item.finCodigo)}
                          >
                            <Check size={14} />
                            Marcar como Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-footer">
                <span>
                  Mostrando {atendimentosPagina.length} de {atendimentosFiltrados.length}{" "}
                  {atendimentosFiltrados.length === 1 ? "registro" : "registros"}
                </span>

                <div className="pagination">
                  <button
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={paginaAtual <= 1}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button className="active-page">
                    {paginaAtual} / {totalPaginas}
                  </button>

                  <button
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual >= totalPaginas}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>
                Evolução de Receita (
                {periodo === "semana" ? "Semanal" : "Mensal"})
              </h3>

              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="semana">Esta Semana</option>
                <option value="mes">Último Mês</option>
              </select>
            </div>

            <div className="chart-wrapper">
              <GraficoFinanceiro dados={grafico} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GestaoFinanceira;
