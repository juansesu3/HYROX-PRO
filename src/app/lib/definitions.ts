export type Session = {
  title: string;
  focus: string;
  details: string;
};

export type WeekPlan = {
  weekNumber: number;
  sessions: Session[];
};

export type TrainingBlock = {
  blockNumber: number;
  weeks: WeekPlan[];
};

// ✅ Esto es lo que te falta (para tu estructura 1..4: Session[])
export type WeekData = Record<number, Session[]>;
