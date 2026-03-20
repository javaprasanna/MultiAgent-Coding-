import ollama
import asyncio
from typing import AsyncGenerator

class OllamaManager:
    """Manages Ollama models, explicitly loading and unloading to save RAM on unified memory architectures (M4)."""
    
    def __init__(self):
        self.client = ollama.AsyncClient(host="http://localhost:11434")
        self.current_model = None
        self.global_lock = asyncio.Lock() # Ensure true sequential execution across requests
        
    async def unload_model(self):
        """Unload the currently loaded model to free unified memory."""
        if self.current_model:
            print(f"Unloading model {self.current_model}...")
            try:
                await self.client.generate(model=self.current_model, prompt="", keep_alive=0)
            except Exception:
                pass
            self.current_model = None

    async def safe_generate_stream(self, model: str, prompt: str, system: str, options: dict) -> AsyncGenerator[str, None]:
        async with self.global_lock:
            if self.current_model != model:
                await self.unload_model()
                self.current_model = model
            
            response = await self.client.generate(
                model=model,
                prompt=prompt,
                system=system,
                options=options,
                stream=True,
                keep_alive="1h"
            )
            async for chunk in response:
                if "response" in chunk:
                    yield chunk["response"]

    async def check_readiness(self, model: str):
        try:
            models = await self.client.list()
            model_names = [m["name"] for m in models.get("models", [])]
            if model not in model_names and f"{model}:latest" not in model_names:
                raise ValueError(f"Model {model} not found. Please run: ollama pull {model}")
        except Exception as e:
            if isinstance(e, ValueError):
                raise e
            raise ConnectionError("Ollama is not running. Please start Ollama: ollama serve")

manager = OllamaManager()
