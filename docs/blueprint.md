# **PhotoRecipe – Production App Blueprint**

## 1. Product Overview

PhotoRecipe is a mobile and web application that lets users upload food photos, automatically identifies ingredients using AI vision, and instantly generates recipes tailored to the detected items. Users can personalize, save, and share these recipes.

---

## 2. Core Features

### Image Analysis (Computer Vision)

- **Input:** User uploads an image (file upload or URL).
- **Processing:** Use a vision API (Google Cloud Vision via Gemini) to extract food items.
- **Fallback:** If confidence score is low, prompt user with suggestions or manual ingredient selection.
- **Output:** A structured list of ingredients (with confidence levels).

### Recipe Generation (LLM-Powered)

- **Input:** Ingredient list from vision step.
- **Processing:** Use an LLM (gemini-2.0-flash) to generate recipes.
- **Constraints:** Ensure ingredient quantities and cooking steps are realistic.
- **Output:** A recipe object containing:
  - Title
  - Ingredients with measurements
  - Step-by-step instructions
  - Estimated cooking time and servings

### Recipe Display (UI/UX)

- **Layout:** Card-based interface for easy scanning.
- **Icons:** Use Carbon Icons to visually represent ingredients and steps.
- **Typography:** _Poppins_ font for both headlines and body text for modern readability.
- **Modes:** Support both Light and Dark themes (defined below).

### Recipe Adjustment & Personalization

- Allow users to:
  - Add/remove ingredients
  - Edit cooking steps
  - Adjust serving size
  - Save custom versions locally or in the cloud

### Data Import

- **Image Upload:** From device storage (mobile/web).
- **Image URL:** Paste any direct link to food images.

---

## 3. Architecture

### Frontend

- **Framework:** React (Web) + React Native (Mobile)
- **State Management:** Redux Toolkit or Zustand
- **UI Library:** shadcn/ui + Tailwind (or custom if not using Tailwind)
- **Image Preview:** Lazy loading and compression before upload

### Backend

- **API Gateway:** REST or GraphQL (FastAPI / Node.js + Express / NestJS)
- **Vision Model:** Google Cloud Vision API via Gemini
- **LLM Integration:** OpenAI API (GPT-4o mini or GPT-4 Turbo) for recipe generation
- **Data Storage:**
  - User data, saved recipes → Firestore / DynamoDB / Postgres
  - Media → Cloud storage (S3 / Firebase Storage)

### Authentication

- Social logins (Google, Apple) or email/password using Firebase Auth or Auth0.

### Deployment

- Web → Vercel
- Backend → GCP Cloud Run (Future)
- Mobile → App Store + Play Store (using Expo or native builds) (Future)

---

## 4. Design System / Theming

### Light Theme

- Primary: Vibrant Coral (#FF7F50)
- Secondary: Fresh Mint (#98FF98)
- Accent: Sunny Yellow (#FFFF66)
- Neutral: Light Gray (#D3D3D3)
- Background: White (#FFFFFF)

### Dark Theme

- Primary: Dark Slate Gray (#2F4F4F)
- Secondary: Teal (#008080)
- Accent: Gold (#FFD700)
- Neutral: Dim Gray (#696969)
- Background: Black (#000000)

---

## 5. Roadmap

### MVP (2–3 months)

- Image upload + Vision API integration
- LLM recipe generation
- Editable ingredient list and steps
- Light theme only

### V1 Release (4–6 months)

- Dark mode support
- Social login + cloud sync
- Save/share recipes
- Basic analytics (recipe popularity, engagement)

### V2 (6–12 months)

- Multi-language support
- Meal plan recommendations
- Offline mode
- Subscription model (premium recipes, unlimited generations)

---

## 6. Performance & Security

- Compress images before upload to reduce latency.
- Use HTTPS everywhere.
- Rate-limit AI generation to prevent abuse.
- Secure API keys via server (never expose them in frontend).
- GDPR compliance for user data (allow data export/deletion).

---

## 7. Team & Tools

- **Design:** Figma for prototyping UI
- **Dev:** GitHub / GitLab CI for code pipelines
- **Project Mgmt:** Jira / Linear for sprint tracking
- **Monitoring:** Sentry (frontend), CloudWatch or GCP Logging (backend)
