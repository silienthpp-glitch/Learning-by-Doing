#!/bin/zsh
cd -- "${0:A:h}"
export OLLAMA_MODELS="$PWD/.runtime/models"
export OLLAMA_HOST=127.0.0.1:11434
export OLLAMA_NO_CLOUD=1
if curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  echo 'Ollama läuft bereits. Dieses Fenster kann geschlossen werden.'
  exit 0
fi
if [[ ! -x .runtime/ollama/ollama ]]; then
  echo 'Bitte zuerst Ollama-einrichten.command ausführen.'
  read -r '?Enter zum Schließen …'
  exit 1
fi
.runtime/ollama/ollama serve
