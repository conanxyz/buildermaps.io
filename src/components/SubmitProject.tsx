import { FormEvent, type ReactNode, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import {
  categories as initialCategories,
  type Category,
  type Subcategory,
} from "../lib/category-utils";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { UserMenu } from "./UserMenu";

interface SubmitProjectProps {
  onBack: () => void;
}

interface FormState {
  name: string;
  location: string;
  description: string;
  categoryId: string;
  subcategoryName: string;
  homepage?: string;
  twitter?: string;
  github?: string;
}

const initialState: FormState = {
  name: "",
  location: "",
  description: "",
  categoryId: "",
  subcategoryName: "",
  homepage: "",
  twitter: "",
  github: "",
};

export function SubmitProject({ onBack }: SubmitProjectProps) {
  const [formState, setFormState] = useState<FormState>(initialState);

  const selectedCategory = useMemo<Category | undefined>(() => {
    return initialCategories.find((cat) => cat.id === formState.categoryId);
  }, [formState.categoryId]);

  const selectedSubcategories = useMemo<Subcategory[]>(() => {
    return selectedCategory?.subcategories ?? [];
  }, [selectedCategory]);

  const isSubmitDisabled =
    !formState.name.trim() ||
    !formState.location.trim() ||
    !formState.description.trim() ||
    !formState.categoryId ||
    !formState.subcategoryName;

  const handleChange = (
    field: keyof FormState,
    value: string,
  ): void => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) {
      return;
    }
    console.table(formState);
    alert(
      `${formState.name} submitted for review in ${formState.categoryId} › ${formState.subcategoryName}.`,
    );
    setFormState(initialState);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-3">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="text-lg font-semibold text-gray-900">
              BuilderMaps
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-gray-900 font-system-mono">Submit Project</h1>
            <p className="text-sm text-gray-600">
              Share your project with the BuilderMaps community
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-lg border-2 border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold font-system-mono">Project information</h2>
            <p className="text-sm text-gray-600">
              Fill in the details below. Submissions are reviewed before being
              added to BuilderMaps.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project name" required>
                <Input
                  value={formState.name}
                  onChange={(event) =>
                    handleChange("name", event.target.value)
                  }
                  placeholder="Circle"
                />
              </Field>
              <Field label="Location" required>
                <Input
                  value={formState.location}
                  onChange={(event) =>
                    handleChange("location", event.target.value)
                  }
                  placeholder="United States"
                />
              </Field>
            </div>

            <Field label="Description" required>
              <textarea
                value={formState.description}
                onChange={(event) =>
                  handleChange("description", event.target.value)
                }
                rows={4}
                className="w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm leading-relaxed text-gray-800 outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe your project in a few sentences…"
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary category" required>
                <select
                  value={formState.categoryId}
                  onChange={(event) => {
                    handleChange("categoryId", event.target.value);
                    handleChange("subcategoryName", "");
                  }}
                  className="h-10 w-full rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a category</option>
                  {initialCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Subcategory" required>
                <select
                  value={formState.subcategoryName}
                  onChange={(event) =>
                    handleChange("subcategoryName", event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={!selectedCategory}
                >
                  <option value="">
                    {selectedCategory ? "Select a subcategory" : "Select category first"}
                  </option>
                  {selectedSubcategories.map((subcategory) => (
                    <option key={subcategory.name} value={subcategory.name}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Website">
                <Input
                  value={formState.homepage}
                  onChange={(event) =>
                    handleChange("homepage", event.target.value)
                  }
                  placeholder="https://example.com"
                />
              </Field>
              <Field label="X (Twitter)">
                <Input
                  value={formState.twitter}
                  onChange={(event) =>
                    handleChange("twitter", event.target.value)
                  }
                  placeholder="https://x.com/username"
                />
              </Field>
              <Field label="GitHub">
                <Input
                  value={formState.github}
                  onChange={(event) =>
                    handleChange("github", event.target.value)
                  }
                  placeholder="https://github.com/username"
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
                Submit project
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm text-gray-700">
      <span className="font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

