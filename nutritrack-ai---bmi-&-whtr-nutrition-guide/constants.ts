
import { UserData, Gender, ExerciseFrequency, ActivityLevel, HealthGoal, DietaryPreference } from './types';

export const STEPS = [
  'Health Info',
  'Lifestyle',
  'Preferences',
  'Dashboard'
];

export const CUISINES = ['Indian', 'South Indian', 'Vegetarian', 'Regional', 'Continental', 'Mediterranean'];

export const DEFAULT_USER_DATA: UserData = {
  height: 170,
  weight: 70,
  waist: 85,
  age: 25,
  gender: Gender.Male,
  exercise: ExerciseFrequency.Weekly,
  activity: ActivityLevel.Moderate,
  goal: HealthGoal.Maintenance,
  favFood: '',
  cuisine: 'Indian',
  dietary: DietaryPreference.Veg,
};

export const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: 'Underweight', color: 'bg-blue-500', text: 'text-blue-600' },
  { min: 18.5, max: 25, label: 'Normal', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { min: 25, max: 30, label: 'Overweight', color: 'bg-yellow-500', text: 'text-yellow-600' },
  { min: 30, max: Infinity, label: 'Obese', color: 'bg-red-500', text: 'text-red-600' }
];

export const WHTR_CATEGORIES = [
  { min: 0, max: 0.42, label: 'Low', color: 'bg-blue-500', text: 'text-blue-600' },
  { min: 0.42, max: 0.52, label: 'Moderate', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { min: 0.52, max: Infinity, label: 'High', color: 'bg-red-500', text: 'text-red-600' }
];
