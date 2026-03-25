FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY dm_asistente_core /deps/dm_asistente_core
RUN pip install --no-cache-dir -e /deps/dm_asistente_core

COPY service_chatbot/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY service_chatbot /app
