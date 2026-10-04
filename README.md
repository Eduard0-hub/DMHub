# BarberHub

`CURSO`
Tecnologia em Análise e Desenvolvimento de Sistemas

`DISCIPLINA`
Trabalho Interdisciplinar: Aplicações para Processos de Negócios

`SEMESTRE`
`1/2026`

O BarberHub é uma solução digital de gestão desenhada para unificar a jornada da barbearia. Através de uma interface web intuitiva, o projeto otimiza o fluxo entre o agendamento do cliente, a rotina operacional do barbeiro e o controle financeiro do gestor. Utilizando modelagem de processos (BPMN), a ferramenta substitui o uso de múltiplas plataformas por um sistema centralizado que organiza desde o estoque até o faturamento, elevando a eficiência do negócio e a fidelização do cliente.

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

## Instruções de utilização

### Pré-requisitos

* Node.js 20.19.0 ou superior e npm para o frontend.
* Java 17 e Maven para o backend.
* Uma instância MySQL configurada para executar a API.

### Frontend

```bash
cd src
npm ci
npm run dev
```

Para gerar a versão de produção, execute `npm run build`.

### Backend

```bash
cd backend
mvn spring-boot:run
```

As dependências Maven são resolvidas automaticamente na primeira execução.

# Documentação

<ol>
<li><a href="docs/1-Contexto.md"> Documentação de Contexto</a></li>
<li><a href="docs/2-Especificação.md"> Especificação do Projeto</a></li>
<li><a href="docs/3-Modelagem-Processos-Negócio.md"> Modelagem dos Processos de Negocio</a></li>
<li><a href="docs/4-Projeto-Solucao.md"> Projeto da solução</a></li>
<li><a href="docs/5-Planejamento-Projeto.md"> Planejamento do Projeto</a></li>
<li><a href="docs/6-Interface-Sistema.md"> Interface do Sistema</a></li>
<li><a href="docs/7-Indicadores.md"> Indicadores</a></li>
<li><a href="docs/8-Conclusão.md"> Conclusão</a></li>
<li><a href="docs/9-Referências.md"> Referências</a></li>
</ol>

# Código

<li><a href="src/README.md"> Código Fonte</a></li>

# Apresentação

<li><a href="docs/apresentacao/README.md"> Apresentação da solução</a></li>


## Histórico de versões

* 0.1.1
    * CHANGE: Atualização das documentações. Código permaneceu inalterado.
* 0.1.0
    * Implementação da funcionalidade X pertencente ao processo P.
* 0.0.1
    * Trabalhando na modelagem do processo de negócio.
