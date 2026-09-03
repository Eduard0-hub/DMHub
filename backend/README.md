## Backend Barber Hub

API em Spring Boot que conecta o frontend React ao banco MySQL.

### Tecnologias

- Java 17
- Spring Boot 3.2
- Spring Data JPA
- MySQL Connector
- Maven

### Pré-requisitos

1. Java 17 instalado (JDK)
2. Maven instalado (versão 3.8 ou superior)
3. MySQL rodando na porta 3306
4. Banco `db_barbearia` criado e populado (use os scripts em `src/db/schema.sql` e `src/db/seed.sql`)

### Configuração do banco

Abra o arquivo `src/main/resources/application.properties` e troque a senha pela sua senha do MySQL:

```
spring.datasource.password=SUA_SENHA_AQUI
```

### Como rodar

Dentro da pasta `backend`:

```
mvn spring-boot:run
```

A API sobe na porta 8081. Para testar, abra no navegador:

- http://localhost:8081/api/kpi/resumo
- http://localhost:8081/api/kpi/faturamento-por-dia
- http://localhost:8081/api/kpi/atendimentos-por-barbeiro
- http://localhost:8081/api/kpi/servicos-mais-vendidos
- http://localhost:8081/api/kpi/ocupacao-barbeiros

### Estrutura

```
backend/
  pom.xml
  src/main/java/com/barberhub/
    BarberhubApplication.java
    config/
      CorsConfig.java
    entity/
      Cliente.java
      Barbeiro.java
      Servico.java
      ConfiguracaoAgenda.java
      Agendamento.java
      Avaliacao.java
      Financeiro.java
    repository/
      ClienteRepository.java
      BarbeiroRepository.java
      ServicoRepository.java
      ConfiguracaoAgendaRepository.java
      AgendamentoRepository.java
      AvaliacaoRepository.java
      FinanceiroRepository.java
    dto/
      ResumoKpiDTO.java
      PontoGraficoDTO.java
    controller/
      KpiController.java
  src/main/resources/
    application.properties
```

### Fluxo da requisição

```
React (porta 5173) -> Spring Boot (porta 8081) -> MySQL (porta 3306)
```

O React faz `fetch` nos endpoints `/api/kpi/*`, o Spring Boot consulta o banco usando JPA e devolve os dados em JSON. Se o backend estiver desligado, a tela de Indicadores mostra valores de exemplo com um aviso.
