export type CoachSpecialty = 'individual' | 'doubles' | 'hybrid';

export interface Trainer {
  id: string;
  name: string;
  role: string;
  specialty: CoachSpecialty;
  description: string;
  philosophy: string;
  tags: string[];
  image: string; // Puede ser una URL o un path local
  // Datos para la IA
  aiPromptStyle: string; 
  focusArea: string;
}

export const trainers: Trainer[] = [
  // --- INDIVIDUAL SPECIALISTS ---
  {
    id: 'coach-iron',
    name: 'Marcus "Iron" Vane',
    role: 'Especialista en Fuerza y Potencia',
    specialty: 'individual',
    description: 'Ex-Powerlifter convertido en atleta híbrido. Si tu debilidad es el Sled Push o los Lunges, Marcus es tu elección.',
    philosophy: '"El dolor es temporal, la gloria es para siempre. Vamos a construir un motor blindado."',
    tags: ['Fuerza Bruta', 'Alta Intensidad', 'Volumen'],
    image: '/images/coaches/iron.jpg', // Placeholder
    aiPromptStyle: 'Aggressive, motivational, focused on heavy weights, compromising running pace for strength gains. Short, punchy sentences.',
    focusArea: 'strength',
  },
  {
    id: 'coach-elena',
    name: 'Elena "The Metronome"',
    role: 'Especialista en Pacing y Carrera',
    specialty: 'individual',
    description: 'Maratonista de élite y científica del deporte. Te enseñará a gestionar tu energía para que no te quemes antes de los Wall Balls.',
    philosophy: '"La consistencia vence a la intensidad. Confía en los números."',
    tags: ['Running', 'Estrategia', 'Data-Driven'],
    image: '/images/coaches/elena.jpg',
    aiPromptStyle: 'Analytical, calm, focused on heart rate zones, pacing splits, and efficiency. Detailed explanations.',
    focusArea: 'endurance',
  },

  // --- DOUBLES SPECIALISTS ---
  {
    id: 'coach-duo-sync',
    name: 'The Sync Brothers',
    role: 'Estrategas de Parejas',
    specialty: 'doubles',
    description: 'Expertos en transiciones y comunicación. El secreto de los dobles no es correr más rápido, es descansar mejor mientras tu compañero trabaja.',
    philosophy: '"1+1 = 3. La sincronización lo es todo."',
    tags: ['Transiciones', 'Comunicación', 'Sinergia'],
    image: '/images/coaches/sync.jpg',
    aiPromptStyle: 'Focus on teamwork, communication cues, transition drills, and split strategies (IG YG - I Go You Go).',
    focusArea: 'strategy',
  },
  {
    id: 'coach-titan-twins',
    name: 'Titan Team',
    role: 'Volumen Compartido',
    specialty: 'doubles',
    description: 'Enfocados en maximizar la carga de trabajo. Diseñan planes para que ambos atletas puedan mover grandes pesos sin fatiga excesiva.',
    philosophy: '"Dividir la carga para multiplicar la potencia."',
    tags: ['Carga Pesada', 'Resistencia Muscular', 'Potencia'],
    image: '/images/coaches/titan.jpg',
    aiPromptStyle: 'Focus on heavy intense intervals, shared workload logic, and compromising running for station dominance.',
    focusArea: 'strength',
  },

  // --- HYBRID (Funciona para ambos) ---
  {
    id: 'coach-viper',
    name: 'Viper',
    role: 'Coach Híbrido de Rendimiento',
    specialty: 'hybrid',
    description: 'Un enfoque balanceado. Ni mucha fuerza, ni mucho correr. El equilibrio perfecto para el atleta completo.',
    philosophy: '"Adáptate o muere."',
    tags: ['Balanceado', 'Técnica', 'Mentalidad'],
    image: '/images/coaches/viper.jpg',
    aiPromptStyle: 'Balanced approach, focus on technique across all movements, mental resilience cues.',
    focusArea: 'hybrid',
  },
];