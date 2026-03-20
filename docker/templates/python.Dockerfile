FROM --platform=linux/arm64 python:3.11-slim
WORKDIR /app
COPY . .
RUN if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
EXPOSE 8000
CMD ["python", "main.py"]
