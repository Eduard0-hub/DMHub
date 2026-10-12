# BarberHub

`CURSO`
Tecnologia em Análise e Desenvolvimento de Sistemas

`DISCIPLINA`
Trabalho Interdisciplinar: Aplicações para Processos de Negócios

`SEMESTRE`
`1/2026`

O BarberHub é uma solução digital de gestão desenhada para unificar a jornada da barbearia. Através de uma interface web intuitiva, o projeto otimiza o fluxo entre o agendamento do cliente, a rotina operacional do barbeiro e o controle financeiro do gestor. Utilizando modelagem de processos (BPMN), a ferramenta substitui o uso de múltiplas plataformas por um sistema centralizado que organiza desde o estoque até o faturamento, elevando a eficiência do negócio e a fidelização do cliente.

Este repositório dá continuidade ao [projeto original BarberHub](https://github.com/Eduard0-code/barberhub). O projeto-base foi desenvolvido pela equipe listada em Integrantes; as evoluções descritas abaixo foram implementadas por Eduardo Costa Silva neste fork.

## Evoluções deste fork

* Autenticação de clientes e barbeiros com senhas protegidas por hash BCrypt e login por e-mail ou telefone.
* Verificação de disponibilidade e prevenção de conflitos de horário nos agendamentos, com atualização dos lançamentos financeiros conforme o status do atendimento.
* Ambiente Docker Compose para frontend, backend e MariaDB, com verificações de saúde e integração contínua para testes Java e testes de fumaça.
* Scripts de inicialização para Windows e Linux/macOS, além de documentação para execução manual.

## Funcionalidades

* Agendamento de serviços e consulta de disponibilidade.
* Acesso para clientes e barbeiros, com gestão da agenda e dos serviços.
* Registro de avaliações dos atendimentos.
* Controle financeiro e acompanhamento de indicadores.
* Gestão de materiais, estoque e movimentações.

## Integrantes

* Álan Christian de Araújo Lima
* Arthur Henrique Madureira Penido
* Eduardo Costa Silva
* João Pedro Fernandes Carvalho

## Orientador

* Cleia Marcia Gomes Amaral

## Stack utilizada

### Frontend

* React 19
* Vite 8
* React Router DOM 7
* ApexCharts e React ApexCharts
* React Day Picker
* Swiper
* Lucide React
* date-fns
* ESLint

### Backend

* Java 17
* Spring Boot 3.2.5
* Spring Web
* Spring Data JPA e Hibernate
* Spring Security Crypto
* MySQL Connector/J
* Maven
* JUnit e Spring Boot Test

### Deploy

* Vercel para o frontend
* Railway para o backend

Os endereços públicos do frontend e da API não estão registrados neste repositório.

## Instruções de utilização

### Docker

A forma mais simples de executar o projeto localmente é com Docker. A composição inicia o frontend, a API e um banco MariaDB, criando automaticamente o banco a partir de `src/db/schema.sql`. O Dockerfile do backend separa a compilação do runtime, aproveita o cache das dependências Maven e executa a API com um usuário sem privilégios. A API e o frontend têm verificações de saúde e só ficam disponíveis quando os serviços necessários estão prontos.

Crie o arquivo local de configuração a partir do exemplo:

```bash
cp .env.example .env
```

Os valores do exemplo são apenas para desenvolvimento local. Não use essas credenciais em produção; configure os valores por meio do gerenciador de secrets do ambiente de deploy.

Valide a configuração e inicie os serviços:

```bash
docker compose config --quiet
docker compose up --build
```

Depois da inicialização, acesse `http://localhost:5173`. A API fica disponível em `http://localhost:8081` e o MariaDB não precisa ser instalado na máquina host. As portas podem ser alteradas com `FRONTEND_PORT` e `BACKEND_PORT` no `.env`.

Para conferir o estado e os logs dos serviços:

```bash
docker compose ps
docker compose logs --follow
```

O endpoint `http://localhost:8081/actuator/health/readiness` informa se a API e sua conexão com o banco estão prontas. O workflow `.github/workflows/docker-compose.yml` executa os testes Java, constrói o ambiente e realiza testes de fumaça no frontend e na API a cada push e pull request.

Para construir somente a imagem do backend, execute o comando a partir da raiz do repositório, pois o Dockerfile copia arquivos de `backend/` usando esse contexto:

```bash
docker build -f backend/Dockerfile -t barberhub-backend:local .
```

Para encerrar os containers, pressione `Ctrl+C`. Para remover também os dados locais do banco e recomeçar do zero, execute:

```bash
docker compose down -v
```

### Scripts de inicialização (sem Docker)

Os scripts iniciam o backend e o frontend em janelas ou processos separados, mas não iniciam nem criam o banco de dados. Antes de usá-los, prepare o MySQL/MariaDB, aplique `src/db/schema.sql` e configure as variáveis de conexão descritas em Execução manual.

No Windows, execute:

```powershell
.\iniciar-projeto.bat
```

No Linux ou macOS, execute:

```bash
./iniciar-projeto.sh
```

### Execução manual: pré-requisitos

* Node.js 20.19.0 ou superior e npm para o frontend.
* Java 17 e Maven para o backend.
* Uma instância MySQL ou MariaDB. O projeto usa MariaDB no Docker e o driver MySQL Connector/J na aplicação; o schema é compatível com ambos.

Crie o banco e aplique o schema a partir da raiz do repositório. O exemplo abaixo funciona com o cliente `mysql` do MySQL ou do MariaDB:

```sql
CREATE DATABASE db_barbearia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
mysql -u root -p db_barbearia < src/db/schema.sql
```

Configure as variáveis de conexão do backend antes de iniciá-lo. Ajuste usuário e senha conforme sua instalação. No PowerShell:

```powershell
$env:MYSQLHOST = "localhost"
$env:MYSQLPORT = "3306"
$env:MYSQLDATABASE = "db_barbearia"
$env:MYSQLUSER = "root"
$env:MYSQLPASSWORD = "sua-senha"
```

No Bash, defina as mesmas variáveis com `export`:

```bash
export MYSQLHOST=localhost
export MYSQLPORT=3306
export MYSQLDATABASE=db_barbearia
export MYSQLUSER=root
export MYSQLPASSWORD=sua-senha
```

Essas variáveis são lidas por `application.properties`.

### Backend

```bash
cd backend
mvn spring-boot:run
```

As dependências Maven são resolvidas automaticamente na primeira execução. A API inicia na porta `8081` por padrão; se definir a variável `PORT`, ela usará a porta informada. Mantenha o backend em execução enquanto inicia o frontend.

### Frontend

Na execução manual, configure `VITE_API_URL` para apontar à API local. Com a porta padrão, crie `src/.env.local` com:

```dotenv
VITE_API_URL=http://localhost:8081/api
```

Se tiver definido `PORT` para outro valor, substitua `8081` pela porta escolhida. Depois, em outro terminal:

```bash
cd src
npm ci
npm run dev
```

Por padrão, o frontend usa `/api`, caminho que o Docker encaminha para o backend. Para gerar a versão de produção, execute `npm run build`.

## Documentação

1. [Documentação de Contexto](docs/1-Contexto.md)
2. [Especificação do Projeto](docs/2-Especifica%C3%A7%C3%A3o.md)
3. [Modelagem dos Processos de Negócio](docs/3-Modelagem-Processos-Neg%C3%B3cio.md)
4. [Projeto da solução](docs/4-Projeto-Solucao.md)
5. [Planejamento do Projeto](docs/5-Planejamento-Projeto.md)
6. [Interface do Sistema](docs/6-Interface-Sistema.md)
7. [Indicadores](docs/7-Indicadores.md)
8. [Conclusão](docs/8-Conclus%C3%A3o.md)
9. [Referências](docs/9-Refer%C3%AAncias.md)

## Código

[Código-fonte](src/README.md)

## Apresentação

[Apresentação da solução](docs/apresentacao/README.md)


## Histórico de versões

* 0.2.0
    * Evoluções deste fork: autenticação BCrypt, validação de disponibilidade e conflitos de agenda, integração entre agendamentos e financeiro, Docker Compose, CI e scripts de inicialização.
* 0.1.1
    * Atualização e organização da documentação do projeto.
* 0.1.0
    * Versão-base herdada do projeto original: agendamento, avaliações, gestão financeira, indicadores e controle de estoque.
* 0.0.1
    * Modelagem inicial dos processos de negócio da barbearia.
