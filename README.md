# PhotoRecipe 🍳

PhotoRecipe is a smart recipe generator that turns photos of your ingredients into delicious meal ideas. Snap a picture, let our AI chef analyze what you have, and get a complete recipe in seconds!

![PhotoRecipe Screenshot](https://placehold.co/800x450.png?text=PhotoRecipe+App)
_This is a placeholder image. Replace with a screenshot of your app._

## ✨ Key Features

- **📷 Photo-to-Ingredients:** Upload a photo of your ingredients, and our AI will identify them for you.
- **🤖 Smart Suggestions:** Get intelligent suggestions for missing ingredients to complement what you already have.
- **📖 Instant Recipes:** Generate complete recipes with a name, ingredient list, and step-by-step instructions.
- **✍️ Editable Content:** Easily edit the recipe name, ingredients, and instructions to customize your meal.
- **📄 PDF Export:** Save your favorite recipes as beautifully formatted PDF files to use offline.
- **🎨 Light & Dark Mode:** A comfortable viewing experience in any lighting condition.
- **⬆️ Drag & Drop Upload:** A seamless and intuitive file upload experience.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **AI Integration:** [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)
- **Deployment:** Firebase App Hosting

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install NPM packages:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of your project and add your Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run genkit:dev`: Starts the Genkit development server.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the project files.

---

This project was bootstrapped with [Firebase Studio](https://firebase.google.com/docs/studio).
