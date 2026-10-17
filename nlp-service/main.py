from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()
# Мультимовна модель, бо описи будуть українською
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")


class EmbedRequest(BaseModel):
    text: str


@app.post("/embed")
def embed(req: EmbedRequest):
    vector = model.encode(req.text, normalize_embeddings=True)
    return {"embedding": vector.tolist()}


@app.get("/health")
def health():
    return {"ok": True}