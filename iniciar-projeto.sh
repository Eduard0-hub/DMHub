#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  [[ -n "$BACKEND_PID" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf '%s nao foi encontrado. Instale-o e tente novamente.\n' "$2" >&2
    exit 1
  fi
}

require_command node "Node.js"
require_command npm "npm"
require_command java "Java"

MYSQL_HOST="${MYSQLHOST:-localhost}"
MYSQL_PORT="${MYSQLPORT:-3306}"
MYSQL_DATABASE="${MYSQLDATABASE:-db_barbearia}"
MYSQL_USER="${MYSQLUSER:-}"
MYSQL_PASSWORD="${MYSQLPASSWORD:-}"

port_is_open() {
  (echo >/dev/tcp/"$1"/"$2") 2>/dev/null
}

if ! port_is_open "$MYSQL_HOST" "$MYSQL_PORT"; then
  printf 'MySQL/MariaDB nao esta acessivel em %s:%s.\n' "$MYSQL_HOST" "$MYSQL_PORT" >&2
  if [[ "$MYSQL_HOST" == "localhost" || "$MYSQL_HOST" == "127.0.0.1" ]]; then
    printf 'No Manjaro, instale com: sudo pacman -S mariadb\n' >&2
    printf 'Na primeira inicializacao: sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql\n' >&2
    printf 'Depois inicie com: sudo systemctl enable --now mariadb\n' >&2
  else
    printf 'Verifique se o banco remoto esta ativo e se MYSQLHOST/MYSQLPORT estao corretos.\n' >&2
  fi
  printf 'O banco db_barbearia tambem precisa ser criado usando %s/src/db/schema.sql.\n' "$ROOT" >&2
  exit 1
fi

if [[ -z "$MYSQL_USER" ]]; then
  read -r -p "Usuario do banco [barberhub]: " MYSQL_USER
  MYSQL_USER="${MYSQL_USER:-barberhub}"
fi

if [[ -z "$MYSQL_PASSWORD" ]]; then
  read -r -s -p "Senha do banco: " MYSQL_PASSWORD
  printf '\n'
fi

if command -v mariadb >/dev/null 2>&1 && ! MYSQL_PWD="$MYSQL_PASSWORD" mariadb --protocol=tcp --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" "$MYSQL_DATABASE" -e 'SELECT 1' >/dev/null 2>&1; then
  printf 'Nao foi possivel autenticar no banco %s com o usuario %s.\n' "$MYSQL_DATABASE" "$MYSQL_USER" >&2
  exit 1
fi

export MYSQLHOST="$MYSQL_HOST"
export MYSQLPORT="$MYSQL_PORT"
export MYSQLDATABASE="$MYSQL_DATABASE"
export MYSQLUSER="$MYSQL_USER"
export MYSQLPASSWORD="$MYSQL_PASSWORD"

if command -v mvn >/dev/null 2>&1; then
  MAVEN_COMMAND=(mvn)
elif [[ -x "$ROOT/backend/mvnw" ]]; then
  MAVEN_COMMAND=("$ROOT/backend/mvnw")
else
  printf 'Maven nao foi encontrado. Instale-o e tente novamente.\n' >&2
  exit 1
fi

if [[ ! -f "$ROOT/backend/pom.xml" ]]; then
  printf 'Backend nao encontrado em %s/backend.\n' "$ROOT" >&2
  exit 1
fi

if [[ ! -f "$ROOT/src/package.json" ]]; then
  printf 'Frontend nao encontrado em %s/src.\n' "$ROOT" >&2
  exit 1
fi

open_browser() {
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:5173" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "http://localhost:5173" >/dev/null 2>&1 &
  fi
}

printf 'Verificando dependencias do frontend...\n'
(
  cd "$ROOT/src"
  npm install
)

printf 'Iniciando o backend em http://localhost:8081...\n'
(
  cd "$ROOT/backend"
  exec "${MAVEN_COMMAND[@]}" spring-boot:run
) &
BACKEND_PID=$!

printf 'Aguardando a API em http://localhost:8081...\n'
for _ in {1..180}; do
  if port_is_open 127.0.0.1 8081; then
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    printf 'O backend encerrou durante a inicializacao; confira o erro acima.\n' >&2
    exit 1
  fi
  sleep 0.5
done

if ! port_is_open 127.0.0.1 8081; then
  printf 'O backend nao iniciou na porta 8081 em 90 segundos.\n' >&2
  exit 1
fi

printf 'Iniciando o frontend em http://localhost:5173...\n'
(
  cd "$ROOT/src"
  exec npm run dev
) &
FRONTEND_PID=$!

for _ in {1..180}; do
  if (echo >/dev/tcp/localhost/5173) 2>/dev/null; then
    open_browser
    printf 'Projeto iniciado. Pressione Ctrl+C para encerrar os servicos.\n'
    wait "$BACKEND_PID" "$FRONTEND_PID"
    exit 0
  fi
  sleep 0.5
done

printf 'O frontend nao iniciou na porta 5173 em 90 segundos.\n' >&2
exit 1
