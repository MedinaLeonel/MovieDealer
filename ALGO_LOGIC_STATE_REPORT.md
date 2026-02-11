# 📄 Informe de Estado Actual: Algo/Logic & Game Engineering
**Proyecto:** Movie Dealer v0.1.1  
**Destinatario:** Algo-logic Lead, CEO, CDO, QA & Precision Auditor, Chief Game Architect, Lead Animation Engineer.

---

## 1. Executive Summary (Para CEO & CDO)
El sistema actual de Movie Dealer ha evolucionado de un recomendador estático a un **Motor de Intuición Adaptativo**. La lógica no solo busca películas, sino que "aprende" de las decisiones de descarte del usuario en tiempo real para refinar la mano final. El balance entre azar controlado y precisión técnica (streaming availability) es el núcleo de la v0.1.1.

---

## 2. Pilares de la Arquitectura Lógica (Para Chief Game Architect)
El "cerebro" reside en el hook `useMovieDealer.ts`, operando bajo una **Máquina de Estados de 6 Fases**:
`idle` → `configuring` → `dealing` → `playing` → `revealing` → `won`.

### A. Motor de Reparto (The Dealer's Hand)
- **Diversidad Garantizada**: El algoritmo de reparto inicial evita la saturación de géneros (límite de 2 por género en la mano inicial).
- **Control de Repetición**: Historial persistente en `localStorage` de hasta **500 IDs vistos**. Si el pool se agota, el sistema inyecta **Mystery Cards (Comodines)** para evitar fallos de renderizado.
- **Dificultad Dinámica**: 
    - *Modo Chill (Lv 1-2)*: Hits masivos (>8000 votos).
    - *Modo Sorpréndeme (Lv 3-4)*: Calidad oculta (Rating >7.0, Popularidad equilibrada).
    - *Modo Leyenda (Lv 5-6)*: Clásicos y Culto (Rating >7.8, pre-año 2000).

---

## 3. Heurística de Interacción: "Dealer Intuition" (Para Lead Animation & Algo Leads)
La lógica de intercambio (`swapCards`) no es puramente aleatoria:

1. **Memoria de Escurrimiento**: Al descartar, el Dealer analiza las cartas que el usuario **conservó**.
2. **Sesgo de Afinidad**: Busca nuevos candidatos que coincidan con los géneros de las cartas mantenidas y la década de la carta con mejor rating en la mano.
3. **The Dealer Burn (Ronda 2)**: Un evento de lógica forzada donde el Dealer elimina automáticamente la carta de menor calidad (`vote_average`) de la mano del usuario, incrementando la "tensión narrativa" del juego.

---

## 4. Auditoría de Precisión y QA (Para QA & Precision Auditor)
### Algoritmo de Decisión Final (The Winner Selection)
Para evitar que el usuario se sienta decepcionado por una recomendación que "no puede ver", hemos implementado un sistema de **Desempate por Streaming**:
- Si hay un empate técnico (diferencia de rating < 0.2), el algoritmo consulta en tiempo real los `WatchProviders` de TMDB.
- **Prioridad AR**: Se otorga la victoria a la película con disponibilidad *Flatrate* (Suscripción) en **Argentina**.

### Fail-safes (Robustez):
- **Graceful Fallback**: Si los filtros de década o persona son muy restrictivos, el motor relaja automáticamente los criterios de rating y popularidad en una segunda pasada silenciosa para garantizar 5 cartas.

---

## 5. Hooks para Animación y UX (Para Lead Animation Engineer)
El sistema expone estados específicos para disparar micro-animaciones:
- `isRevealing`: Un booleano de 1500ms que permite a la UI ejecutar estados de "barajado visual" o "glow effects" antes de mostrar al ganador.
- `burnMessage`: Un string temporal que la UI captura para mostrar notificaciones del Dealer interviniendo.

---

---

## 6. v0.3 Implementation Details (Misión: Intuición y Tensión) - ✅ COMPLETADO
1. **Economía de Tokens (La Trampa del Jugador)**: El coste de swap ahora es exponencial: `10 * (n ^ 1.2)`. Descartar 5 cartas cuesta ~68 tokens, forzando decisiones estratégicas.
2. **Latencia Zero (Pre-cacheo)**: Implementado `availabilityCache`. El motor dispara consultas de streaming apenas se entra en la fase `playing`. La revelación final ahora es instantánea.
3. **Refinamiento de Intuición (Blacklist Bias)**: El motor ahora trackea décadas descartadas. Si se descartan >3 cartas de una misma década, esa década queda bloqueada para los reemplazos de esa sesión.
4. **Visual Tension (The Burn)**: El aviso de eliminación del Dealer ahora usa **JetBrains Mono** con un efecto de parpadeo rojo de alta visibilidad.

---

**Reporte Generado por:** Antigravity (Advanced Agentic Coding Team - Google Deepmind)  
**Fecha:** 2026-02-11
