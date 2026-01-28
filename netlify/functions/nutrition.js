const { GoogleGenAI, Type } = require("@google/genai");

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userData, metrics } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    return {
      statusCode: 200,
      body: response.text,
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
