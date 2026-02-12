# 🎴 MovieDealer — Guía de Testing QA (v0.5.0 "The Selection Protocol")

**Fecha de emisión:** 11 de febrero de 2026  
**Versión bajo prueba:** v0.5.0  
**Entorno de desarrollo:** `http://localhost:5173`  
**Responsable del documento:** Equipo de Desarrollo

---

## 📋 ÍNDICE

1. [Resumen de Cambios v0.5.0](#1-resumen-de-cambios-v050)
2. [Glosario de Términos](#2-glosario-de-términos)
3. [Mapa de Estados del Juego](#3-mapa-de-estados-del-juego)
4. [Flujo Completo del Usuario (Happy Path)](#4-flujo-completo-del-usuario-happy-path)
5. [Casos de Prueba por Feature](#5-casos-de-prueba-por-feature)
6. [Pruebas de Edge Cases y Stress](#6-pruebas-de-edge-cases-y-stress)
7. [Checklist de Regresión](#7-checklist-de-regresión)
8. [Datos de Referencia](#8-datos-de-referencia)
9. [Cómo Reportar Bugs](#9-cómo-reportar-bugs)

---

## 1. RESUMEN DE CAMBIOS v0.5.0

### 🔄 CAMBIO PRINCIPAL: Inversión de la Mecánica de Juego

**ANTES (v0.4.x):** El usuario seleccionaba las cartas que quería **descartar** (tirar).  
**AHORA (v0.5.0):** El usuario selecciona las cartas que quiere **conservar** (quedarse). Las cartas **no seleccionadas** se queman automáticamente.

> ⚠️ **ESTO ES CRÍTICO**: Toda la UX y los textos deben reflejar esta inversión. Si en algún lugar de la app sigue diciendo "descartar" o "eliminar" en el contexto de la acción principal del jugador, es un **bug de copy**.

### Nuevas Features:
| Feature | Descripción |
|---------|-------------|
| **Selection Protocol** | El jugador selecciona cartas para CONSERVAR, no para descartar |
| **Motor de Aprendizaje Adaptativo (Session Learning)** | El sistema trackea géneros conservados vs. descartados y adapta futuras cartas |
| **Sistema de Veto de Géneros** | Géneros descartados ≥3 veces se excluyen de futuras búsquedas |
| **Géneros Deseados (genresToFollow)** | Los géneros de las cartas conservadas se priorizan en la API |
| **Géneros Excluidos (genresToExclude)** | Los géneros vetados se excluyen explícitamente via `without_genres` |
| **Badge "CONSERVAR"** | Indicador visual en las cartas seleccionadas |
| **Botón "Conservar Selección (N)"** | Nuevo CTA principal que muestra la cantidad de cartas conservadas |
| **Tooltip de Costo** | Muestra cuántas cartas se queman y cuántos tokens cuesta |
| **SessionPreferences (nuevo tipo)** | Estructura de datos que almacena el perfil de la sesión |

---

## 2. GLOSARIO DE TÉRMINOS

| Término | Significado |
|---------|-------------|
| **Hand / Mano** | Las 5 cartas repartidas al jugador |
| **Keep / Conservar** | Acción de seleccionar una carta para quedársela |
| **Burn / Quemar** | Una carta no seleccionada que se descarta automáticamente |
| **Dealer Burn** | En Ronda 2, el sistema elimina automáticamente la carta de menor rating |
| **Stand / Plantarse** | Terminar el juego con la mano actual |
| **Tokens** | Moneda interna (100 iniciales, -10 por cada carta quemada) |
| **maxKeep** | Máximo de cartas que el jugador puede conservar por ronda |
| **maxDiscards** | Máximo de cartas que se pueden quemar por ronda |
| **Mystery Card** | Carta placeholder cuando el mazo se agota |
| **Veto** | Un género descartado ≥3 veces en la sesión se excluye automáticamente |
| **Session Preferences** | Perfil de gustos acumulado durante la sesión actual |
| **Revealing** | Estado de animación antes de mostrar la ganadora |

---

## 3. MAPA DE ESTADOS DEL JUEGO

```
┌────────┐    Comenzar     ┌──────────────┐    Personalizar   ┌──────────────┐
│  IDLE  │───────────────► │   DEALING    │ ◄──────────────── │ CONFIGURING  │
│        │◄── Volver ──────│  (loading)   │    Repartir       │  (filtros)   │
│        │── Personalizar ►│              │                   │              │
└────────┘                 └──────┬───────┘                   └──────────────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │   PLAYING    │ ◄──── swapCards (loop hasta 3 rondas)
                           │  (rondas)    │
                           └──────┬───────┘
                                  │ Stand / All-in
                                  ▼
                           ┌──────────────┐
                           │  REVEALING   │ (animación 1.5s)
                           │              │
                           └──────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │     WON      │ ── Volver ──► IDLE
                           │  (ganadora)  │
                           └──────────────┘
```

---

## 4. FLUJO COMPLETO DEL USUARIO (Happy Path)

### Test Case HP-001: Juego Rápido Completo (sin filtros)

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Abrir la app | Pantalla IDLE: título "No pienses. Solo elige.", selector de nivel (1-6), botones "Comenzar Juego" y "Personalizar Mano" |
| 2 | Dejar nivel en 1 | El slider muestra LEVEL 1 |
| 3 | Click en "Comenzar Juego" | Estado `dealing`: spinner 🃏 + texto "El Dealer está barajando..." |
| 4 | Esperar ~2-5 seg | Estado `playing`: aparecen 5 cartas con animación staggered (una tras otra). Panel superior muestra LEVEL, indicador de rondas (1, 2, 3, Final), y la instrucción "Selecciona hasta **4** películas para **conservar**" |
| 5 | Click en 2 cartas | Cada carta clickeada muestra badge verde "CONSERVAR". El botón inferior dice "Conservar Selección (2)" |
| 6 | Click en "Conservar Selección (2)" | Las 3 cartas NO seleccionadas desaparecen (animación greyscale+blur). Aparecen 3 cartas nuevas. Se descontaron 30 tokens. Se avanza a Ronda 2 |
| 7 | (Ronda 2) Observar | **DEALER BURN automático**: la carta de menor rating es eliminada con mensaje "Dealer's Choice: Eliminé 'TÍTULO' por baja calidad." El mensaje desaparece en 5 seg. La instrucción ahora dice "Selecciona hasta **3** películas para **conservar**" |
| 8 | Seleccionar 2 cartas y click "Conservar Selección (2)" | Se queman las no seleccionadas. Aparecen reemplazos. Se descontaron tokens. Ronda 3 |
| 9 | (Ronda 3) La instrucción dice "Selecciona hasta **2**" | Seleccionar 1 y confirmar |
| 10 | (Ronda Final o Stand) Click "Plantarse (Stand)" | Estado `revealing`: texto "EL DEALER REVELA EL DESTINO..." con animación pulsante. ~1.5 seg después, pantalla WINNER |
| 11 | Pantalla Winner | Muestra: poster grande, título en mayúsculas, rating, año, sinopsis, providers de streaming (AR), botones "TRAILER" y "VOLVER" |
| 12 | Click "VOLVER" | Regresa a estado IDLE |

---

## 5. CASOS DE PRUEBA POR FEATURE

---

### 🎯 F-001: MECÁNICA DE SELECCIÓN INVERTIDA (CORE)

#### F-001-A: Selección Básica
| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-001 | Estado `playing`, Ronda 1 | Click en una carta | Badge "CONSERVAR" aparece sobre la carta. La carta tiene clase CSS `.selected` | 🔴 Alta |
| TC-002 | 1 carta seleccionada | Click en la misma carta | Se deselecciona. Badge desaparece | 🔴 Alta |
| TC-003 | 0 cartas seleccionadas | Click botón "Conservar Selección" | El botón debe estar **deshabilitado** (no hace nada) | 🔴 Alta |
| TC-004 | 4 cartas seleccionadas (maxKeep en R1) | Click en la 5ª carta | **NO debe seleccionarse**. El máximo es 4 en Ronda 1 | 🔴 Alta |
| TC-005 | Ronda 2 | Verificar maxKeep | El texto debe decir "Selecciona hasta **3**" | 🔴 Alta |
| TC-006 | Ronda 3 | Verificar maxKeep | El texto debe decir "Selecciona hasta **2**" | 🔴 Alta |

#### F-001-B: Tooltip de Costo
| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-007 | 2 cartas seleccionadas de 5 | Hover sobre botón "Conservar Selección" | Tooltip muestra: "Quemás 3 cartas • Cuesta 30 tokens" | 🟡 Media |
| TC-008 | 4 cartas seleccionadas de 5 | Hover sobre botón | Tooltip: "Quemás 1 carta • Cuesta 10 tokens" | 🟡 Media |

---

### 🧠 F-002: MOTOR DE APRENDIZAJE ADAPTATIVO

> **Cómo verificar:** Abrir la consola del navegador (F12 → Console). Cada swap logueará:  
> `[v0.5.0 Learning] { desired: [...], vetoed: [...], avgRating: "X.X", avgYear: YYYY }`

#### F-002-A: Aprendizaje Positivo (géneros conservados)
| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-009 | Ronda 1 con cartas de Acción y Drama | Conservar ambas cartas de Acción y Drama | En consola: `desired` incluye los IDs "28" (Acción) y "18" (Drama) | 🔴 Alta |
| TC-010 | Tras TC-009, Ronda 2 | Observar nuevas cartas reemplazadas | Las nuevas cartas deberían tener una inclinación hacia Acción o Drama (no garantizado pero tendencial) | 🟡 Media |

#### F-002-B: Sistema de Veto (géneros descartados)
| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-011 | Jugar 3+ rondas, descartando consistentemente Terror (ID: 27) | Descartar cartas de Terror 3 veces | En consola: `vetoed` incluye "27". Las cartas nuevas **no** deberían incluir Terror | 🔴 Alta |
| TC-012 | Un género es tanto deseado como vetado | Conservar y descartar el mismo género en distintas rondas | El género **no** debe ser vetado si también está en `desired` (hay filtro de protección) | 🟡 Media |

#### F-002-C: Datos Cruzados (avgRating, avgYear)
| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-013 | Conservar películas con ratings 8.0 y 7.5 | Verificar consola | `avgRating` debería ser ~7.75 | 🟢 Baja |
| TC-014 | Conservar películas de 2020 y 2015 | Verificar consola | `avgYear` debería ser ~2017-2018 | 🟢 Baja |

---

### 🔥 F-003: DEALER BURN

| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-015 | Pasar de Ronda 1 a Ronda 2 | Hacer swap en Ronda 1 | Un mensaje aparece: "Dealer's Choice: Eliminé 'TÍTULO' por baja calidad." — la carta con el MENOR rating de la mano fue eliminada automáticamente | 🔴 Alta |
| TC-016 | Después de un Dealer Burn | Verificar mano | La mano tiene 1 carta menos (ej: si tenía 5, ahora tiene 4) | 🔴 Alta |
| TC-017 | Dealer Burn activo | Esperar 5 segundos | El mensaje del Dealer Burn desaparece automáticamente | 🟡 Media |

---

### 💰 F-004: SISTEMA DE TOKENS

| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-018 | Inicio del juego | Verificar tokens | Se muestran 100 tokens en el header | 🔴 Alta |
| TC-019 | Quemar 3 cartas | Verificar tokens | Tokens = 100 - 30 = 70 | 🔴 Alta |
| TC-020 | Tokens = 10, quemar 2 cartas | Verificar tokens | Tokens = max(0, 10 - 20) = 0 | 🔴 Alta |
| TC-021 | Tokens = 0 | Verificar UI | Mensaje: "Sin fichas: All-in forzado." El botón swap debe desaparecer. Solo queda "Revelar Ganadora" | 🔴 Alta |
| TC-022 | Tokens = 0 | Intentar seleccionar cartas | Las cartas pueden estar seleccionadas pero maxKeep = hand.length (todas seleccionadas) | 🔴 Alta |
| TC-023 | Cerrar y reabrir app | Verificar tokens | Los tokens **persisten** en localStorage (se guardan automáticamente) | 🟡 Media |

---

### 🎨 F-005: CARDS - INTERACCIÓN VISUAL

#### F-005-A: Poster y Fallback
| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-024 | Carta con poster válido | Observar carta | Poster se carga correctamente. Skeleton desaparece al cargar la imagen | 🔴 Alta |
| TC-025 | Carta sin poster (poster_path = null) | Observar carta | Se muestra fallback: emoji 🍿 + texto "SIN IMAGEN" | 🔴 Alta |
| TC-026 | Mystery Card (mazo agotado) | Observar carta | Diseño especial: icono "?" + texto "JOYA DEL DEALER" o "TESORO DE LA CINETECA" | 🟡 Media |

#### F-005-B: Hover & Overlay
| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-027 | Carta normal | Hover (PC) | La carta sube (-15px), se escala (1.05x), sombra aumenta. Se muestra overlay con: título, año, rating (★), géneros (max 2), sinopsis | 🟡 Media |
| TC-028 | Mystery Card | Hover | NO debe tener efecto hover | 🟢 Baja |

#### F-005-C: Vista Expandida (Detalles)
| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-029 | Carta normal | Click en botón 👁️ (ojo) | Se abre vista expandida: título grande, año, rating, popularidad, géneros, sinopsis completa, WatchProviders, botones "Ver Trailer" y "Conservar Película" | 🔴 Alta |
| TC-030 | Vista expandida abierta | Click "Conservar Película" | La carta se selecciona (badge "CONSERVAR"), la vista expandida se cierra | 🔴 Alta |
| TC-031 | Vista expandida abierta | Click ✕ o backdrop oscuro | La vista expandida se cierra sin seleccionar la carta | 🟡 Media |
| TC-032 | Vista expandida | Click "Ver Trailer ▶" | Se abre nueva pestaña con búsqueda de YouTube: `{título} trailer` | 🟡 Media |

---

### 🏆 F-006: PANTALLA WINNER

| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-033 | Click "Plantarse" | Observar transición | Estado `revealing` con texto "EL DEALER REVELA EL DESTINO..." pulsante. Cartas se rotan en abanico. Tras ~1.5 seg, aparece pantalla Winner | 🔴 Alta |
| TC-034 | Pantalla Winner | Verificar datos | Se muestra: poster (o fallback 🍿), título en MAYÚSCULAS, rating ★, año, duración (si disponible), sinopsis, providers de streaming (AR) | 🔴 Alta |
| TC-035 | Winner con empate técnico (ratings con <0.2 de diferencia) | Verificar lógica | El sistema debería priorizar la película que tenga streaming flatrate en AR. Si ninguna tiene, gana la de mayor rating | 🟡 Media |
| TC-036 | Pantalla Winner | Click "TRAILER ▶" | Abre YouTube con búsqueda del trailer | 🟡 Media |
| TC-037 | Pantalla Winner | Click "VOLVER" | Regresa a IDLE con estado limpio | 🔴 Alta |
| TC-038 | Pantalla Winner | Observar fondo | Background cinemático: poster borroso de fondo + viñeta dinámica + cartas descartadas como "fantasmas" semitransparentes | 🟢 Baja |

---

### ⚙️ F-007: CONFIGURACIÓN DE FILTROS

| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-039 | Pantalla IDLE | Click "Personalizar Mano" | Pantalla de configuración con secciones: GÉNEROS (chips seleccionables), DÉCADAS (chips), DIRECTOR O ACTOR (input con búsqueda) | 🔴 Alta |
| TC-040 | Pantalla filtros | Seleccionar género "Acción" | Chip se ilumina (clase `.active`). El filtro se guarda internamente | 🟡 Media |
| TC-041 | Pantalla filtros | Escribir "Spielberg" en campo de persona (≥3 chars) | Dropdown aparece con resultados después de 500ms. Muestra nombre + tipo (Dir/Act) | 🔴 Alta |
| TC-042 | Persona seleccionada | Click ✕ al lado del input | Se limpia la persona seleccionada | 🟡 Media |
| TC-043 | Filtros configurados | Click "REPARTIR" | Transición a estado `dealing` con filtros aplicados | 🔴 Alta |
| TC-044 | Pantalla filtros | Click "ATRÁS" | Regresa a IDLE sin perder selecciones previas | 🟡 Media |

---

### 📊 F-008: NIVELES DE DIFICULTAD

| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-045 | Nivel 1-2 (Chill) | Jugar partida | Las películas deben ser blockbusters ultra populares (8000+ votos). Nombres reconocibles (Marvel, Star Wars, etc.) | 🔴 Alta |
| TC-046 | Nivel 3-4 (Sorpréndeme) | Jugar partida | Películas con rating ≥ 7.0, popularidad moderada (≤800). Menos mainstream | 🔴 Alta |
| TC-047 | Nivel 5-6 (Leyenda) | Jugar partida | Películas clásicas / culto: rating ≥ 8.0, 1000+ votos, pre-1995. Si se agota, puede inyectar "TESORO DE LA CINETECA" (clásicos hardcodeados) | 🔴 Alta |

---

### 🎰 F-009: STREAK Y PERSISTENCIA

| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-048 | Primer juego del día | Completar una partida | Streak +1. Se muestra en el header | 🟡 Media |
| TC-049 | Segundo juego del **mismo día** | Completar otra partida | Streak NO cambia (solo +1 por día) | 🟡 Media |
| TC-050 | Cerrar app y reabrir | Verificar datos | Streak, tokens, y películas vistas persisten (localStorage) | 🟡 Media |

---

### 🌐 F-010: WATCH PROVIDERS (Streaming)

| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-051 | Abrir detalles de una película | Observar sección "¿Dónde verla?" | Se listan providers de streaming disponibles en **Argentina (AR)** con logos y nombres | 🔴 Alta |
| TC-052 | Película sin providers en AR | Observar | Mensaje: "No disponible en plataformas locales. Prueba el Botón Mágico." | 🟡 Media |
| TC-053 | Película con ID de IMDB | Click "VER EN STREMIO" | Se intenta abrir deep link: `stremio://detail/movie/{imdb_id}` | 🟡 Media |
| TC-054 | Película con ID de IMDB | Click "IMDb" | Abre nueva pestaña en `https://www.imdb.com/title/{imdb_id}` | 🟡 Media |
| TC-055 | Pantalla Winner | Verificar duración | Se muestra la duración en minutos junto al rating y año | 🟢 Baja |

---

### 📱 F-011: ONBOARDING

| ID | Precondición | Acción | Esperado | Prioridad |
|----|-------------|--------|----------|-----------|
| TC-056 | Primera visita (localStorage vacío) | Abrir app | Modal de onboarding aparece automáticamente. 3 pasos explicativos + tip del algoritmo | 🟡 Media |
| TC-057 | Onboarding abierto | Click "¡Entendido!" | Se cierra y se guarda `movieDealerHasSeenOnboarding: true` en localStorage | 🟡 Media |
| TC-058 | Visita posterior | Abrir app | Onboarding NO aparece automáticamente | 🟡 Media |
| TC-059 | Cualquier momento en IDLE | Click botón de info (ℹ️) en el selector de dificultad | Onboarding se abre manualmente | 🟢 Baja |

---

## 6. PRUEBAS DE EDGE CASES Y STRESS

### ⚡ Edge Cases Críticos

| ID | Escenario | Acción | Esperado | Prioridad |
|----|----------|--------|----------|-----------|
| EC-001 | **Mazo agotado** (muchas partidas seguidas o filtros muy restrictivos) | Jugar varias veces con filtros estrechos | Aparecen Mystery Cards ("JOYA DEL DEALER") como fallback. La app NO debe romper | 🔴 Alta |
| EC-002 | **API Key inválida** | Configurar `.env` con key incorrecta | Error claro: "API Key faltante o inválida." | 🔴 Alta |
| EC-003 | **Sin conexión a internet** | Desactivar red durante `dealing` | Error manejado gracefully, no pantalla en blanco | 🔴 Alta |
| EC-004 | **Filtros extremos** (ej: Western + 1930s + Nivel 6) | Configurar filtros que dan pocos resultados | El sistema usa Graceful Fallback (expande búsqueda, relaja criterios). Se logea en consola: "Graceful Fallback: Expandiendo búsqueda..." | 🔴 Alta |
| EC-005 | **Actor poco conocido** | Buscar persona con <5 películas en TMDB | El fallback elimina el filtro de persona si el pool es <15 películas. Se logea: "Pool pequeño: Eliminando filtro de persona..." | 🟡 Media |
| EC-006 | **Spamear botón "Conservar Selección"** | Click rápido múltiple | Solo debe ejecutarse 1 vez (loading = true deshabilita el botón) | 🔴 Alta |
| EC-007 | **Seleccionar TODAS las cartas** | En Ronda 1, seleccionar 4 de 5 cartas y hacer swap | Solo 1 carta se quema y se reemplaza. Costo: 10 tokens | 🟡 Media |
| EC-008 | **No seleccionar ninguna carta** | Intentar hacer swap sin selección | Botón debe estar **disabled**. No se envía swap | 🔴 Alta |
| EC-009 | **Cambio drástico de filtros entre partidas** | Jugar con Acción, luego con Terror | En consola: "Filtros cambiaron drásticamente: Limpiando historial de sesión." El historial de `seenMovieIds` se limpia | 🟡 Media |
| EC-010 | **Nivel 6 pool agotado** | Jugar 5+ partidas en Nivel 6 | Se inyectan clásicos hardcodeados (Pulp Fiction, 7 Samurai, etc.) con tag "TESORO DE LA CINETECA" | 🟡 Media |

### 📱 Pruebas de Responsive

| ID | Viewport | Verificar |
|----|----------|-----------|
| R-001 | **Mobile (375px)** | Las cartas se muestran en una columna scrolleable. Los botones de acción son touch-friendly (≥44px height). Textos legibles |
| R-002 | **Tablet (768px)** | Layout intermedio. Cartas en grid de 2-3 columnas |
| R-003 | **Desktop (1200px+)** | Frame tipo tablet horizontal. Max-width aplicado. Cartas en horizontal row |

---

## 7. CHECKLIST DE REGRESIÓN

Antes de aprobar la versión, verificar que NO se rompieron las siguientes features existentes:

- [ ] El selector de dificultad (1-6) funciona y el slider responde
- [ ] El botón "Comenzar Juego" lanza el juego con nivel seleccionado
- [ ] El botón "Personalizar Mano" abre el menú de filtros
- [ ] Los filtros de género, década y persona funcionan correctamente
- [ ] Las cartas se reparten con animación staggered
- [ ] El header muestra tokens y streak correctamente
- [ ] Los tokens persisten en localStorage entre sesiones
- [ ] Las películas vistas no se repiten (historial de hasta 500 IDs)
- [ ] La pantalla Winner muestra poster, datos y providers
- [ ] El botón de Trailer abre YouTube correctamente
- [ ] El botón Stremio funciona con deep link
- [ ] El onboarding se muestra solo la primera vez
- [ ] Las animaciones de Framer Motion son fluidas (no laggy)
- [ ] No hay errores en la consola del navegador (warnings son aceptables)
- [ ] El reset del juego limpia todos los estados correctamente

---

## 8. DATOS DE REFERENCIA

### IDs de Géneros TMDB (para verificar en consola)
| ID | Género | ID | Género |
|----|--------|-----|--------|
| 28 | Acción | 80 | Crimen |
| 12 | Aventura | 18 | Drama |
| 16 | Animación | 14 | Fantasía |
| 35 | Comedia | 27 | Terror |
| 878 | Sci-Fi | 53 | Thriller |
| 10749 | Romance | 36 | Historia |
| 9648 | Misterio | 37 | Western |

### Clásicos Hardcodeados (Nivel 6 Fallback)
| TMDB ID | Película |
|---------|----------|
| 680 | Pulp Fiction |
| 1398 | Stalker |
| 346 | Seven Samurai |
| 238 | The Godfather |
| 424 | Schindler's List |
| 15 | Citizen Kane |
| 429 | The Good, the Bad and the Ugly |
| 103 | Taxi Driver |
| 11 | Star Wars |

### localStorage Keys
| Key | Tipo | Descripción |
|-----|------|-------------|
| `movieDealerStreak` | number | Racha de días consecutivos |
| `movieDealerSeen` | number[] | IDs de películas ya vistas (máx 500) |
| `movieDealerTokens` | number | Tokens actuales |
| `movieDealerStats` | object | Estadísticas de géneros ganadores |
| `movieDealerLastPlayed` | string | Último día jugado (date string) |
| `movieDealerHasSeenOnboarding` | string | Si ya vio el onboarding |

---

## 9. CÓMO REPORTAR BUGS

### Template de Reporte

```markdown
### Bug Report

**ID:** BUG-XXX
**Severidad:** 🔴 Crítico / 🟡 Mayor / 🟢 Menor / ⚪ Cosmético
**Feature afectada:** [Feature ID, ej: F-001]
**Test Case:** [TC-XXX, si aplica]

**Entorno:**
- Navegador: Chrome/Firefox/Safari + versión
- Viewport: Mobile (375px) / Tablet / Desktop
- Nivel: [1-6]

**Pasos para reproducir:**
1. ...
2. ...
3. ...

**Resultado esperado:**
...

**Resultado actual:**
...

**Screenshot/Video:**
[Adjuntar captura]

**Console Log:**
[Copiar errores de la consola si los hay]
```

### Severidades
| Nivel | Criterio |
|-------|----------|
| 🔴 **Crítico** | App se rompe, datos se pierden, feature principal no funciona |
| 🟡 **Mayor** | Feature secundaria no funciona, UX degradada significativamente |
| 🟢 **Menor** | Comportamiento inesperado que no impide el uso |
| ⚪ **Cosmético** | Problema visual, typo, alineación, etc. |

---

*Documento generado para facilitar el proceso de QA. Ante cualquier duda sobre el comportamiento esperado, consultar con el equipo de desarrollo.*
