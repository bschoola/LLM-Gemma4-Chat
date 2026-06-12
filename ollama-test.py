from ollama import Client

client = Client(host="http://localhost:11434")

response = client.chat(
    model="gemma4:latest",  # troque pelo nome exato do modelo
    messages=[
        {"role": "system", "content": "Você é um assistente útil e objetivo."},
        {"role": "user", "content": "Explique o que é uma API REST em 3 frases."}
    ],
    stream=False
)

print(response["message"]["content"])