#!/bin/zsh
set -e
cd -- "${0:A:h}"
mkdir -p .runtime/ollama
if [[ ! -x .runtime/ollama/ollama ]]; then
  curl -fL --retry 2 https://github.com/ollama/ollama/releases/download/v0.40.1/ollama-darwin.tgz -o .runtime/ollama.tgz
  echo '66e1587711f3a06315b23782ba74897001da6c8b8edf6c0371f7533015a076dd  .runtime/ollama.tgz' | shasum -a 256 -c -
  tar -xzf .runtime/ollama.tgz -C .runtime/ollama
fi
if [[ ! -x .runtime/python/bin/python ]]; then
  python3 -m venv .runtime/python
fi
.runtime/python/bin/python -m pip install --disable-pip-version-check 'pymupdf>=1.24,<1.27' 'rapidocr_onnxruntime==1.4.4'
export OLLAMA_MODELS="$PWD/.runtime/models"
export OLLAMA_HOST=127.0.0.1:11434
export OLLAMA_NO_CLOUD=1
if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
  nohup .runtime/ollama/ollama serve >.runtime/ollama.log 2>&1 &
  for i in {1..30}; do
    curl -fsS http://127.0.0.1:11434/api/tags >/dev/null 2>&1 && break
    sleep 1
  done
fi
.runtime/ollama/ollama pull qwen3:8b
echo 'Lokale KI eingerichtet. Jetzt Start.command öffnen.'
read -r '?Enter zum Schließen …'
