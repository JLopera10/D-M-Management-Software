"""Smoke tests del catálogo / portafolio (US-01, US-02)."""

from django.test import TestCase

from catalogo.models import Project


class PortafolioApiTests(TestCase):
    def setUp(self) -> None:
        Project.objects.create(
            titulo="Obra demo",
            descripcion="Descripción de prueba para el portafolio.",
            ubicacion="Bogotá",
            url_imagen="https://example.com/img.jpg",
            categoria="Cubierta",
        )

    def test_listar_proyectos_get_200(self) -> None:
        r = self.client.get("/projects/")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(data.get("exito"))
        self.assertEqual(len(data.get("proyectos", [])), 1)
        p = data["proyectos"][0]
        self.assertEqual(p["titulo"], "Obra demo")
        self.assertIn("url_imagen", p)
        self.assertIn("descripcion", p)

    def test_listar_categorias_incluye_categoria(self) -> None:
        r = self.client.get("/categories/")
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(data.get("exito"))
        self.assertIn("Cubierta", data.get("categorias", []))

    def test_filtro_categoria_query(self) -> None:
        Project.objects.create(
            titulo="Otro tipo",
            descripcion="Cerramiento perimetral.",
            ubicacion="Medellín",
            url_imagen="https://example.com/b.jpg",
            categoria="Cerramiento",
        )
        r = self.client.get("/projects/?categoria=Cubierta")
        data = r.json()
        self.assertEqual(len(data["proyectos"]), 1)
        self.assertEqual(data["proyectos"][0]["titulo"], "Obra demo")
