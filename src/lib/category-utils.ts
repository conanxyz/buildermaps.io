import builderMaps from "../../public/data/builder-maps.json";

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  yearFounded?: number;
  totalFunding?: number | string;
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

interface SectorEntry {
  sector: string;
  types: string[];
}

interface BuilderMapEntry {
  name: string;
  description?: string;
  sectors: SectorEntry[];
  founded?: number | null;
  funding?: number | string | null;
  links?: {
    homepage?: string;
    logo?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    medium?: string;
    github?: string;
    linkedin?: string;
    reddit?: string;
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Map to store unique projects by name to avoid duplication
const projectMap = new Map<string, Project>();

// Map to store categories and their subcategories
const categoryAccumulator = new Map<
  string,
  {
    category: Category;
    subcategories: Map<string, Subcategory>;
  }
>();

(builderMaps as BuilderMapEntry[]).forEach((entry, index) => {
  // Use project name as the key for consistent IDs
  const projectId = entry.name ? slugify(entry.name) : `project-${index}`;

  // Create or get the project
  let project = projectMap.get(entry.name);
  if (!project) {
    const links = entry.links || {};
    project = {
      id: projectId,
      name: entry.name,
      location: "Unknown", // Location not in new structure
      description: entry.description || "",
      yearFounded: entry.founded ?? undefined,
      totalFunding: entry.funding ?? undefined,
      homepage: links.homepage,
      twitter: links.twitter,
      telegram: links.telegram,
      discord: links.discord,
      medium: links.medium,
      github: links.github,
      linkedin: links.linkedin,
      reddit: links.reddit,
      logoUrl: links.logo,
    };
    projectMap.set(entry.name, project);
  }

  // Process each sector the project belongs to
  const sectors = entry.sectors || [];
  if (sectors.length === 0) {
    // Handle projects with no sectors
    const sectorName = "Uncategorized";
    const categoryId = slugify(sectorName);
    const subcategoryName = "General";

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

    // Add project reference (not duplicate)
    if (!subcategory.projects.find((p) => p.id === project.id)) {
      subcategory.projects.push(project);
    }
  } else {
    // Process each sector
    sectors.forEach((sectorEntry) => {
      const sectorName = sectorEntry.sector?.trim() || "Uncategorized";
      const categoryId = slugify(sectorName);

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

      // Process each type within the sector
      const types = sectorEntry.types || [];
      if (types.length === 0) {
        // If no types, add to "General" subcategory
        const subcategoryName = "General";
        let subcategory = record.subcategories.get(subcategoryName);
        if (!subcategory) {
          subcategory = {
            name: subcategoryName,
            projects: [],
          };
          record.subcategories.set(subcategoryName, subcategory);
          record.category.subcategories.push(subcategory);
        }
        if (!subcategory.projects.find((p) => p.id === project.id)) {
          subcategory.projects.push(project);
        }
      } else {
        // Add project to each type subcategory
        types.forEach((typeName) => {
          const subcategoryName = typeName.trim() || "General";
          let subcategory = record.subcategories.get(subcategoryName);
          if (!subcategory) {
            subcategory = {
              name: subcategoryName,
              projects: [],
            };
            record.subcategories.set(subcategoryName, subcategory);
            record.category.subcategories.push(subcategory);
          }
          // Only add if not already present (avoid duplicates)
          if (!subcategory.projects.find((p) => p.id === project.id)) {
            subcategory.projects.push(project);
          }
        });
      }
    });
  }
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

