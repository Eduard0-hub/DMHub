import { useState } from "react";
import "./Cadastro-Login-Barber.css";
import { Scissors, User, Lock, MailIcon, Phone, BriefcaseBusiness } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clienteApi, barbeiroApi, authApi } from "../services/api.js";
import { formatarTelefone, apenasNumeros } from "../utils/formatadores.js";

const Header = () => (
  <div className="header">
    <div className="brand">
      <Scissors />
      <span className="brand-name">Barber<br />Hub</span>
    </div>
    <button className="avatar-btn" aria-label="Perfil">
      <User size={28} />
    </button>
  </div>
);

const LoginScreen = ({ onCadastro }) => {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const fazerLogin = async () => {
    setErro("");
    if (!login || !senha) {
      setErro("Preencha email ou telefone e senha");
      return;
    }
    setCarregando(true);
    try {
      const cliente = await authApi.login(login, senha);
      localStorage.setItem("usuarioLogado", JSON.stringify(cliente));
      navigate("/");
    } catch (e) {
      setErro(e.message || "Falha ao entrar");
    } finally {
      setCarregando(false);
    }
  };

  const entrarComoVisitante = () => {
    localStorage.removeItem("usuarioLogado");
    navigate("/");
  };

  return (
    <div className="card">
      <Header />
      <div className="card-body">
        <h1 className="page-title">Entrar em Barber Hub</h1>
        <p className="page-subtitle">Preencha os dados abaixo para fazer login.</p>

        <div className="form-group">
          <label className="form-label">E-mail ou telefone</label>
          <div className="input-wrap">
            <MailIcon size={14} className="input-icon" />
            <input
              className="form-input"
              type="text"
              placeholder="joao@exemplo.com ou (31) 99999-9999"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Senha</label>
          <div className="input-wrap">
            <Lock size={14} className="input-icon" />
            <input
              className="form-input"
              type="password"
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
        </div>

        {erro && <p className="form-erro">{erro}</p>}

        <button type="button" className="link-visitante" onClick={entrarComoVisitante}>
          Continuar como visitante
        </button>
      </div>

      <div className="divider" />

      <div className="card-footer">
        <button className="btn btn-outline" onClick={onCadastro}>Cadastro</button>
        <button className="btn btn-solid" onClick={fazerLogin} disabled={carregando}>
          {carregando ? "Entrando..." : "Login"}
        </button>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onCancelar, aoCriar }) => {
  const [tipo, setTipo] = useState("cliente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [modalLegal, setModalLegal] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const cadastrar = async () => {
    setErro("");

    if (!nome || (!email && !telefone)) {
      setErro("Preencha nome e ao menos um dos dois: email ou telefone");
      return;
    }

    if (!senha || senha.length < 6) {
      setErro("A senha precisa ter ao menos 6 caracteres");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas nao conferem");
      return;
    }
    if (!aceitouTermos || !aceitouPrivacidade) {
      setErro("Você precisa aceitar os Termos de Uso e o Aviso de Privacidade para concluir o cadastro.");
      return;
    }

    const numeroTelefone = telefone ? apenasNumeros(telefone) : "";
    if (telefone && numeroTelefone.length < 10) {
      setErro("Telefone incompleto");
      return;
    }

    setCarregando(true);
    try {
      if (tipo === "cliente") {
        await clienteApi.criar({
          cliNome: nome,
          cliEmail: email || null,
          cliTelefone: numeroTelefone || null,
          cliSenha: senha,
        });
      } else {
        await barbeiroApi.criar({
          barNome: nome,
          barEmail: email || null,
          barTelefone: numeroTelefone || null,
          barEspecialidade: especialidade || "Geral",
          barSenha: senha,
          barAtivo: true,
        });
      }
      aoCriar(tipo);
    } catch (e) {
      setErro(e.message || "Falha ao cadastrar");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="card">
      <Header />
      <div className="card-body">
        <h1 className="page-title">Novo cadastro</h1>
        <p className="page-subtitle">Escolha o tipo de cadastro e preencha os dados.</p>

        <div className="tipo-toggle">
          <button
            type="button"
            className={tipo === "cliente" ? "tipo-ativo" : ""}
            onClick={() => setTipo("cliente")}
          >
            Cliente
          </button>
          <button
            type="button"
            className={tipo === "barbeiro" ? "tipo-ativo" : ""}
            onClick={() => setTipo("barbeiro")}
          >
            Barbeiro
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Nome</label>
          <div className="input-wrap">
            <User className="input-icon" />
            <input
              className="form-input"
              type="text"
              placeholder="Ex: João da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">E-mail*</label>
          <div className="input-wrap">
            <MailIcon className="input-icon" />
            <input
              className="form-input"
              type="email"
              placeholder="joao@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Telefone*</label>
          <div className="input-wrap">
            <Phone className="input-icon" />
            <input
              className="form-input"
              type="tel"
              placeholder="(31) 99999-9999"
              value={telefone}
              maxLength={16}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            />
          </div>
        </div>

        {tipo === "barbeiro" && (
          <div className="form-group">
            <label className="form-label">Especialidade</label>
            <div className="input-wrap">
              <BriefcaseBusiness className="input-icon" />
              <input
                className="form-input"
                type="text"
                placeholder="Ex: Corte e Barba"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Senha</label>
          <div className="input-wrap">
            <Lock className="input-icon" />
            <input
              className="form-input"
              type="password"
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <p className="form-hint">Mínimo de 6 caracteres.</p>
        </div>

        <div className="form-group">
          <label className="form-label">Confirmar Senha</label>
          <div className="input-wrap">
            <Lock className="input-icon" />
            <input
              className="form-input"
              type="password"
              placeholder="********"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />
          </div>
        </div>

        <div className="legal-box">
          <h2 className="legal-title">Termos e privacidade</h2>
          <p className="legal-intro">Antes de concluir, leia os documentos abaixo:</p>

          <div className="legal-links">
            <button type="button" className="legal-link-button" onClick={() => setModalLegal("termos")}>
              Termos de Uso
            </button>
            <span>e</span>
            <button type="button" className="legal-link-button" onClick={() => setModalLegal("privacidade")}>
              Aviso de Privacidade
            </button>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
            />
            <span>Li e concordo com os Termos de Uso.</span>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={aceitouPrivacidade}
              onChange={(e) => setAceitouPrivacidade(e.target.checked)}
            />
            <span>Li e concordo com o Aviso de Privacidade.</span>
          </label>
        </div>

        {modalLegal && (
          <div className="legal-modal-backdrop" onClick={() => setModalLegal(null)}>
            <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
              <div className="legal-modal-header">
                <h3>{modalLegal === "termos" ? "Termos de Uso" : "Aviso de Privacidade"}</h3>
                <button type="button" className="legal-modal-close" onClick={() => setModalLegal(null)}>
                  Fechar
                </button>
              </div>
              <div className="legal-modal-body">
                {modalLegal === "termos" ? (
                  <>
                    <p>Ao criar uma conta no Barber Hub, o usuário declara que as informações fornecidas são verdadeiras e que se compromete a utilizar a plataforma de forma responsável, respeitando as regras de agendamento, comunicação e atendimento.</p>
                    <p>O usuário concorda que o uso do sistema é exclusivo para fins legítimos, e que deve manter seus dados de acesso em sigilo, não compartilhando credenciais com terceiros.</p>
                    <p>O Barber Hub pode utilizar os dados informados para autenticação, gestão de agendamentos, comunicação essencial, suporte ao cliente e melhoria da experiência do serviço.</p>
                  </>
                ) : (
                  <>
                    <p>O Barber Hub coleta e trata dados pessoais, como nome, e-mail, telefone, informações de agendamento e dados de acesso, para permitir o cadastro, a autenticação, a gestão do serviço, o atendimento e a comunicação necessária.</p>
                    <p>Esses dados poderão ser armazenados em ambiente seguro, acessados apenas por pessoas autorizadas e utilizados para as finalidades do sistema, incluindo suporte, segurança, operação e melhoria da experiência do usuário.</p>
                    <p>O tratamento dos dados é realizado com base no consentimento do titular e na execução do serviço solicitado, em conformidade com a Lei Geral de Proteção de Dados (LGPD). O usuário pode solicitar acesso, correção, atualização, limitação ou exclusão dos seus dados pelo e-mail suporte@barberhub.com.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {erro && <p className="form-erro">{erro}</p>}
      </div>

      <div className="divider" />

      <div className="card-footer">
        <button className="btn btn-outline" onClick={onCancelar} disabled={carregando}>Cancelar</button>
        <button className="btn btn-solid" onClick={cadastrar} disabled={carregando}>
          {carregando ? "Salvando..." : "Cadastrar"}
        </button>
      </div>
    </div>
  );
};

export default function BarberCadLog() {
  const [screen, setScreen] = useState("login");
  const [mensagem, setMensagem] = useState("");

  const onCriado = (tipo) => {
    setMensagem(
      tipo === "cliente"
        ? "Cliente cadastrado com sucesso. Faça login para continuar."
        : "Barbeiro cadastrado com sucesso."
    );
    setScreen("login");
  };

  return (
    <div className="app">
      {mensagem && (
        <div className="aviso-sucesso">{mensagem}</div>
      )}
      {screen === "login"
        ? <LoginScreen onCadastro={() => { setMensagem(""); setScreen("register"); }} />
        : <RegisterScreen onCancelar={() => { setMensagem(""); setScreen("login"); }} aoCriar={onCriado} />
      }
    </div>
  );
}
