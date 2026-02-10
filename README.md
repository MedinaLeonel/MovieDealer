# MovieDealer MVP 🎴

> *"No sé qué película ver y no quiero pensar."*

MovieDealer es un prototipo interactivo (MVP) diseñado para reducir drásticamente la fricción cognitiva al elegir una película. Utiliza una metáfora de juego de cartas para filtrar opciones rápidamente y llegar a una decisión final en menos de 60 segundos.

## 🚀 Cómo Iniciar

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Iniciar Servidor de Desarrollo**:
    ```bash
    npm run dev
    ```
3.  **Construir para Producción**:
    ```bash
    npm run build
    ```

---

## 🏗️ Arquitectura & Stack

*   **Frontend**: React + Vite + TypeScript.
*   **Styling**: Vanilla CSS con Variables CSS para temas dinámicos.
*   **Datos**: Simulación in-memory (`src/data/fakeMovies.ts`) con pósters de alta calidad (Wikipedia/TMDb source).
*   **Persistencia**: `localStorage` para guardar el *Daily Streak* (Racha).
*   **Deploy**: Listo para Netlify/Vercel (Static Site).

## 🔀 Mecánica del Juego "The Hand"

El usuario recibe una mano de **5 cartas** (Películas). El objetivo es quedarse con la mejor mano posible o arriesgarse a cambiar.

### Rondas de Descarte Dinámicas
El juego se vuelve más estricto a medida que avanzas:

1.  **Ronda 1**: Puedes descartar hasta **4** cartas.
2.  **Ronda 2**: Puedes descartar hasta **3** cartas.
3.  **Ronda 3**: Puedes descartar hasta **2** cartas.
4.  **Final**: Debes plantarte (**Stand**) con lo que tienes.

El sistema elegirá automáticamente **una ganadora** de tu mano final.

## 🎨 Temas (High UX)

El MVP incluye 5 temas visuales completos que cambian la atmósfera de la aplicación instantáneamente:

*   **Default**: Minimalismo oscuro.
*   **♠ Casino**: Verde tapete, dorado, elegante.
*   **🎷 Night Jazz**: Púrpura neón, cian, tipografía moderna.
*   **🎬 Theatre**: Rojo telón, dorado clásico, tipografía condensada.
*   **💾 Cyber Cafe**: Estilo terminal verde fosforescente, fondo negro puro.
*   **🔺 Memphis**: Diseño geométrico, amarillo vibrante y magenta.

## 🧩 Estructura del Proyecto

```
src/
├── components/
│   ├── Hand.tsx         # Contenedor de cartas con animaciones
│   ├── MovieCard.tsx    # Componente de carta individual interactiva
│   ├── ThemeSelector.tsx # Dropdown para cambio de temas
│   ├── Winner.tsx       # Pantalla de victoria
│   └── ...
├── data/
│   └── fakeMovies.ts    # Base de datos local curada (20+ pelis top)
├── hooks/
│   └── useMovieDealer.ts # Lógica central del juego (State Machine)
├── lib/
│   └── types.ts         # Definiciones TypeScript
├── App.tsx              # Layout principal
└── index.css            # Variables CSS y estilos globales
```

## 📅 Roadmap (Próximos Pasos)

*   [x] **Fase 1: Prototipo Validable** (Completado)
    *   Mecánica de rondas.
    *   Imágenes reales estables.
    *   Selector de temas.
*   [ ] **Fase 2: Conexión Real (Semana 2)**
    *   Integrar TMDb API para catálogo infinito.
    *   Filtros por género real.
*   [ ] **Fase 3: Social (Semana 3)**
    *   Compartir resultado en redes.
    *   Navegación por Director/Actores desde la carta ganadora.
*   [ ] **Fase 4: Launch (Semana 4)**
    *   PWA (Icono en escritorio).
    *   Analytics de uso.

---
*Desarrollado con ❤️ y React.*
