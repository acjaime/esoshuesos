
export interface Animal {
  name: string;
  hint: string;
}

export type AppView = 'landing' | 'game' | 'gameover';

export interface GameState {
  currentIndex: number;
  isRevealed: boolean;
  score: number;
  loading: boolean;
  error: string | null;
  skeletonUrl: string | null;
  animalUrl: string | null;
  timeLeft: number;
}
