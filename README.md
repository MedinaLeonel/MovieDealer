# MovieDealer 🎴 - Documentación Técnica para Agentes IA

> **Estado del Proyecto**: MVP Avanzado (Fase 3+).
> **Objetivo**: Reducir la fricción cognitiva en la elección de películas mediante una metáfora de "Dealer" de cartas.

Este documento proporciona una visión profunda de la arquitectura, lógica de negocio y estructuras de datos para que un agente de IA pueda entender, mantener o expandir el proyecto sin necesidad de realizar una lectura exhaustiva de todo el código fuente.

---

## 🏗️ Arquitectura de Software

El proyecto sigue una arquitectura **basada en Hooks (Brain Hook)** donde la lógica de negocio está desacoplada de la interfaz de usuario.

### 1. El Core: `useMovieDealer.ts`
Es el cerebro de la aplicación. Gestiona el ciclo de vida completo del "juego":
- **Máquina de Estados**: Controla los estados `idle`, `configuring`, `dealing`, `playing`, y `won`.
- **Motor de Intuición (Dealer Intuition)**: 
    - Rastrea las películas que el usuario **mantiene** en su mano durante los descartes.
    - Almacena preferencias temporales (géneros y décadas) en la sesión actual.
    - Si el usuario descarta cartas, el Dealer busca reemplazos que coincidan con los géneros o décadas de las cartas que el usuario decidió conservar, simulando que el "Dealer te conoce".
- **Gestión de Dificultad**: Implementa umbrales cognitivos basados en datos de TMDB:
    - `Niveles 1-2 (Chill)`: Filtra por alta popularidad (>400) y alto conteo de votos (>8000).
    - `Niveles 3-4 (Standard)`: Busca calidad media-alta (>7 rating) y popularidad moderada.
    - `Niveles 5-6 (Legend)`: Busca "joyas ocultas" o clásicos de culto basados en ratings altos (>7.5) pero menor popularidad mainstream.

### 2. Flujo de Datos (TMDB Integration)
La aplicación consume la API de **The Movie Database (TMDB)**.
- **Evasión de Repetición**: Mantiene un historial de IDs vistos (`seenMovieIds`) en `localStorage` (máx. 200) para asegurar que el Dealer siempre entregue contenido fresco.
- **Randomización Inteligente**: No solo pide géneros, sino que salta entre páginas aleatorias de la API para evitar el sesgo de los primeros resultados.

---

## 📊 Estructura de Datos

### Tipo: `Movie`
Definido en `src/lib/types.ts`.
```typescript
interface Movie {
    id: number;
    title: string;
    year: string | number;
    rating: number;       // vote_average (0-10)
    poster: string;       // URL completa del póster (w500)
    genre: string[];      // IDs de géneros como strings
    overview: string;     // Sinopsis
    difficulty?: number;
    popularity?: number;
    vote_count?: number;
}
```

### Configuración de Filtros (`FilterSettings`)
```typescript
interface FilterSettings {
    genres: string[];        // IDs de géneros seleccionados
    decades: string[];       // Ej: ["1990", "2000"]
    minRating?: number;      // Rating mínimo (1-10)
    person?: { id: number; name: string; type: 'actor' | 'director' };
}
```

---

## 🎮 Mecánica de "The Hand"

El juego se basa en **3 rondas de descarte progresivo**:
1. **Reparto Inicial**: El Dealer entrega 5 cartas.
2. **Ronda 1**: El usuario puede cambiar hasta **4** cartas.
3. **Ronda 2**: El usuario puede cambiar hasta **3** cartas.
4. **Ronda 3**: El usuario puede cambiar hasta **2** cartas.
5. **Decisión Final**: El usuario se planta (`stand`) y el sistema elige **una** ganadora de la mano actual mediante un generador de números aleatorios.

---

## 🎨 Diseño Web & Estética

### Temas Dinámicos
Usa un sistema de tokens CSS inyectados mediante el componente `ThemeSelector.tsx`. Los temas afectan:
- `--primary`, `--accent`, `--bg-dark`, `--card-bg`.
- Tipografía (Google Fonts importadas dinámicamente).

### UI/UX Highlights
- **Glassmorphism**: Uso extensivo de efectos de cristal en `MovieCard`.
- **Micro-animaciones**: Transiciones suaves al repartir (`dealing`) y al ganar.
- **Onboarding**: Sistema de tour guiado para nuevos usuarios.

---

## 🛠️ Stack Tecnológico

- **Framework**: React 19 + Vite.
- **Lenguaje**: TypeScript (Strict mode).
- **Estilos**: Vanilla CSS con variables avanzadas.
- **API Externa**: TMDB API (requiere variable de entorno `VITE_TMDB_API_KEY`).
- **Persistencia**: `localStorage` (Rachas, Películas vistas, Streak).

---

## 📝 Notas para Agentes IA
- Si deseas modificar la probabilidad de aparición de ciertos géneros, ajusta la lógica de `fetchMoviesByDifficulty` en el hook `useMovieDealer`.
- El componente `App.tsx` actúa puramente como un **Orquestador Visual**, delegando toda la lógica al hook y la renderización a componentes atómicos.
- Los estilos están organizados por componente (ej: `MovieCard.css` junto a `MovieCard.tsx`).

---
*Este proyecto está diseñado para ser extensible. El motor de "Dealer Intuition" es el área más fértil para mejoras de IA/heurística.*

