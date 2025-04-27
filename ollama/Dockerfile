FROM ollama/ollama

# Copy our startup script into the container
COPY ollama.sh /ollama.sh

# Make the script executable
RUN chmod +x /ollama.sh

EXPOSE 11434

# Run the script when the container starts
ENTRYPOINT ["/ollama.sh"]