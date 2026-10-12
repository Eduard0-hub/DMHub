## Scripts do banco de dados

Esta pasta contem os arquivos SQL do projeto Barber Hub para o MySQL.

- `schema.sql` cria todas as tabelas do sistema no banco selecionado
- `seed.sql` insere dados de exemplo para testar as telas e indicadores

### Como executar

No MySQL Workbench, crie e selecione o banco desejado antes de abrir cada arquivo na ordem abaixo e clicar em executar:

1. `schema.sql`
2. `seed.sql`

### Docker Compose

O MariaDB executa `schema.sql` no banco definido por `MARIADB_DATABASE`, somente na primeira inicializacao do volume.

Para aplicar esta mudanca a um banco ja inicializado ou alterar `MARIADB_DATABASE`, recrie o volume a partir da raiz do projeto:

```sh
docker compose down -v
docker compose up --build -d
```

**Atencao:** `docker compose down -v` apaga os dados locais do banco. Faca um backup antes, caso precise preserva-los.

### Tabelas

- Clientes
- Barbeiro
- Servico
- Configuracao_Agenda
- Agendamento
- Avaliacao
- Financeiro
