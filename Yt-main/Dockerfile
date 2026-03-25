# Nutze ein Python-Image als Basis
FROM python:3.9-slim

# Installiere FFmpeg im System
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Arbeitsverzeichnis festlegen
WORKDIR /app

# Requirements kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Den restlichen Code kopieren
COPY . .

# Den Port freigeben (Render nutzt standardmäßig 10000)
EXPOSE 10000

# Startbefehl
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "server:app"]
