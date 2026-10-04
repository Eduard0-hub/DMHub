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

printf 'Instalando dependencias do frontend...\n'
(
  cd "$ROOT/src"
  npm ci
)

printf 'Iniciando o backend em http://localhost:8081...\n'
(
  cd "$ROOT/backend"
  exec "${MAVEN_COMMAND[@]}" spring-boot:run
) &
BACKEND_PID=$!

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
