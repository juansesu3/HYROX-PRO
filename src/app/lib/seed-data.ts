// scripts/seed-data.ts
// Este es el bloque de datos que proporcionaste, ahora con referencias de peso completas para todos los bloques.

export const initialBlock = [
  {
    blockNumber: 1,
    weeks: [
      {
        weekNumber: 1,
        sessions: [
          { title: '🏃 Sesión 1: Carrera', focus: 'Adaptación a intervalos.', details: `<li><b>Calentamiento:</b> 10 min trote suave (Ritmo C) + movilidad.</li><li><b>Principal:</b> 5 x 800m (Ritmo A). Descanso: 2'30" trote suave.</li><li><b>Calma:</b> 10 min trote suave (Ritmo C) + estiramientos.</li>` },
          { title: '💪 Sesión 2: Fuerza', focus: 'Construcción de base general.', details: `<li><b>A) Goblet Squat:</b> 4x10 (H: 24kg, M: 16kg)</li><li><b>B) Press Banca/Suelo con mancuernas:</b> 4x10 (H: 2x20kg, M: 2x12kg)</li><li><b>C) Remo Pendlay:</b> 4x10 (H: 50kg, M: 30kg)</li><li><b>D) Zancadas sin peso:</b> 3x20</li><li><b>E) Plancha:</b> 3x45s</li>` },
          { title: '⚙️ Sesión 3: Híbrido', focus: 'Resistencia a la fatiga.', details: `<li><b>Principal:</b> 4 Rondas por tiempo de:</li><li class="ml-4">600m carrera (Ritmo B)</li><li class="ml-4">20 Wall Balls (H: 6kg, M: 4kg)</li><li>Descanso: 90s entre rondas.</li>` }
        ]
      },
      {
        weekNumber: 2,
        sessions: [
          { title: '🏃 Sesión 1: Carrera', focus: 'Progresión de volumen.', details: `<li><b>Calentamiento:</b> 10 min trote suave (Ritmo C) + movilidad.</li><li><b>Principal:</b> 6 x 800m (Ritmo A). Descanso: 2'00" trote suave.</li><li><b>Calma:</b> 10 min trote suave (Ritmo C) + estiramientos.</li>`},
          { title: '💪 Sesión 2: Fuerza', focus: 'Aumento de carga y complejidad.', details: `<li><b>A) Back Squat:</b> 4x8 (H: 60kg, M: 40kg)</li><li><b>B) Press Militar con mancuernas:</b> 4x10 (H: 2x16kg, M: 2x10kg)</li><li><b>C) Dominadas/Jalón al pecho:</b> 4x8-10</li><li><b>D) Zancadas con mancuernas:</b> 3x16 (H: 2x12kg, M: 2x8kg)</li><li><b>E) Elevación de piernas:</b> 3x15</li>`},
          { title: '⚙️ Sesión 3: Híbrido', focus: 'Introducción de ejercicio clave.', details: `<li><b>Principal:</b> 5 Rondas por tiempo de:</li><li class="ml-4">600m carrera (Ritmo B)</li><li class="ml-4">10 Burpee Broad Jumps</li><li>Descanso: 90s entre rondas.</li>`}
        ]
      },
      {
        weekNumber: 3,
        sessions: [
          { title: '🏃 Sesión 1: Carrera', focus: 'Aumento de distancia por intervalo.', details: `<li><b>Calentamiento:</b> 10 min trote suave (Ritmo C) + movilidad.</li><li><b>Principal:</b> 4 x 1000m (Ritmo A/B). Descanso: 3'00" trote suave.</li><li><b>Calma:</b> 10 min trote suave (Ritmo C) + estiramientos.</li>`},
          { title: '💪 Sesión 2: Fuerza', focus: 'Máxima intensidad y ejercicios específicos.', details: `<li><b>A) Peso Muerto Rumano:</b> 4x10 (H: 60kg, M: 40kg)</li><li><b>B) Press Banca con barra:</b> 4x8 (H: 60kg, M: 35kg)</li><li><b>C) Remo con mancuerna:</b> 4x12 (H: 22kg, M: 14kg)</li><li><b>D) Zancadas con Sandbag:</b> 3x20 (H: 20kg, M: 10kg)</li><li><b>E) Paseo del Granjero:</b> 3x40m (H: 2x24kg, M: 2x16kg)</li>`},
          { title: '⚙️ Sesión 3: Híbrido', focus: 'Simulación de competición.', details: `<li><b>Por tiempo:</b></li><li class="ml-4">1000m Carrera, 500m Remo</li><li class="ml-4">800m Carrera, 40 Wall Balls (H: 6kg, M: 4kg)</li><li class="ml-4">600m Carrera, 30 Burpees</li><li class="ml-4">400m Carrera, 20 Zancadas con Sandbag (H: 20kg, M: 10kg)</li>`}
        ]
      },
      {
        weekNumber: 4,
        sessions: [
          { title: '🏃 Sesión 1: Carrera', focus: 'Recuperación activa.', details: `<li><b>Principal:</b> 30 min carrera continua (Ritmo C).</li><li class="ml-4">Incluir 4 x 100m aceleraciones (80%).</li><li><b>Calma:</b> 5 min trote suave + estiramientos.</li>`},
          { title: '💪 Sesión 2: Fuerza', focus: 'Circuito de descarga, sin fatiga.', details: `<li><b>Circuito:</b> 3 Rondas (2 min descanso):</li><li class="ml-4">Goblet Squat (ligero): 12 reps (H: 16kg, M: 8kg)</li><li class="ml-4">Flexiones: 10-15</li><li class="ml-4">Remo Invertido: 12</li><li class="ml-4">Plancha: 60s</li><li class="ml-4">Kettlebell Swing: 15 reps (H: 24kg, M: 16kg)</li>`},
          { title: '⚙️ Sesión 3: Híbrido', focus: 'Técnica de transición (Roxzone).', details: `<li><b>Principal:</b> 5 Rondas de:</li><li class="ml-4">250m Remo (fuerte)</li><li class="ml-4">20m Zancadas con Sandbag (H: 20kg, M: 10kg)</li><li class="ml-4">20m Paseo del Granjero (H: 2x24kg, M: 2x16kg)</li><li><b>Finalizar:</b> 1000m carrera (Ritmo C).</li>`}
        ]
      }
    ]
  },
];
