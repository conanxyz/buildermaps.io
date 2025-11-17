import builderMaps from "../../public/data/builder-maps.json";

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  yearFounded?: string;
  totalFunding?: string;
  homepage?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  medium?: string;
  github?: string;
  linkedin?: string;
  reddit?: string;
  logoUrl?: string;
}

export interface Subcategory {
  name: string;
  projects: Project[];
  subcategories?: Subcategory[];
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface BuilderMapEntry {
  sector?: string;
  type?: string;
  name: string;
  location?: string;
  description?: string;
  yearFounded?: string;
  totalFunding?: string;
  homepage?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  medium?: string;
  github?: string;
  linkedin?: string;
  reddit?: string;
  logoUrl?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const categoryAccumulator = new Map<
  string,
  {
    category: Category;
    subcategories: Map<string, Subcategory>;
  }
>();

(builderMaps as BuilderMapEntry[]).forEach((entry, index) => {
  const sectorName = entry.sector?.trim() || "Uncategorized";
  const categoryId = slugify(sectorName);
  const subcategoryName = entry.type?.trim() || "General";

  let record = categoryAccumulator.get(categoryId);
  if (!record) {
    record = {
      category: {
        id: categoryId,
        name: sectorName,
        subcategories: [],
      },
      subcategories: new Map(),
    };
    categoryAccumulator.set(categoryId, record);
  }

  let subcategory = record.subcategories.get(subcategoryName);
  if (!subcategory) {
    subcategory = {
      name: subcategoryName,
      projects: [],
    };
    record.subcategories.set(subcategoryName, subcategory);
    record.category.subcategories.push(subcategory);
  }

  const projectIdBase = entry.name ? slugify(entry.name) : `project-${index}`;
  const projectId = `${projectIdBase}-${index}`;

  subcategory.projects.push({
    id: projectId,
    name: entry.name,
    location: entry.location ?? "Unknown",
    description: entry.description ?? "",
    yearFounded: entry.yearFounded,
    totalFunding: entry.totalFunding,
    homepage: entry.homepage,
    twitter: entry.twitter,
    telegram: entry.telegram,
    discord: entry.discord,
    medium: entry.medium,
    github: entry.github,
    linkedin: entry.linkedin,
    reddit: entry.reddit,
    logoUrl: entry.logoUrl,
  });
});

export const categories: Category[] = Array.from(categoryAccumulator.values()).map(
  (record) => ({
    ...record.category,
    subcategories: record.category.subcategories.map((subcategory) => ({
      ...subcategory,
    })),
  }),
);

export function countSubcategoryProjects(subcategory: Subcategory): number {
  let count = subcategory.projects.length;

  if (subcategory.subcategories) {
    for (const nestedSubcategory of subcategory.subcategories) {
      count += countSubcategoryProjects(nestedSubcategory);
    }
  }

  return count;
}

export function countCategoryProjects(category: Category): number {
  return category.subcategories.reduce(
    (total, subcategory) => total + countSubcategoryProjects(subcategory),
    0,
  );
}

export function countTotalProjects(categories: Category[]): number {
  return categories.reduce(
    (total, category) => total + countCategoryProjects(category),
    0,
  );
}

