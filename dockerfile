FROM python:3.13-slim

# Install build tools and required libraries for OpenCV and GLib
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0

WORKDIR /app

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5500

ENV FLASK_APP=main.py

CMD ["python", "main.py"]
