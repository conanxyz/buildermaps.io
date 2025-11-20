import { useMemo, useState } from "react";
import {
  ArrowLeft,
  LayoutGrid,
  LayoutList,
  Search,
} from "lucide-react";

import {
  countCategoryProjects,
  type Category,
  type Subcategory,
} from "../lib/category-utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CardView } from "./CardView";
import { LandscapeView } from "./LandscapeView";

interface CategoryPageProps {
  category: Category;
  onBack: () => void;
}

export function CategoryPage({ category, onBack }: CategoryPageProps) {
  const [view, setView] = useState<"landscape" | "card">("landscape");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategory = useMemo(
    () => filterCategory(category, searchQuery),
    [category, searchQuery],
  );

  const projectCount = countCategoryProjects(category);
  const subcategoryCount = category.subcategories.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 max-[568px]:px-3">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-sm text-gray-700 hover:bg-gray-100 max-[568px]:-translate-x-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to categories
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={view === "landscape" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setView("landscape")}
              >
                <LayoutGrid className="h-4 w-4" />
                Landscape
              </Button>
              <Button
                size="sm"
                variant={view === "card" ? "default" : "outline"}
                className="gap-2"
                onClick={() => setView("card")}
              >
                <LayoutList className="h-4 w-4" />
                Card
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search projects…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              Showing{" "}
              <strong>{countCategoryProjects(filteredCategory)}</strong> of{" "}
              {projectCount} projects across {subcategoryCount} subcategories
            </div>
          </div>
        </div>
      </header>

      <main className={`container mx-auto px-6 py-8 ${view === "landscape" ? "max-[568px]:px-0" : ""}`}>
        {view === "landscape" ? (
          <div className="max-[568px]:px-3">
            <div className="mb-8 rounded border-l-4 border-blue-500 bg-blue-50 p-5">
              <div className="space-y-2 text-gray-800">
                <p>
                  <strong>Community Contribution:</strong> This landscape is
                  maintained by the community. Help improve the map by submitting
                  new projects, updating existing information, or suggesting
                  categorization improvements.
                </p>
                <p className="text-sm">
                  All changes are proposed via GitHub pull requests to ensure
                  transparency and quality control.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded border-l-4 border-blue-500 bg-blue-50 p-5">
            <div className="space-y-2 text-gray-800">
              <p>
                <strong>Community Contribution:</strong> This landscape is
                maintained by the community. Help improve the map by submitting
                new projects, updating existing information, or suggesting
                categorization improvements.
              </p>
              <p className="text-sm">
                All changes are proposed via GitHub pull requests to ensure
                transparency and quality control.
              </p>
            </div>
          </div>
        )}

        {view === "landscape" ? (
          <LandscapeView category={filteredCategory} />
        ) : (
          <div>
            <CardView category={filteredCategory} />
          </div>
        )}
      </main>

    </div>
  );
}

function filterCategory(category: Category, query: string): Category {
  if (!query.trim()) {
    return category;
  }

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSubcategories = category.subcategories
    .map((subcategory) => filterSubcategory(subcategory, normalizedQuery))
    .filter(
      (subcat): subcat is Subcategory =>
        subcat.projects.length > 0 ||
        Boolean(subcat.subcategories && subcat.subcategories.length > 0),
    );

  return {
    ...category,
    subcategories: filteredSubcategories,
  };
}

function filterSubcategory(
  subcategory: Subcategory,
  query: string,
): Subcategory {
  const matches = subcategory.projects.filter((project) => {
    return (
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    );
  });

  const nested = subcategory.subcategories
    ? subcategory.subcategories
        .map((child) => filterSubcategory(child, query))
        .filter(
          (child) =>
            child.projects.length > 0 ||
            Boolean(child.subcategories && child.subcategories.length > 0),
        )
    : undefined;

  return {
    ...subcategory,
    projects: matches,
    subcategories: nested,
  };
}

