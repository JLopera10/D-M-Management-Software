/**
 * CP-01.1 / CP-01.2 — Portafolio en página principal (sección bajo Hero/Stats).
 * @see criterios de aceptación del proyecto (wiki).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import Home from "../pages/Home";

const PROYECTOS_MOCK = [
  {
    id: 101,
    titulo: "Cubierta industrial Norte",
    descripcion:
      "Sistema de cubierta metálica con luminarias y drenaje integrado para nave logística.",
    ubicacion: "Bogotá",
    url_imagen: "https://example.com/proyectos/cubierta-norte.jpg",
    categoria: "Cubierta",
  },
  {
    id: 102,
    titulo: "Cerramiento perimetral",
    descripcion:
      "Cerramiento en panel metálico con acceso peatonal y vehicular.",
    ubicacion: "Medellín",
    url_imagen: "https://example.com/proyectos/cerramiento-102.jpg",
    categoria: "Cerramiento",
  },
  {
    id: 103,
    titulo: "Estructura mezzanine",
    descripcion: "Mezzanine de acero galvanizado para zona de almacenaje.",
    ubicacion: "Cali",
    url_imagen: "https://example.com/proyectos/mezzanine-103.jpg",
    categoria: "Estructura",
  },
];

function mockFetchPortafolio() {
  return vi.fn((input) => {
    const url = typeof input === "string" ? input : input.url;
    if (String(url).includes("/categories/") || String(url).includes("categories")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            exito: true,
            categorias: ["Cubierta", "Cerramiento"],
          }),
      });
    }
    if (String(url).includes("/projects/") || String(url).includes("projects")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            exito: true,
            proyectos: PROYECTOS_MOCK,
          }),
      });
    }
    return Promise.reject(new Error(`fetch no mockeado: ${url}`));
  });
}

describe("CP-01.1: Carga inicial del portafolio", () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = mockFetchPortafolio();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("muestra listado de proyectos con varias tarjetas al cargar la home", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /nuestro portafolio/i })).toBeInTheDocument();
    });

    const tarjetas = await screen.findAllByRole("article");
    expect(tarjetas.length).toBeGreaterThanOrEqual(3);

    for (const tarjeta of tarjetas) {
      expect(within(tarjeta).getByRole("img")).toBeInTheDocument();
      expect(within(tarjeta).getByRole("heading", { level: 3 })).toBeInTheDocument();
      expect(within(tarjeta).getByText(/📍/)).toBeInTheDocument();
      const desc = tarjeta.querySelector(".description");
      expect(desc).toBeTruthy();
      expect(desc.textContent.trim().length).toBeGreaterThan(0);
    }

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("CP-01.2: Visualización de información de proyecto", () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = mockFetchPortafolio();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("cada tarjeta muestra imagen, título y descripción coherentes con los datos", async () => {
    render(<Home />);

    const primera = PROYECTOS_MOCK[0];
    const img = await screen.findByRole("img", { name: primera.titulo });
    expect(img).toHaveAttribute("src", primera.url_imagen);
    expect(img).toHaveAttribute("alt", primera.titulo);

    expect(
      screen.getByRole("heading", { name: primera.titulo, level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText(new RegExp(primera.ubicacion))).toBeInTheDocument();
    expect(screen.getByText(primera.descripcion)).toBeInTheDocument();

    const articulos = screen.getAllByRole("article");
    expect(articulos[0].querySelector(".card-content h3")?.textContent).toBe(
      primera.titulo
    );
  });
});
