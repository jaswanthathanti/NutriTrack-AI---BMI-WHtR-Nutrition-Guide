<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NutriTrack AI - BMI & WHtR Nutrition Guide

This project, "NutriTrack AI", is an AI-powered application designed to assist users with BMI (Body Mass Index) and WHtR (Waist-to-Height Ratio) calculations, offering personalized nutrition guidance. It leverages the Gemini API to provide intelligent recommendations.

## Problem Statement

In an age of information overload, navigating the world of health and nutrition can be confusing and overwhelming. Many people struggle to find reliable, personalized, and actionable advice that goes beyond generic guidelines. While metrics like BMI are widely used, they don't always provide a complete health picture on their own. Access to professional nutritionists is often costly and time-consuming, leaving a gap for accessible tools that can guide individuals toward healthier lifestyles.

## Our Solution

NutriTrack AI addresses this problem by serving as a personal AI-powered nutrition assistant. It provides users with a simple yet effective platform to:

- **Quickly Assess Health:** By calculating both BMI and Waist-to-Height Ratio (WHtR), the app offers a more nuanced view of an individual's health status.
- **Receive Instant, Personalized Guidance:** Leveraging the power of the Gemini API, the application delivers tailored nutrition and lifestyle advice based on the user's specific metrics and goals.
- **Empower Healthier Choices:** By demystifying complex health data and providing clear, AI-driven recommendations, NutriTrack AI empowers users to take control of their health and make informed decisions with confidence.

This project is useful because it makes personalized health guidance accessible to everyone, helping bridge the gap between complex health metrics and practical, everyday actions.

## Features

- **BMI Calculation:** Calculate your Body Mass Index to assess weight status.
- **WHtR Calculation:** Determine your Waist-to-Height Ratio for a better understanding of central obesity.
- **Personalized Nutrition Guidance:** Receive AI-driven dietary and lifestyle recommendations based on your health metrics.
- **Interactive Health Charts:** Visualize your health data and progress.

## Run Locally

**Prerequisites:**

- Node.js (LTS version recommended)
- npm (comes with Node.js)

### 1. Clone the repository

```bash
git clone <repository-url>
cd nutritrack-ai---bmi-&-whtr-nutrition-guide
```

_(Note: Replace `<repository-url>` with the actual URL of your repository)_

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your Gemini API Key

This project requires a Gemini API Key to function.

1.  Obtain your Gemini API key from [Google AI Studio](https://ai.google.dev/).
2.  Create a file named `.env` in the root directory of the project.
3.  Add your API key to the `.env` file in the following format:

    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```

    _(Replace `YOUR_GEMINI_API_KEY` with your actual API key.)_

### 4. Run the application

#### Development Mode

To run the application in development mode (with hot-reloading):

```bash
npm run dev
```

The application will typically be accessible at `http://localhost:3000`.

#### Production Build

To create a production-optimized build:

```bash
npm run build
```

After building, you can preview the production build locally:

```bash
npm run preview
```

The preview will usually be available at `http://localhost:4173` (or another available port).

## Project Structure

- `src/`: Contains the main source code for the React application.
- `components/`: Reusable React components.
- `services/`: Services for interacting with APIs (e.g., nutritionService.ts).
- `public/`: Static assets.
- `.env`: Environment variables (e.g., API keys).
- `vite.config.ts`: Vite configuration file.

---

This README has been updated to provide a more detailed overview and instructions for the NutriTrack AI project.
