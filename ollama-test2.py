from ollama import Client

client = Client(host="http://localhost:11434")

response = client.generate(
    model="gemma4:latest",
    prompt="Escreva um pequeno poema sobre programação."
)

print(response["response"])