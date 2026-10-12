CREATE TABLE IF NOT EXISTS Clientes (
    CliCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    CliNome VARCHAR(50),
    CliEmail VARCHAR(100),
    CliTelefone VARCHAR(15),
    CliSenha VARCHAR(255),
    CliCriado DATETIME
);

CREATE TABLE IF NOT EXISTS Barbeiro (
    BarCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    BarNome VARCHAR(50),
    BarTelefone VARCHAR(15),
    BarEmail VARCHAR(100),
    BarEspecialidade VARCHAR(100),
    BarSenha VARCHAR(255),
    BarAtivo BOOLEAN
);

CREATE TABLE IF NOT EXISTS Servico (
    SrvCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    SrvNome VARCHAR(100),
    SrvPreco DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS Configuracao_Agenda (
    CfgCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    BarCodigo INTEGER,
    CfgDias VARCHAR(50),
    CfgHorarioInicio TIME,
    CfgHorarioFim TIME,
    CfgIntervalo INTEGER,
    FOREIGN KEY (BarCodigo) REFERENCES Barbeiro(BarCodigo)
);

CREATE TABLE IF NOT EXISTS Agendamento (
    AgdCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    CliCodigo INTEGER,
    AgdIdentificacao VARCHAR(100),
    BarCodigo INTEGER,
    SrvCodigo INTEGER,
    AgdData DATE,
    AgdHorario TIME,
    AgdPreco DECIMAL(10,2),
    AgdStatus VARCHAR(20),
    FOREIGN KEY (CliCodigo) REFERENCES Clientes(CliCodigo),
    FOREIGN KEY (BarCodigo) REFERENCES Barbeiro(BarCodigo),
    FOREIGN KEY (SrvCodigo) REFERENCES Servico(SrvCodigo)
);

CREATE TABLE IF NOT EXISTS Avaliacao (
    AvaCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    AgdCodigo INTEGER UNIQUE,
    AvaNota INTEGER,
    AvaComentario VARCHAR(500),
    AvaData DATETIME,
    FOREIGN KEY (AgdCodigo) REFERENCES Agendamento(AgdCodigo)
);

CREATE TABLE IF NOT EXISTS Financeiro (
    FinCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    AgdCodigo INTEGER,
    FinValorPago DECIMAL(10,2),
    FinStatus VARCHAR(20),
    FinDataPagto DATE,
    FOREIGN KEY (AgdCodigo) REFERENCES Agendamento(AgdCodigo)
);

CREATE TABLE IF NOT EXISTS Material (
    MatCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    MatNome VARCHAR(100),
    MatReferencia VARCHAR(30),
    MatCategoria VARCHAR(50),
    MatUnidade VARCHAR(10),
    MatQuantidade DECIMAL(10,2),
    MatQuantidadeMinima DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS Movimentacao_Estoque (
    MovCodigo INTEGER PRIMARY KEY AUTO_INCREMENT,
    MatCodigo INTEGER,
    MovTipo VARCHAR(20),
    MovQuantidade DECIMAL(10,2),
    MovObservacao VARCHAR(255),
    MovFornecedor VARCHAR(100),
    MovCusto DECIMAL(10,2),
    MovData DATETIME,
    FOREIGN KEY (MatCodigo) REFERENCES Material(MatCodigo)
);
