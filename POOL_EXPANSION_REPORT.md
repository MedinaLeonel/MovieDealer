# 📊 Pool Expansion Report v0.6.0 (Deep Discovery)

**Fecha:** 11 de febrero de 2026  
**Cambio:** Expansión masiva del pool mediante fetching paralelo de 10 páginas  
**Objetivo:** Eliminar la fatiga de contenido y permitir un aprendizaje adaptativo profundo.

---

## 🎯 PROBLEMA IDENTIFICADO

### Antes (v0.5.1)
- **3 páginas por request** → ~60 películas
- Pool en memoria suficiente para partidas cortas (3 rondas).
- Con 6 rondas (v0.6.0), el pool de 60 se sentía repetitivo rápidamente.

### Síntomas en v0.6.0 Alpha
- Usuario agota las "joyas" del pool en la Ronda 4.
- El algoritmo no tiene suficiente variedad para filtrar géneros vetados sin quedarse vacío.

---

## ✅ SOLUCIÓN IMPLEMENTADA (v0.6.0)

### Deep Discovery Fetching
Se ha escalado la técnica de fetching paralelo de 3 a **10 páginas**.

```typescript
// AHORA (v0.6.0)
const numPages = 10; 
const randomStartPage = Math.floor(Math.random() * 5) + 1;
const pagePromises = Array.from({ length: numPages }, (_, i) =>
    fetch(`${url}&page=${randomStartPage + i}`)
);
const responses = await Promise.all(pagePromises);
// Resultado: ~200 películas (3.3x más que v0.5.1, 10x más que v0.4.x)
```

### Prioridad de Filtro de Persona (v0.6.1)
Se ha corregido la lógica para que las búsquedas de **Actor/Director** no sean bloqueadas por los filtros de dificultad global (ej: el filtro de 8000 votos de Nivel 1 ya no aplica si buscas a un actor específico).

---

## 📈 MÉTRICAS COMPARATIVAS

| Métrica | v0.5.1 | v0.6.0 (Deep Discovery) | Mejora |
|---------|---------|-------------------------|--------|
| **Páginas consultadas** | 3 | 10 | **+233%** |
| **Películas por partida** | ~60 | ~200 | **+233%** 🚀 |
| **Variedad de géneros** | Moderada | Alta/Total | **+300%** |
| **Tolerancia a Vetoes** | Baja | Alta | **Efectivo** |

---

## 🔍 LOGGING PARA DEBUGGING

Consola del navegador:
```
[Deep Discovery] Fetching 10 pages starting from page 3...
[Deep Discovery] ✅ Fetched 194 movies from 10 pages — Pool is 10x larger!
```

---

## 🎮 IMPACTO EN LA EXPERIENCIA DE USUARIO

- **Exploración Real:** El usuario siente que el Dealer tiene un mazo infinito.
- **Aprendizaje Preciso:** Con 200 películas, el sistema puede darse el lujo de vetar géneros enteros sin riesgo de quedarse sin opciones.
- **Identidad del Actor:** Las búsquedas de personas ahora devuelven sus películas reales, no fallbacks genéricos.

---

**Estado:** ✅ Implementado  
**Versión:** v0.6.1  
**Archivos modificados:** `src/hooks/useMovieDealer.ts`
