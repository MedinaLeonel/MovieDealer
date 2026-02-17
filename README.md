# MovieDealer 🎴 - Documentación Técnica v0.6.1

> **Versión**: v0.6.1 "Deep Discovery & Stability"
> **Estado**: Producción / Estable.
> **Objetivo**: Elección de películas mediante una mecánica de cartas con aprendizaje adaptativo.

Este documento proporciona una visión profunda de la arquitectura, lógica de negocio y estructuras de datos actualizada tras la implementación del **Protocolo de Selección** y **Deep Discovery**.

---

## 🏗️ Arquitectura de Software

### 1. El Cerebro: `useMovieDealer.ts`
Desacoplamiento total de la lógica de negocio.
- **Protocolo de Selección (v0.5.0)**: El usuario elige qué **CONSERVAR**. Lo que no se elige, se quema.
- **Deep Discovery (v0.6.0)**:
    - **Pool Masivo**: Fetch paralelo de 10 páginas (~200 películas).
    - **Rondas**: Extendidas a 6 rondas de refinamiento progresivo.
    - **Tokens**: 300 fichas iniciales (30 descartes posibles).
- **Prioridad de Persona (v0.6.1)**:
    - Si se selecciona un Actor/Director, el sistema omite las restricciones de popularidad/votos del nivel (ej: el filtro de 8000 votos de Nivel 1) para permitir una búsqueda real en su filmografía.

### 2. Motor de Aprendizaje Adaptativo
Analiza las cartas que el usuario **conserva** vs. las que **quema**:
- **Deseados**: Prioriza géneros de cartas conservadas.
- **Vetos**: Excluye automáticamente géneros quemados ≥3 veces durante la sesión.

---

## 📊 Estructura de Datos

### Tipo: `Movie` (Strict Mode)
Actualizado para garantizar integridad en el build de Netlify.
```typescript
interface Movie {
    id: number;
    title: string;
    year: string | number;
    rating: number;
    poster: string;
    genre: string[];
    overview: string;
    release_date: string;  // Requerido v0.6.1
    vote_average: number; // Requerido v0.6.1
}
```

---

## 🎮 Mecánica "The Selection Protocol"

1. **Reparto Inicial**: 6 cartas (v0.6.0).
2. **Ciclo de 6 Rondas**:
   - R1-R2: Conservar hasta 4.
   - R3-R4: Conservar hasta 3.
   - R5: Conservar hasta 2.
   - R6: Decidir la final (1).
3. **Dealer Burn**: En cada swap, el Dealer puede eliminar la carta de menor calidad para añadir tensión.
4. **Decisión Final**: El sistema elige la mejor opción basada en rating y disponibilidad de streaming (AR).

---

## 📱 UI/UX & Mobile-First
- **Viewport Stability**: Modales anclados a la raíz (`App.tsx`) para posicionamiento `fixed` real.
- **Performance**: Fetching paralelo con `Promise.all` para pool de 200 películas sin lag.
- **Aesthetics**: Glassmorphism, micro-animaciones y temática "Dark Cinema" premium.

---

## 🛠️ Stack Tecnológico
- **Framework**: React 19 + Vite.
- **Estilos**: Vanilla CSS (Mobile-First responsive architecture).
- **API**: TMDB (Búsqueda avanzada + WatchProviders AR).
- **Deploy**: Netlify (CI/CD conectado a Main).

---

## 📝 Notas para Agentes IA
- **Bypass de Filtros**: La lógica de `fetchMoviesByDifficulty` detecta automáticamente si hay una `person` en los filtros para relajar las restricciones de `vote_count`.
- **Modals**: No mover `StreamingModal` ni `Onboarding` dentro de contenedores con `transform`, ya que rompe el posicionamiento fijo.
- **Persistencia**: `movieDealerSeen` almacena hasta 500 IDs para evitar repeticiones.

---
*Este proyecto está diseñado para ser extensible. v0.6.1 es la versión más estable y profunda hasta la fecha.*


