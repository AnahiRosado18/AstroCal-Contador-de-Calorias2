export interface Profile {
  id: string;
  name: string;
  passwordHash: string;
  sex?: 'male' | 'female';
  age?: number;
  weightKg?: number;
  heightCm?: number;
  activity?: string;
  tdee?: number;
  createdAt: string;
}

// --- INICIO DE LA MODIFICACIÓN ---

/**
 * Define la estructura de un alimento "Equivalente".
 * Las calorías son fijas por porción, no por 100g.
 */
export interface Food {
  id: string;
  name: string;
  category: string;
  calories: number; // Calorías fijas por porción (ej. 60)
  serving: string;  // Descripción de la porción (ej. "1 pieza", "1/2 taza")
}

/**
 * Define un item en la lista de ingesta del usuario.
 */
export interface IntakeItem {
  foodId: string;
  foodName: string;
  calories: number; // Calorías por 1 porción
  serving: string;  // Descripción de 1 porción
  quantity: number; // Cuántas porciones se han comido
  timestamp: string;
}

// --- FIN DE LA MODIFICACIÓN ---

export interface DayIntake {
  date: string;
  items: IntakeItem[];
  totalCalories: number;
}

export type ActivityLevel = 
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};