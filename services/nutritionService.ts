import { GoogleGenAI, Type } from "@google/genai";
import { UserData, HealthMetrics } from "../types";
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

  const activityMultipliers = { Sedentary: 1.2, Moderate: 1.55, Active: 1.8 };
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
    macros: { protein, carbs, fat, fiber },
  };
};

export const getAIRecommendations = async (userData: UserData, metrics: HealthMetrics) => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not found.");

  const ai = new GoogleGenAI({ apiKey });

  const medicalGuidance = (userData.medicalConditions || [])
    .filter(c => c !== 'None')
    .map(condition => {
      switch (condition) {
        case 'Diabetic':
          return 'DIABETIC: Prioritize low-GI foods (GI < 55), complex carbohydrates, high fiber (25-35g/day), lean protein. Avoid refined sugars, white rice, white bread. Include: legumes, non-starchy vegetables, whole grains, nuts.';
        case 'Obesity/Overweight':
          return 'OBESITY/OVERWEIGHT: Focus on caloric deficit with high protein satiety foods, high-volume low-calorie meals (vegetables, soups, salads), lean proteins, minimal saturated fat. Avoid liquid calories, fried foods.';
        case 'Hypothyroidism':
          return 'HYPOTHYROIDISM: Include iodine-rich foods (seaweed, iodized salt, fish), selenium-rich foods (Brazil nuts, eggs, sunflower seeds). Avoid raw cruciferous vegetables. Prefer cooked vegetables.';
        case 'Metabolic Syndrome':
          return 'METABOLIC SYNDROME: Anti-inflammatory diet — omega-3 rich foods, colorful vegetables, whole grains. Heart-healthy fats (olive oil, avocado, nuts). Minimal added sugar (<25g/day).';
        default: return '';
      }
    })
    .filter(Boolean)
    .join('\n');

  const conditionsText = (userData.medicalConditions || []).filter(c => c !== 'None').join(', ') || 'None';

  const prompt = `
    Act as a professional clinical nutritionist. Provide personalized recipe recommendations and a 7-day meal plan based on the user's health metrics, food preferences, and medical conditions.
    
    User Context:
    - Profile: ${userData.age}yo ${userData.gender}, ${userData.activity} activity level.
    - Goal: ${userData.goal}
    - Dietary: ${userData.dietary}, Cuisine: ${userData.cuisine}
    - PREFERRED FOODS: "${userData.favFood || 'None specified'}"
    - Health Metrics: BMI ${metrics.bmi.toFixed(1)} (${metrics.bmiCategory}), WHtR ${metrics.whtr.toFixed(2)} (${metrics.whtrCategory})
    - Targets: ${metrics.dailyCalories} kcal, ${metrics.macros.protein}g Protein, ${metrics.macros.carbs}g Carbs, ${metrics.macros.fat}g Fat.
    - Medical Conditions: ${conditionsText}

    ${medicalGuidance ? `CRITICAL MEDICAL DIETARY GUIDELINES (MUST FOLLOW):\n${medicalGuidance}` : ''}

    INSTRUCTIONS:
    1. Generate 4 "Signature Recipes" strictly incorporating the user's PREFERRED FOODS, adhering to all medical guidelines.
    2. Generate 4 "Quick & Balanced" recipes that take under 30 minutes, following medical guidelines.
    3. Generate a 7-day meal plan (Monday-Sunday).
    4. For EVERY recipe, provide:
       - "explanation": WHY it's good for their BMI/WHtR and conditions.
       - "ingredients": array with exact quantities (e.g., "200g chicken breast").
       - "steps": array with 4-6 clear preparation steps.
  `;

  const recipeItemSchema = {
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
      explanation: { type: Type.STRING },
      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
      steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["name", "mealType", "difficulty", "cuisine", "timeInMins", "calories", "protein", "fat", "carbs", "fiber", "tags", "explanation", "ingredients", "steps"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bestForYou: { type: Type.ARRAY, items: recipeItemSchema },
          readyIn30: { type: Type.ARRAY, items: recipeItemSchema },
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
                fiber: { type: Type.NUMBER },
              },
              required: ["dayName", "breakfast", "lunch", "snack", "dinner", "totalCalories", "protein", "fiber"]
            }
          }
        },
        required: ["bestForYou", "readyIn30", "weeklyPlan"]
      }
    }
  });

  const text = response.text;
  return JSON.parse(text);
};