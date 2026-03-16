const { GoogleGenAI, Type } = require("@google/genai");

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { userData, metrics } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const medicalGuidance = (userData.medicalConditions || [])
      .filter(c => c !== 'None')
      .map(condition => {
        switch (condition) {
          case 'Diabetic':
            return 'DIABETIC: Prioritize low-GI foods (GI < 55), complex carbohydrates, high fiber (25-35g/day), lean protein. Avoid refined sugars, white rice, white bread. Include: legumes, non-starchy vegetables, whole grains, nuts.';
          case 'Obesity/Overweight':
            return 'OBESITY/OVERWEIGHT: Focus on caloric deficit with high protein satiety foods, high-volume low-calorie meals (vegetables, soups, salads), lean proteins, minimal saturated fat. Avoid liquid calories, fried foods.';
          case 'Hypothyroidism':
            return 'HYPOTHYROIDISM: Include iodine-rich foods (seaweed, iodized salt, fish), selenium-rich foods (Brazil nuts, eggs, sunflower seeds). Avoid raw cruciferous vegetables (cauliflower, broccoli, cabbage) as they can interfere with thyroid. Prefer cooked vegetables.';
          case 'Metabolic Syndrome':
            return 'METABOLIC SYNDROME: Anti-inflammatory diet — omega-3 rich foods, colorful vegetables, whole grains. Heart-healthy fats (olive oil, avocado, nuts). Minimal added sugar (<25g/day), minimal processed foods. Include: berries, fatty fish, leafy greens.';
          default:
            return '';
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
      1. Generate 4 "Signature Recipes" that strictly incorporate the user's PREFERRED FOODS in a healthy way, adhering to all medical guidelines above.
      2. Generate 4 "Quick & Balanced" recipes that take under 30 minutes, also following medical guidelines.
      3. Generate a 7-day meal plan (Monday-Sunday).
      4. For EVERY recipe, provide:
         - A detailed "explanation" field describing WHY it's good for their specific BMI/WHtR profile, how it uses their favorite food, and how it supports their medical conditions.
         - An "ingredients" array with exact quantities (e.g., "200g chicken breast", "1 cup spinach").
         - A "steps" array with 4-6 clear, numbered preparation steps.
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
      model: 'gemini-2.5-flash-preview-04-17',
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
      headers: { 'Content-Type': 'application/json' },
      body: response.text,
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
