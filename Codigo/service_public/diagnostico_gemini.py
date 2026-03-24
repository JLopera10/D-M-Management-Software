"""
Uso (desde esta carpeta): .venv\\Scripts\\python diagnostico_gemini.py
Comprueba clave, modelos con generateContent y una llamada corta por ID.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
_env_chatbot = BASE_DIR.parent / "service_chatbot" / ".env"
if _env_chatbot.is_file():
    load_dotenv(_env_chatbot)
load_dotenv(BASE_DIR / ".env", override=True)

GEMINI_MODEL = (os.environ.get("GEMINI_MODEL") or "").strip()


def main() -> int:
    key = (os.environ.get("GEMINI_API_KEY") or "").strip()
    if not key:
        print("FAIL: GEMINI_API_KEY vacía (service_public/.env o service_chatbot/.env).")
        return 1
    print("OK: GEMINI_API_KEY definida.")
    if GEMINI_MODEL:
        print(f"     GEMINI_MODEL en entorno: {GEMINI_MODEL!r}")
    else:
        print("     GEMINI_MODEL: (no definido; Django usará gemini-2.0-flash por defecto)")

    import google.generativeai as genai

    genai.configure(api_key=key)

    print("\n--- Modelos con generateContent (list_models) ---")
    try:
        nombres = []
        for m in genai.list_models():
            sm = getattr(m, "supported_generation_methods", None) or []
            if "generateContent" in sm:
                nombres.append(m.name)
        for n in sorted(nombres):
            print(n)
        if not nombres:
            print("(ninguno; revise clave o red)")
    except Exception as exc:  # noqa: BLE001
        print(f"list_models falló: {exc}")

    candidatos = []
    if GEMINI_MODEL:
        candidatos.append(GEMINI_MODEL)
    for x in (
        "gemini-2.0-flash",
        "gemini-2.0-flash-001",
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
    ):
        if x not in candidatos:
            candidatos.append(x)

    print("\n--- generate_content('Responde solo: OK') ---")
    for name in candidatos:
        try:
            model = genai.GenerativeModel(model_name=name)
            r = model.generate_content("Responde solo: OK")
            texto = getattr(r, "text", None) or ""
            texto = texto.strip()
            print(f"  {name!r} -> OK: {texto[:60]!r}")
            return 0
        except Exception as exc:  # noqa: BLE001
            err = str(exc)
            if "404" in err or "not found" in err.lower():
                print(f"  {name!r} -> 404 / no disponible")
            else:
                print(f"  {name!r} -> ERROR: {type(exc).__name__}: {err[:200]}")

    print("\nFAIL: Ningún candidato respondió. Ajuste GEMINI_MODEL a un nombre de list_models.")
    return 2


if __name__ == "__main__":
    sys.exit(main())
