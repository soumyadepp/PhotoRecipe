"use client";

import { useState } from "react";
import Image from "next/image";
import {
  analyzePhotoIngredients,
  AnalyzePhotoIngredientsOutput,
} from "@/ai/flows/analyze-photo-ingredients";
import {
  generateRecipeFromIngredients,
  GenerateRecipeFromIngredientsOutput,
} from "@/ai/flows/generate-recipe-from-ingredients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ChefHat,
  Loader2,
  Trash2,
  UploadCloud,
  Link as LinkIcon,
  PlusCircle,
  Wand2,
  Sprout,
  X,
  FileDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ThemeToggle } from "@/components/theme-toggle";

type Stage =
  | "upload"
  | "analyzing"
  | "editing-ingredients"
  | "generating-recipe"
  | "displaying-recipe";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [error, setError] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>("");
  const [suggestedIngredients, setSuggestedIngredients] = useState<string[]>(
    []
  );
  const [recipe, setRecipe] =
    useState<GenerateRecipeFromIngredientsOutput | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setPhotoDataUri(dataUri);
      handleAnalyze(dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlLoad = async () => {
    if (!imageUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an image URL.",
      });
      return;
    }

    try {
      new URL(imageUrl);
    } catch (_) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid URL.",
      });
      return;
    }

    toast({
      title: "Info",
      description:
        "Loading image from URL. Note: Direct analysis from URL may be restricted by browser security policies (CORS).",
    });
    setPhotoDataUri(imageUrl);
    handleAnalyze(imageUrl);
  };

  const handleAnalyze = async (dataUri: string) => {
    setStage("analyzing");
    setError(null);
    try {
      const result: AnalyzePhotoIngredientsOutput =
        await analyzePhotoIngredients({ photoDataUri: dataUri });
      if (!result.isFoodItem) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description:
            "The uploaded image does not appear to contain food items. Please try another photo.",
        });
        setStage("upload");
        setPhotoDataUri(null);
        return;
      }
      setIngredients(result.ingredients || []);
      setSuggestedIngredients(result.suggestedIngredients || []);
      setStage("editing-ingredients");
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
      setStage("upload");
    }
  };

  const handleGenerateRecipe = async () => {
    setStage("generating-recipe");
    setError(null);
    try {
      const result = await generateRecipeFromIngredients({ ingredients });
      setRecipe(result);
      setStage("displaying-recipe");
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Recipe Generation Failed",
        description: errorMessage,
      });
      setStage("editing-ingredients");
    }
  };

  const addSuggestionToIngredients = (suggestion: string) => {
    if (!ingredients.includes(suggestion)) {
      setIngredients([...ingredients, suggestion]);
    }
    setSuggestedIngredients(
      suggestedIngredients.filter((s) => s !== suggestion)
    );
  };

  const removeIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredientToRemove));
  };

  const handleAddIngredient = () => {
    if (newIngredient && !ingredients.includes(newIngredient)) {
      setIngredients([...ingredients, newIngredient]);
      setNewIngredient("");
    }
  };

  const handleRecipeChange = (
    field: keyof GenerateRecipeFromIngredientsOutput,
    value: string | string[]
  ) => {
    if (recipe) {
      setRecipe({ ...recipe, [field]: value });
    }
  };

  const handleStepChange = (index: number, value: string) => {
    if (recipe) {
      const newSteps = [...recipe.steps];
      newSteps[index] = value;
      handleRecipeChange("steps", newSteps);
    }
  };

  const addStep = () => {
    if (recipe) {
      handleRecipeChange("steps", [...recipe.steps, ""]);
    }
  };

  const removeStep = (index: number) => {
    if (recipe) {
      const newSteps = recipe.steps.filter((_, i) => i !== index);
      handleRecipeChange("steps", newSteps);
    }
  };

  const startOver = () => {
    setStage("upload");
    setPhotoDataUri(null);
    setImageUrl("");
    setIngredients([]);
    setSuggestedIngredients([]);
    setRecipe(null);
    setError(null);
    setIsDragging(false);
  };

  const handleExportToPdf = async () => {
    if (!recipe) return;

    const recipeCard = document.getElementById("recipe-card-to-export");
    if (!recipeCard) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find recipe content to export.",
      });
      return;
    }

    setIsExporting(true);
    toast({
      title: "Exporting...",
      description: "Your recipe PDF is being generated.",
    });

    // Give react time to re-render to the export-friendly view
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(recipeCard, {
        scale: 2,
        useCORS: true,
        onclone: (document) => {
          const body = document.body;
          if (body.classList.contains("dark")) {
            body.style.setProperty("--background", "240 10% 3.9%");
            body.style.setProperty("--foreground", "0 0% 98%");
          } else {
            body.style.setProperty("--background", "0 0% 100%");
            body.style.setProperty("--foreground", "240 10% 3.9%");
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "p",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${recipe.recipeName.replace(/ /g, "_")}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred while generating the PDF.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="container mx-auto px-4 py-8 sm:py-12">
        {stage === "upload" && (
          <div className="my-20 grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-in fade-in duration-500">
              <header className="mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2 flex items-center gap-3 font-headline">
                  <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  PhotoRecipe
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground">
                  Snap a picture of your ingredients, and let our AI chef cook
                  up a delicious recipe for you!
                </p>
              </header>
              <Card
                className={cn(
                  "shadow-lg transition-all",
                  isDragging && "border-primary ring-4 ring-primary/20"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <UploadCloud className="w-6 h-6" /> Start with a Photo
                  </CardTitle>
                  <CardDescription>
                    Drag & drop, upload a file, or paste an image URL to begin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label
                      htmlFor="picture"
                      className="mb-2 block font-semibold"
                    >
                      Upload an image
                    </Label>
                    <Input
                      id="picture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file:text-primary-foreground file:bg-primary hover:file:bg-primary/90"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Separator className="flex-1" />
                    <span className="text-sm text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                  </div>
                  <div>
                    <Label
                      htmlFor="image-url"
                      className="mb-2 block font-semibold"
                    >
                      Import from URL
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      <Button onClick={handleUrlLoad}>
                        <LinkIcon />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="hidden md:block animate-in fade-in duration-700">
              <Image
                src="https://www.shutterstock.com/image-photo/fried-salmon-steak-cooked-green-600nw-2489026949.jpg"
                alt="A delicious-looking meal"
                width={600}
                height={800}
                className="rounded-xl shadow-2xl object-cover w-full h-full"
                data-ai-hint="gourmet food"
              />
            </div>
          </div>
        )}

        {(stage === "analyzing" || stage === "generating-recipe") && (
          <div className="text-center flex flex-col items-center gap-4 py-16">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <p className="text-xl font-semibold text-muted-foreground">
              {stage === "analyzing"
                ? "Analyzing your ingredients..."
                : "Generating your masterpiece..."}
            </p>
          </div>
        )}

        {isExporting && (
          <div className="text-center flex flex-col items-center gap-4 py-16">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <p className="text-xl font-semibold text-muted-foreground">
              Exporting to PDF...
            </p>
          </div>
        )}

        {stage === "editing-ingredients" && !isExporting && (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <Card className="shadow-lg">
              <CardHeader>
                {photoDataUri && (
                  <Image
                    src={photoDataUri}
                    alt="Ingredients"
                    width={500}
                    height={300}
                    className="rounded-lg object-cover w-full h-48 mb-4"
                    data-ai-hint="food ingredients"
                    unoptimized
                  />
                )}
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <Wand2 /> Your Ingredients
                </CardTitle>
                <CardDescription>
                  Review the ingredients we found. Add or remove items before
                  creating your recipe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {ingredients.map((ing) => (
                    <div
                      key={ing}
                      className="flex items-center justify-between bg-secondary p-2 rounded-md"
                    >
                      <span className="font-medium">{ing}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeIngredient(ing)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add another ingredient..."
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddIngredient()
                    }
                  />
                  <Button onClick={handleAddIngredient}>
                    <PlusCircle />
                  </Button>
                </div>
                <Button
                  variant="link"
                  onClick={startOver}
                  className="mt-4 p-0 h-auto"
                >
                  Start over with a new photo
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <Sprout /> Suggestions
                  </CardTitle>
                  <CardDescription>
                    Consider adding these to complement your dish.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestedIngredients.length > 0 ? (
                      suggestedIngredients.map((sug) => (
                        <Button
                          key={sug}
                          variant="outline"
                          size="sm"
                          onClick={() => addSuggestionToIngredients(sug)}
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          {sug}
                        </Button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No suggestions at the moment.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Button
                size="lg"
                className="w-full font-bold text-lg"
                onClick={handleGenerateRecipe}
                disabled={ingredients.length === 0}
              >
                <ChefHat className="mr-2" /> Generate Recipe
              </Button>
            </div>
          </div>
        )}

        {stage === "displaying-recipe" && recipe && (
          <div
            className={cn(
              "max-w-4xl mx-auto animate-in fade-in duration-500",
              isExporting && "opacity-0"
            )}
          >
            <Card
              id="recipe-card-to-export"
              className="shadow-lg mb-4 p-4 sm:p-6 bg-card"
            >
              <CardHeader className="p-2 sm:p-4 text-center">
                <Label
                  htmlFor="recipe-name"
                  className="text-sm font-semibold text-muted-foreground sr-only"
                >
                  Recipe Name
                </Label>
                {isExporting ? (
                  <h1 className="text-3xl md:text-5xl font-bold h-auto p-2 tracking-tight text-center font-headline">
                    {recipe.recipeName}
                  </h1>
                ) : (
                  <Input
                    id="recipe-name"
                    value={recipe.recipeName}
                    onChange={(e) =>
                      handleRecipeChange("recipeName", e.target.value)
                    }
                    className="text-3xl md:text-5xl font-bold h-auto p-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent -ml-2 tracking-tight text-center font-headline"
                  />
                )}
              </CardHeader>
              <CardContent className="p-2 sm:p-4 space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2 font-headline">
                    Ingredients
                  </h3>
                  <ul className="list-disc list-inside space-y-2 pl-2 columns-2">
                    {recipe.ingredients.map((ing, index) => (
                      <li key={index}>{ing}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 border-b pb-2 font-headline">
                    Instructions
                  </h3>
                  <ol className="space-y-4">
                    {recipe.steps.map((step, index) => (
                      <li key={index} className="flex gap-4 items-start">
                        <Badge
                          variant="secondary"
                          className="text-lg font-bold h-8 w-8 flex items-center justify-center shrink-0 mt-1"
                        >
                          {index + 1}
                        </Badge>
                        <div className="w-full">
                          {isExporting ? (
                            <p className="py-2 text-sm whitespace-pre-wrap">
                              {step}
                            </p>
                          ) : (
                            <>
                              <Textarea
                                value={step}
                                onChange={(e) =>
                                  handleStepChange(index, e.target.value)
                                }
                                rows={3}
                                className="w-full bg-secondary/50"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 mt-1 text-muted-foreground hover:text-destructive"
                                onClick={() => removeStep(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                  {!isExporting && (
                    <Button
                      variant="outline"
                      onClick={addStep}
                      className="mt-4"
                    >
                      <PlusCircle className="mr-2" />
                      Add Step
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={startOver} className="w-full sm:w-auto">
                Start Over
              </Button>
              <Button
                onClick={handleExportToPdf}
                variant="secondary"
                className="w-full flex-grow"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 animate-spin" />
                ) : (
                  <FileDown className="mr-2" />
                )}
                {isExporting ? "Exporting..." : "Export to PDF"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
