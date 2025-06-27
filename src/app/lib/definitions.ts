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