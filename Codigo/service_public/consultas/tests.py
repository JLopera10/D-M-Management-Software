"""Pruebas US-06: registro de solicitudes desde el chatbot."""

import json

from django.test import Client, TestCase

from consultas.models import SolicitudContactoChat


class RegistroSolicitudChatbotTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.url = "/consultas-chatbot/registro/"
        self.payload_ok = {
            "nombre": "Cliente Prueba",
            "email": "cliente.prueba@example.com",
            "telefono": "3001234567",
            "resumen_confirmado": (
                "Necesito cubierta metálica de aproximadamente 400 m² en zona industrial."
            ),
            "historial_chat": [
                {"rol": "usuario", "contenido": "Hola, busco cubierta"},
                {"rol": "asistente", "contenido": "Con gusto le ayudo."},
            ],
        }

    def test_post_valido_crea_registro_y_responde_201(self) -> None:
        r = self.client.post(
            self.url,
            data=json.dumps(self.payload_ok),
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 201)
        data = r.json()
        self.assertTrue(data.get("exito"))
        self.assertIn("id", data)
        self.assertEqual(SolicitudContactoChat.objects.count(), 1)
        sol = SolicitudContactoChat.objects.get()
        self.assertEqual(sol.nombre, "Cliente Prueba")
        self.assertEqual(sol.email, "cliente.prueba@example.com")
        self.assertEqual(len(sol.historial_chat), 2)

    def test_email_invalido_400(self) -> None:
        body = {**self.payload_ok, "email": "no-es-correo"}
        r = self.client.post(
            self.url,
            data=json.dumps(body),
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 400)
        self.assertFalse(r.json().get("exito"))
        self.assertEqual(SolicitudContactoChat.objects.count(), 0)

    def test_resumen_muy_corto_400(self) -> None:
        body = {**self.payload_ok, "resumen_confirmado": "corto"}
        r = self.client.post(
            self.url,
            data=json.dumps(body),
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 400)
        self.assertEqual(SolicitudContactoChat.objects.count(), 0)

    def test_json_invalido_400(self) -> None:
        r = self.client.post(
            self.url,
            data="{no json",
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 400)

    def test_get_no_permitido(self) -> None:
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, 405)
