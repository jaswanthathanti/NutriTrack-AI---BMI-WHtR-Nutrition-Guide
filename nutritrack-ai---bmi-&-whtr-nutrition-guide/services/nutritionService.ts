
import { GoogleGenAI, Type } from "@google/genai";
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
  const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_API_KEY as string });
  
  const prompt = `
    Act as a professional clinical nutritionist. Provide personalized recipe recommendations and a 7-day meal plan based on the user's health metrics and food preferences.
    
    User Context:
    - Profile: ${userData.age}yo ${userData.gender}, ${userData.activity} activity level.
    - Goal: ${userData.goal}
    - Dietary: ${userData.dietary}, Cuisine: ${userData.cuisine}
    - PREFERRED FOODS: "${userData.favFood || 'None specified'}"
    - Health Metrics: BMI ${metrics.bmi.toFixed(1)} (${metrics.bmiCategory}), WHtR ${metrics.whtr.toFixed(2)} (${metrics.whtrCategory})
    - Targets: ${metrics.dailyCalories} kcal, ${metrics.macros.protein}g Protein, ${metrics.macros.carbs}g Carbs, ${metrics.macros.fat}g Fat.

    INSTRUCTIONS:
    1. Generate 4 "Signature Recipes" that strictly incorporate the user's PREFERRED FOODS in a healthy way.
    2. Generate 4 "Quick & Balanced" recipes that take under 30 minutes.
    3. Generate a 7-day meal plan (Monday-Sunday).
    4. For EVERY recipe, provide a detailed "explanation" field describing WHY it's good for their specific BMI/WHtR profile and how it uses their favorite food.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestForYou: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                mealType: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                cuisine: { type: Type.STRING },
                timeInMins: { type: Type.NUMBER },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                explanation: { type: Type.STRING }
              },
              required: ["name", "mealType", "difficulty", "cuisine", "timeInMins", "calories", "protein", "fat", "carbs", "fiber", "tags", "explanation"]
            }
          },
          readyIn30: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                mealType: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                cuisine: { type: Type.STRING },
                timeInMins: { type: Type.NUMBER },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                explanation: { type: Type.STRING }
              },
              required: ["name", "mealType", "difficulty", "cuisine", "timeInMins", "calories", "protein", "fat", "carbs", "fiber", "tags", "explanation"]
            }
          },
          weeklyPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayName: { type: Type.STRING },
                breakfast: { type: Type.STRING },
                lunch: { type: Type.STRING },
                snack: { type: Type.STRING },
                dinner: { type: Type.STRING },
                totalCalories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER }
              },
              required: ["dayName", "breakfast", "lunch", "snack", "dinner", "totalCalories", "protein", "fiber"]
            }
          }
        },
        required: ["bestForYou", "readyIn30", "weeklyPlan"]
      }
    }
  });

  return JSON.parse(response.text);
};
