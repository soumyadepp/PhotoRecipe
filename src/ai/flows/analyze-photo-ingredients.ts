"use server";

/**
 * @fileOverview A flow for analyzing ingredients from a photo and suggesting missing ones.
 *
 * - analyzePhotoIngredients - A function that handles the ingredient analysis process.
 * - AnalyzePhotoIngredientsInput - The input type for the analyzePhotoIngredients function.
 * - AnalyzePhotoIngredientsOutput - The return type for the analyzePhotoIngredients function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const AnalyzePhotoIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePhotoIngredientsInput = z.infer<
  typeof AnalyzePhotoIngredientsInputSchema
>;

const AnalyzePhotoIngredientsOutputSchema = z.object({
  isFoodItem: z.boolean().describe("Whether the photo contains food items."),
  ingredients: z
    .array(z.string())
    .describe(
      "A list of identified ingredients. This should be empty if isFoodItem is false."
    ),
  suggestedIngredients: z
    .array(z.string())
    .describe(
      "A list of suggested ingredients that might be missing. This should be empty if isFoodItem is false."
    ),
});
export type AnalyzePhotoIngredientsOutput = z.infer<
  typeof AnalyzePhotoIngredientsOutputSchema
>;

export async function analyzePhotoIngredients(
  input: AnalyzePhotoIngredientsInput
): Promise<AnalyzePhotoIngredientsOutput> {
  return analyzePhotoIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: "analyzePhotoIngredientsPrompt",
  input: { schema: AnalyzePhotoIngredientsInputSchema },
  output: { schema: AnalyzePhotoIngredientsOutputSchema },
  prompt: `You are an AI that analyzes a photo of ingredients and identifies them. First, determine if the image contains food items. If it does not, set isFoodItem to false and return empty arrays for ingredients and suggestedIngredients.

If the image does contain food, identify the ingredients, set isFoodItem to true, and suggest any missing ingredients that would complement the identified ones.

Analyze the ingredients in the following photo:

Photo: {{media url=photoDataUri}}

Format your answer as a JSON object with "isFoodItem", "ingredients" and "suggestedIngredients" keys.`,
});

const analyzePhotoIngredientsFlow = ai.defineFlow(
  {
    name: "analyzePhotoIngredientsFlow",
    inputSchema: AnalyzePhotoIngredientsInputSchema,
    outputSchema: AnalyzePhotoIngredientsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
