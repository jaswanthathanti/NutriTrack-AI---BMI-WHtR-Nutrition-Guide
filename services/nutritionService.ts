import { UserData, HealthMetrics, Recipe, MealPlanDay } from "../types";
import { BMI_CATEGORIES, WHTR_CATEGORIES } from "../constants";

export const calculateMetrics = (data: UserData): HealthMetrics => {
  const weight = Number(data.weight) || 0;
  const height = Number(data.height) || 1; 
  const waist = Number(data.waist) || 0;
  const age = Number(data.age) || 0;

  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const whtr = waist / height;

  let bmiCategory = BMI_CATEGORIES.find(c => bmi < c.max)?.label || 'Obese';
  let whtrCategory = WHTR_CATEGORIES.find(c => whtr < c.max)?.label || 'High';

  const bodyFat = data.gender === 'Male' 
    ? (1.20 * bmi) + (0.23 * age) - 16.2 
    : (1.20 * bmi) + (0.23 * age) - 5.4;

  let metabolicAge = age;
  if (data.activity === 'Sedentary') metabolicAge += 3;
  if (data.activity === 'Active') metabolicAge -= 2;
  if (bmi > 25) metabolicAge += 2;

  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = data.gender === 'Male' ? bmr + 5 : bmr - 161;

  const activityMultipliers = {
    Sedentary: 1.2,
    Moderate: 1.55,
    Active: 1.8
  };
  
  let tdee = bmr * activityMultipliers[data.activity as keyof typeof activityMultipliers];

  if (data.goal === 'Weight Loss') tdee -= 500;
  if (data.goal === 'Muscle Gain') tdee += 300;

  const calories = Math.round(tdee);
  const protein = Math.round((calories * 0.25) / 4);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories * 0.50) / 4);
  const fiber = Math.round((calories / 1000) * 14);

  return {
    bmi,
    bmiCategory,
    whtr,
    whtrCategory,
    dailyCalories: calories,
    bodyFat: Math.max(5, Math.round(bodyFat)),
    metabolicAge: Math.round(metabolicAge),
    macros: { protein, carbs, fat, fiber }
  };
};

export const getAIRecommendations = async (userData: UserData, metrics: HealthMetrics) => {
  const response = await fetch('/.netlify/functions/nutrition', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userData, metrics }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch AI recommendations');
  }

  return response.json();
};