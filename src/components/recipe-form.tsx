"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import {
  initialRecipeFormState,
  type RecipeFormState,
} from "@/lib/validations/recipe";

export type RecipeFormValues = {
  title: string;
  description?: string | null;
  ingredients: string[];
  steps: string[];
  prepTimeMinutes?: number | null;
  servings?: number | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  imageUrl?: string | null;
  tags: Array<{ name: string }>;
};

type RecipeFormProps = {
  action: (
    state: RecipeFormState,
    formData: FormData,
  ) => Promise<RecipeFormState>;
  userId: string;
  defaultValues?: RecipeFormValues;
  submitLabel: string;
  cancelHref: string;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p className="text-sm text-destructive" role="alert">
      {messages[0]}
    </p>
  );
}

function DynamicFieldList({
  label,
  name,
  values,
  onChange,
  placeholder,
  addLabel,
  multiline = false,
  maxItems,
  error,
}: {
  label: string;
  name: "ingredients" | "steps";
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  addLabel: string;
  multiline?: boolean;
  maxItems: number;
  error?: string[];
}) {
  const id = useId();

  function update(index: number, value: string) {
    const nextValues = [...values];
    nextValues[index] = value;
    onChange(nextValues);
  }

  function remove(index: number) {
    if (values.length === 1) {
      onChange([""]);
      return;
    }

    onChange(values.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <legend className="text-sm font-semibold">{label}</legend>
        <span className="text-xs text-muted-foreground">
          {values.length}/{maxItems}
        </span>
      </div>
      <div className="space-y-2.5">
        {values.map((value, index) => (
          <div key={`${id}-${index}`} className="flex items-start gap-2">
            <span className="mt-3 hidden text-muted-foreground sm:block">
              <GripVertical className="size-4" aria-hidden="true" />
            </span>
            <span className="mt-3 w-6 shrink-0 text-center text-xs font-bold text-primary">
              {index + 1}
            </span>
            {multiline ? (
              <Textarea
                name={name}
                value={value}
                maxLength={1_000}
                rows={3}
                placeholder={placeholder}
                aria-label={`${label} ${index + 1}`}
                onChange={(event) => update(index, event.target.value)}
              />
            ) : (
              <Input
                name={name}
                value={value}
                maxLength={200}
                placeholder={placeholder}
                aria-label={`${label} ${index + 1}`}
                onChange={(event) => update(index, event.target.value)}
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
              aria-label={`Remover item ${index + 1}`}
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
      <FieldError messages={error} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={values.length >= maxItems}
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="size-4" aria-hidden="true" />
        {addLabel}
      </Button>
    </fieldset>
  );
}

export function RecipeForm({
  action,
  userId,
  defaultValues,
  submitLabel,
  cancelHref,
}: RecipeFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialRecipeFormState,
  );
  const [ingredients, setIngredients] = useState(
    defaultValues?.ingredients.length ? defaultValues.ingredients : [""],
  );
  const [steps, setSteps] = useState(
    defaultValues?.steps.length ? defaultValues.steps : [""],
  );

  return (
    <form action={formAction} className="space-y-6">
      <Card className="space-y-6 p-5 sm:p-7">
        <div className="space-y-2">
          <Label htmlFor="title">Nome da receita *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={defaultValues?.title}
            maxLength={120}
            placeholder="Ex.: Risoto de cogumelos"
            aria-invalid={Boolean(state.fieldErrors?.title)}
            required
          />
          <FieldError messages={state.fieldErrors?.title} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={defaultValues?.description ?? ""}
            maxLength={2_000}
            rows={4}
            placeholder="Conte um pouco sobre a receita, sua origem ou quando você gosta de prepará-la."
            aria-invalid={Boolean(state.fieldErrors?.description)}
          />
          <FieldError messages={state.fieldErrors?.description} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="prepTimeMinutes">Tempo (minutos)</Label>
            <Input
              id="prepTimeMinutes"
              name="prepTimeMinutes"
              type="number"
              min={1}
              max={10_000}
              defaultValue={defaultValues?.prepTimeMinutes ?? ""}
              placeholder="45"
            />
            <FieldError messages={state.fieldErrors?.prepTimeMinutes} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings">Porções</Label>
            <Input
              id="servings"
              name="servings"
              type="number"
              min={1}
              max={10_000}
              defaultValue={defaultValues?.servings ?? ""}
              placeholder="4"
            />
            <FieldError messages={state.fieldErrors?.servings} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade</Label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={defaultValues?.difficulty ?? ""}
              className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10"
            >
              <option value="">Não informar</option>
              <option value="EASY">Fácil</option>
              <option value="MEDIUM">Média</option>
              <option value="HARD">Difícil</option>
            </select>
            <FieldError messages={state.fieldErrors?.difficulty} />
          </div>
        </div>
      </Card>

      <Card className="space-y-7 p-5 sm:p-7">
        <DynamicFieldList
          label="Ingredientes *"
          name="ingredients"
          values={ingredients}
          onChange={setIngredients}
          placeholder="Ex.: 2 xícaras de arroz arbóreo"
          addLabel="Adicionar ingrediente"
          maxItems={50}
          error={state.fieldErrors?.ingredients}
        />
        <div className="border-t border-border" />
        <DynamicFieldList
          label="Modo de preparo *"
          name="steps"
          values={steps}
          onChange={setSteps}
          placeholder="Descreva esta etapa do preparo."
          addLabel="Adicionar etapa"
          multiline
          maxItems={30}
          error={state.fieldErrors?.steps}
        />
      </Card>

      <Card className="space-y-6 p-5 sm:p-7">
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={defaultValues?.tags.map((tag) => tag.name).join(", ")}
            maxLength={420}
            placeholder="jantar, vegetariana, rápido"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Separe as tags por vírgula. Você pode adicionar até 10.
          </p>
          <FieldError messages={state.fieldErrors?.tags} />
        </div>

        <div className="space-y-2">
          <Label>Foto da receita</Label>
          <ImageUpload
            userId={userId}
            defaultImageUrl={defaultValues?.imageUrl ?? undefined}
          />
          <FieldError messages={state.fieldErrors?.imageUrl} />
        </div>
      </Card>

      {state.message ? (
        <div
          className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="outline" size="lg">
          <Link href={cancelHref} prefetch={false}>
            Cancelar
          </Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
