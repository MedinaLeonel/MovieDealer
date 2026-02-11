# Informe Técnico: Algoritmos de Selección de Películas - Movie Dealer

**Fecha:** 10 de febrero de 2026  
**Objetivo:** Describir la lógica actual de filtrado y selección para facilitar futuras optimizaciones e implementar cambios.

---

## 1. Arquitectura de Filtrado por "Nivel de Cinefilia"
El sistema clasifica la experiencia del usuario en 6 niveles, que impactan directamente en los parámetros enviados a la API de TMDB (`/discover/movie`).

| Nivel | Etiqueta | Criterio Técnico (TMDB Query) | Perfil de Usuario |
| :--- | :--- | :--- | :--- |
| **1-2** | **Chill / ¿Qué ver?** | `vote_count.gte=8000` & `popularity.gte=400` | Usuario casual. Busca éxitos globales y cine comercial (Blockbusters). |
| **3-4** | **Sorpréndeme / Adicto** | `vote_average.gte=7` & `popularity` entre 100 y 1000 | Espectador habitual. Busca calidad fuera del radar mainstream inmediato. |
| **5-6** | **Extremo / Leyenda** | `vote_count.gte=500`, `vote_average.gte=7.5`, ordenado por calificación | Cinéfilo puro. Busca clásicos, cine de culto y joyas críticas. |

---

## 2. Algoritmo de Reparto Inicial (Initial Deal)
Ubicado en la función `dealHand` dentro de `useMovieDealer.ts`.

*   **Heurística de Diversidad:** Para evitar una mano monótona (por ejemplo, 5 películas de acción de los 90), el algoritmo utiliza un sistema de **sets de control**:
    1.  Crea un `Set` para géneros y otro para décadas.
    2.  Itera sobre el pool de películas obtenido (barajado aleatoriamente).
    3.  Solo añade una película a la mano si introduce un **nuevo género** o una **nueva década** que no esté presente todavía.
    4.  Si tras esta pasada no se llega a las 5 cartas de la mano, rellena con el resto de películas disponibles hasta completar.
*   **Gestión de Memoria:** Filtra cualquier ID contenido en `seenMovieIds` (historial de las últimas 200 películas vistas) para garantizar frescura.

---

## 3. Motor de Recomendación Adaptativa (Swap/Learning)
Ubicado en la función `swapCards`. El sistema "aprende" de lo que el usuario decide **conservar**.

1.  **Captura de Preferencias:** Cada vez que el usuario intercambia cartas, el sistema analiza las cartas que se quedaron en la mano. Suma peso (+1) a esos géneros y décadas en un objeto de estado llamado `preferences`.
2.  **Prioridad de Reemplazo:**
    *   **Fase Local:** Busca en el pool de películas ya descargadas aquellas que coincidan con los géneros o décadas de lo que el usuario conservó.
    *   **Fase de Recarga Dinámica:** Si no hay suficientes coincidencias locales, lanza una petición a la API en segundo plano usando los géneros y décadas con mayor peso acumulado en el perfil del usuario.

---

## 4. Lógica de "Dealer Burn" (Dificultad Dinámica)
Ubicado en `executeDealerBurn`. Para añadir un elemento de desafío:
*   Al pasar a la **Ronda 2**, el sistema identifica automáticamente la película con la **calificación (rating) más baja** de la mano actual y la elimina, obligando al jugador a buscar un reemplazo o quedarse con una mano más reducida pero de mayor calidad técnica.

---

## 5. Restricciones Económicas y de Juego
*   **Costo por Estrategia:** Cada intercambio consume 10 tokens por carta. Si el usuario se queda sin tokens, el "Dealer" bloquea los intercambios.
*   **Lógica All-in:** Al llegar a 0 tokens, el juego fuerza el estado de "Stand" (Plantarse), terminando la partida con la mejor selección disponible en ese momento.

---

## 6. Próximos Pasos Sugeridos para Mejora
1.  **Refinamiento de "Sorpréndeme":** Implementar un factor de "Rareza" (inversamente proporcional a la popularidad) para este modo específico.
2.  **Memoria Persistente:** Hacer que `UserPreferences` se guarde en `localStorage` para que el Dealer te conozca mejor en futuras sesiones.
3.  **Filtro de Disponibilidad:** Integrar `WatchProviders` en la búsqueda inicial para que el algoritmo priorice películas disponibles en las plataformas de streaming activas del usuario.
