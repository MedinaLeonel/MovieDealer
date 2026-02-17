# 🎴 MovieDealer — Guía de Testing QA (v0.6.1 "Discovery & Stability")

**Fecha de emisión:** 17 de febrero de 2026  
**Versión bajo prueba:** v0.6.1  
**Entorno de desarrollo:** `http://localhost:5173`  
**Responsable del documento:** Equipo de Desarrollo

---

## 📋 ÍNDICE

1. [Resumen de Cambios v0.6.1](#1-resumen-de-cambios-v061)
2. [Flujo "Deep Discovery"](#2-flujo-deep-discovery)
3. [Casos de Prueba: Estabilidad y Algoritmo](#3-casos-de-prueba-estabilidad-y-algoritmo)
4. [Casos de Prueba: UI/UX Mobile](#4-casos-de-prueba-uiux-mobile)
5. [Edge Cases y Datos de Referencia](#5-edge-cases-y-datos-de-referencia)

---

## 1. RESUMEN DE CAMBIOS v0.6.1

### 🚀 ALGORITMO: Person Filter Priority
Se ha implementado una lógica de bypass. Si el usuario selecciona un Actor/Director, el sistema **ignora** las restricciones de votos/popularidad del nivel de dificultad para permitir encontrar su filmografía completa.

### 🌊 EXPLORACIÓN: Deep Discovery
- Pool inicial de **200 películas** (10 páginas paralelas).
- **6 rondas** de refinamiento.
- **300 tokens** iniciales.

### 🛠️ ESTABILIDAD: Fixes Críticos
- **Position Fixed:** Modales movidos a la raíz para evitar que se corten al scrollear en mobile.
- **Data Integrity:** Todos los objetos Movie ahora tienen propiedades obligatorias (release_date, etc.) para evitar fallos de renderizado.
- **CSS Sync:** Filtros de personalización con estilos y clases corregidas.

---

## 2. FLUJO "DEEP DISCOVERY"

### Test Case DD-001: Partida de Exploración Profunda
1. Iniciar con Nivel 1.
2. Personalizar: Elegir un género y un actor (ej: Cillian Murphy).
3. **Esperado:** El pool debe traer ~200 películas. La mano debe priorizar películas del actor, incluso si no son blockbusters de 8k votos.
4. Jugar las 6 rondas. Verificar que el indicador de ronda avanza del 1 al 6.

---

## 3. CASOS DE PRUEBA: ESTABILIDAD Y ALGORITMO

### 🎯 F-001: Prioridad de Persona (CRÍTICO)
| ID | Acción | Resultado Esperado | Prioridad |
|----|--------|-------------------|-----------|
| TC-060 | Seleccionar Nivel 1 y actor "poco comercial" | La mano debe mostrar películas del actor. No debe fallar ni mostrar "Misterio" si el actor tiene filmografía disponible. | 🔴 Alta |
| TC-061 | Combinar Actor + Década | El sistema debe filtrar por ambos. Si el pool es <10, debe relajar primero la década antes que al actor. | 🟡 Media |

### 🛠️ F-002: Integridad de Datos (Netlify Sync)
| ID | Acción | Resultado Esperado | Prioridad |
|----|--------|-------------------|-----------|
| TC-062 | Ver detalles de una Mystery Card | Debe abrirse sin crashear. Los campos como "Año" deben mostrar "N/A" o el valor por defecto en lugar de romper el render. | 🔴 Alta |
| TC-063 | Simular error de API (Modo Offline) | Los fallbacks locales deben tener todas las props requeridas por el tipo `Movie`. | 🔴 Alta |

---

## 4. CASOS DE PRUEBA: UI/UX MOBILE

### 📱 F-003: Posicionamiento de Modales
| ID | Acción | Resultado Esperado | Prioridad |
|----|--------|-------------------|-----------|
| TC-064 | Abrir StreamingModal y scrollear fondo | El modal debe permanecer fijo en el centro/totalidad del viewport. No debe "irse hacia arriba" con el contenido. | 🔴 Alta |
| TC-065 | Abrir Onboarding en pantalla pequeña | El modal debe ser totalmente visible y el botón "¡Entendido!" debe ser accesible sin scroll infinito. | 🔴 Alta |

### 🎨 F-004: Pantalla de Filtros
| ID | Acción | Resultado Esperado | Prioridad |
|----|--------|-------------------|-----------|
| TC-066 | Click en chips de Género | Deben iluminarse con el color primario inmediatamente. | 🟡 Media |
| TC-067 | Búsqueda de Persona | El dropdown de resultados debe aparecer **encima** de otros elementos y ser clickeable. | 🔴 Alta |

---

## 5. EDGE CASES Y DATOS DE REFERENCIA

### EC-011: El "Debugger" de VidKing
**Escenario:** El reproductor se pausa solo o abre la consola.
**Explicación:** Es un script anti-desarrollador del proveedor externo.
**Test:** Cerrar consola y verificar que el video fluye. No es un bug de MovieDealer.

### Historial de Limpieza
Si cambias de actor en medio de una sesión, el historial se limpia automáticamente para no mezclar recomendaciones del actor anterior.
**Verificación:** Consola log: `"Filtros cambiaron drásticamente: Limpiando historial..."`

---
*Fin del documento v0.6.1*
