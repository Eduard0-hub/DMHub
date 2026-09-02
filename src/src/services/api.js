const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function buscar(caminho) {
  const resposta = await fetch(BASE_URL + caminho);
  if (!resposta.ok) {
    throw new Error("Falha ao buscar " + caminho);
  }
  return resposta.json();
}

async function enviar(caminho, dados, metodo = "POST") {
  const resposta = await fetch(BASE_URL + caminho, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.erro || "Falha ao enviar " + caminho);
  }
  if (resposta.status === 204) return null;
  return resposta.json();
}

async function remover(caminho) {
  const resposta = await fetch(BASE_URL + caminho, { method: "DELETE" });
  if (!resposta.ok && resposta.status !== 404) {
    throw new Error("Falha ao remover " + caminho);
  }
  return true;
}

// Converte um periodo ("semana" | "mes" | "ano") numa query string ?inicio=&fim=
export function periodoParaQuery(periodo) {
  const dias = { semana: 7, mes: 30, ano: 365 }[periodo];
  if (!dias) return "";
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - (dias - 1));
  const iso = (d) => d.toISOString().slice(0, 10);
  return `?inicio=${iso(inicio)}&fim=${iso(fim)}`;
}

export const kpiApi = {
  resumo: (periodo) => buscar("/kpi/resumo" + periodoParaQuery(periodo)),
  faturamentoPorDia: (periodo) =>
    buscar("/kpi/faturamento-por-dia" + periodoParaQuery(periodo)),
  atendimentosPorBarbeiro: (periodo) =>
    buscar("/kpi/atendimentos-por-barbeiro" + periodoParaQuery(periodo)),
  servicosMaisVendidos: (periodo) =>
    buscar("/kpi/servicos-mais-vendidos" + periodoParaQuery(periodo)),
  ocupacaoBarbeiros: (periodo) =>
    buscar("/kpi/ocupacao-barbeiros" + periodoParaQuery(periodo)),
};

export const clienteApi = {
  listar: () => buscar("/clientes"),
  buscarPorEmail: (email) =>
    buscar("/clientes/por-email?email=" + encodeURIComponent(email)),
  criar: (dados) => enviar("/clientes", dados),
  atualizar: (id, dados) => enviar("/clientes/" + id, dados, "PUT"),
};

export const barbeiroApi = {
  listar: () => buscar("/barbeiros"),
  criar: (dados) => enviar("/barbeiros", dados),
  atualizar: (id, dados) => enviar("/barbeiros/" + id, dados, "PUT"),
};

export const servicoApi = {
  listar: () => buscar("/servicos"),
  criar: (dados) => enviar("/servicos", dados),
  atualizar: (id, dados) => enviar("/servicos/" + id, dados, "PUT"),
  remover: (id) => remover("/servicos/" + id),
};

export const agendamentoApi = {
  listar: () => buscar("/agendamentos"),
  recentes: () => buscar("/agendamentos/recentes"),
  porCliente: (cliCodigo) => buscar("/agendamentos/por-cliente/" + cliCodigo),
  porBarbeiro: (barCodigo) => buscar("/agendamentos/por-barbeiro/" + barCodigo),
  disponibilidade: (barCodigo, data) =>
    buscar("/agendamentos/disponibilidade?barCodigo=" + barCodigo + "&data=" + data),
  criar: (dados) => enviar("/agendamentos", dados),
  atualizar: (id, dados) => enviar("/agendamentos/" + id, dados, "PUT"),
  remover: (id) => remover("/agendamentos/" + id),
  alterarStatus: (id, status) =>
    enviar("/agendamentos/" + id + "/status", { status }, "PUT"),
};

export const avaliacaoApi = {
  listar: () => buscar("/avaliacoes"),
  porAgendamento: (agdCodigo) => buscar("/avaliacoes/por-agendamento/" + agdCodigo),
  criar: (dados) => enviar("/avaliacoes", dados),
  remover: (id) => remover("/avaliacoes/" + id),
};

export const financeiroApi = {
  listar: () => buscar("/financeiro"),
  recentes: () => buscar("/financeiro/recentes"),
  resumo: () => buscar("/financeiro/resumo"),
  marcarComoPago: (id) => enviar("/financeiro/" + id + "/pagar", {}, "PUT"),
};

export const materialApi = {
  listar: () => buscar("/materiais"),
  criar: (dados) => enviar("/materiais", dados),
  atualizar: (id, dados) => enviar("/materiais/" + id, dados, "PUT"),
  remover: (id) => remover("/materiais/" + id),
  registrarBaixa: (id, dados) => enviar("/materiais/" + id + "/baixa", dados),
  repor: (id, dados) => enviar("/materiais/" + id + "/reposicao", dados),
  movimentacoes: () => buscar("/materiais/movimentacoes"),
};

export const authApi = {
  login: (login, senha) => enviar("/auth/login", { login, senha }),
};

export const configuracaoAgendaApi = {
  listar: () => buscar("/configuracao-agenda"),
  porBarbeiro: (barCodigo) => buscar("/configuracao-agenda/barbeiro/" + barCodigo),
  salvar: (dados) => enviar("/configuracao-agenda", dados),
};


export function usuarioLogado() {
  const dados = localStorage.getItem("usuarioLogado");
  return dados ? JSON.parse(dados) : null;
}

// true se o usuario logado for barbeiro (possui barCodigo)
export function ehBarbeiro() {
  const u = usuarioLogado();
  return !!(u && u.barCodigo);
}

export function logout() {
  localStorage.removeItem("usuarioLogado");
}
