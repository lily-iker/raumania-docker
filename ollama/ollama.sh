#!/bin/sh

echo "Starting ollama..."

ollama serve &

for i in $(seq 10 -1 1); do
  printf "\rStarting in %2ds..." "$i"
  sleep 1
done
echo ""

echo "Ollama ready! Running model..."
ollama run gemma3:1b
