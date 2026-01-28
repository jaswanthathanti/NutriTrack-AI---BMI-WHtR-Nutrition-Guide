
export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export enum ExerciseFrequency {
  Rare = '0-1x/week',
  Weekly = '2-3x/week',
  Regular = '4+/week'
}

export enum ActivityLevel {
  Sedentary = 'Sedentary',
  Moderate = 'Moderate',
  Active = 'Active'
}

export enum HealthGoal {
  WeightLoss = 'Weight Loss',
  MuscleGain = 'Muscle Gain',
  Maintenance = 'Maintenance'
}

export enum DietaryPreference {
  Veg = 'Vegetarian',
  NonVeg = 'Non-Vegetarian'
}

export interface UserData {
  height: number | string;
  weight: number | string;
  waist: number | string;
  age: number | string;
  gender: Gender;
  exercise: ExerciseFrequency;
  activity: ActivityLevel;
  goal: HealthGoal;
  favFood: string;
  cuisine: string;
  dietary: DietaryPreference;
}

export interface HealthMetrics {
  bmi: number;
  bmiCategory: string;
  whtr: number;
  whtrCategory: string;
  dailyCalories: number;
  bodyFat: number;
  metabolicAge: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface Recipe {
  name: string;
  mealType: string;
  difficulty: string;
  cuisine: string;
  timeInMins: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  tags: string[];
  explanation: string;
}

export interface MealPlanDay {
  dayName: string;
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  totalCalories: number;
  protein: number;
  fiber: number;
}
