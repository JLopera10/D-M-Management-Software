# dm-asistente-core

Paquete Python compartido: constantes, prompt de sistema e integración con Google Gemini para el chatbot (US-04).

## Uso en desarrollo

**Obligatorio** antes de `runserver` en `service_public` o `service_chatbot` (carpeta padre `Codigo`):

```bash
pip install -e ./dm_asistente_core
```

Luego, dentro de cada servicio:

```bash
pip install -r requirements.txt
```

En Docker Compose, el contexto de build es la carpeta `Codigo`; los `Dockerfile` de `service_public` y `service_chatbot` copian e instalan este paquete en editable desde `/deps/dm_asistente_core`.
