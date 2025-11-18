import { useState } from "react";
import { Building2, Globe, MapPin, Github, Twitter, Linkedin } from "lucide-react";
import { FaTelegram, FaDiscord, FaReddit } from "react-icons/fa";
import { SiMedium } from "react-icons/si";

import type { Category, Project, Subcategory } from "../lib/category-utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface LandscapeViewProps {
  category: Category;
  exportRef?: React.RefObject<HTMLDivElement>;
}

export function LandscapeView({ category, exportRef }: LandscapeViewProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const categoryColor = getCategoryColor(category.id);

  return (
    <div
      ref={exportRef}
      className={`relative rounded-lg border-[1.5px] ${categoryColor.border} bg-white p-12 pt-16 shadow-lg`}
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="select-none text-9xl text-gray-400/20 -rotate-12">
          BuilderMaps.io
        </div>
      </div>
      <div className="absolute -top-5 left-1/2 z-20 -translate-x-1/2">
        <div
          className={`${categoryColor.labelBg} rounded-lg border-[1.5px] ${categoryColor.border} px-8 py-2.5 shadow-lg`}
        >
          <h2 className={`${categoryColor.text} whitespace-nowrap tracking-wide font-system-mono`}>
            The 2025 {category.name} Landscape
          </h2>
        </div>
      </div>

      <div className="relative z-0 grid grid-cols-12 gap-6">
        {category.subcategories.map((subcategory, index) => {
          const hasThirdLevel =
            subcategory.subcategories && subcategory.subcategories.length > 0;
          const hasDirectProjects =
            subcategory.projects && subcategory.projects.length > 0;
          const colSpan = calculateColSpan(subcategory);
          const background = hasDirectProjects
            ? "bg-white"
            : getSubcategoryStyle(index).bg;

          return (
            <div
              key={subcategory.name}
              className={`relative rounded border ${categoryColor.border} ${background} px-2 pb-2 pt-5`}
              style={{ gridColumn: `span ${colSpan}` }}
            >
              <div
                className={`absolute -top-3 left-4 rounded border ${categoryColor.border} ${categoryColor.labelBg} px-3 py-0.5 shadow-sm`}
              >
                <h3 className={`${categoryColor.text} text-sm font-system-mono`}>
                  {subcategory.name}
                </h3>
              </div>

              {hasThirdLevel ? (
                <div
                  className={`grid ${
                    subcategory.subcategories!.length <= 3
                      ? "grid-cols-3"
                      : subcategory.subcategories!.length === 4
                        ? "grid-cols-4"
                        : "grid-cols-5"
                  } gap-2`}
                >
                  {subcategory.subcategories!.map((thirdLevel) => (
                    <ThirdLevelBox
                      key={thirdLevel.name}
                      categoryName={category.name}
                      parentColor={categoryColor}
                      parentSubcategoryName={subcategory.name}
                      subcategory={thirdLevel}
                      openPopoverId={openPopoverId}
                      setOpenPopoverId={setOpenPopoverId}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {subcategory.projects?.map((project) => (
                    <ProjectLogo
                      key={project.id}
                      project={project}
                      categoryName={category.name}
                      subcategoryName={subcategory.name}
                      openPopoverId={openPopoverId}
                      setOpenPopoverId={setOpenPopoverId}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectLogo({
  project,
  categoryName,
  subcategoryName,
  thirdLevelName,
  openPopoverId,
  setOpenPopoverId,
}: {
  project: Project;
  categoryName: string;
  subcategoryName: string;
  thirdLevelName?: string;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
}) {
  const isOpen = openPopoverId === project.id;
  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => setOpenPopoverId(open ? project.id : null)}
    >
      <PopoverTrigger asChild>
        <div
          className="group w-fit cursor-pointer"
          title={`${project.name} - ${project.location}`}
        >
          <div
            className={`inline-flex h-9 w-auto items-center justify-center px-2 py-1 transition-all ${
              isOpen
                ? "border border-blue-600 bg-blue-50/20 shadow-md"
                : "border border-transparent hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex h-full max-w-[80px] items-center justify-center overflow-hidden">
              {project.logoUrl ? (
                <img
                  src={project.logoUrl}
                  alt={project.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="line-clamp-2 px-1 text-center text-[9px] leading-tight text-gray-900 transition-colors group-hover:text-blue-600">
                  {project.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-80 border border-gray-300 p-0 shadow-lg"
      >
        <ProjectCard
          project={project}
          categoryName={categoryName}
          subcategoryName={subcategoryName}
          thirdLevelName={thirdLevelName}
        />
      </PopoverContent>
    </Popover>
  );
}

function ProjectCard({
  project,
  categoryName,
  subcategoryName,
  thirdLevelName,
}: {
  project: Project;
  categoryName: string;
  subcategoryName: string;
  thirdLevelName?: string;
}) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-white shadow-sm">
          {project.logoUrl ? (
            <img
              src={project.logoUrl}
              alt={project.name}
              className="h-12 w-12 object-contain"
            />
          ) : (
            <Building2 className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-1.5 line-clamp-2 text-base leading-tight">
            {project.name}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        </div>
      </div>
      <p className="line-clamp-4 text-xs leading-relaxed text-gray-700">
        {project.description}
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {project.yearFounded && (
          <div>
            <div className="mb-0.5 text-gray-500">Founded</div>
            <div className="text-gray-900">{project.yearFounded}</div>
          </div>
        )}
        {project.totalFunding && project.totalFunding !== "N/A" && (
          <div>
            <div className="mb-0.5 text-gray-500">Total funding</div>
            <div className="text-gray-900">{project.totalFunding}</div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
          {categoryName}
        </span>
        <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
          {subcategoryName}
        </span>
        {thirdLevelName && (
          <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
            {thirdLevelName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 transition-colors hover:text-blue-600"
            title="Website"
          >
            <Globe className="h-4 w-4" />
          </a>
        )}
        {project.twitter && (
          <a
            href={project.twitter}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 transition-colors hover:text-blue-600"
            title="Twitter"
          >
            <Twitter className="h-4 w-4" />
          </a>
        )}
        {project.telegram && (
          <a
            href={project.telegram}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 transition-colors hover:text-blue-600"
            title="Telegram"
          >
            {/* @ts-expect-error - react-icons type compatibility issue with React 17 */}
            <FaTelegram className="h-4 w-4" />
          </a>
        )}
        {project.discord && (
          <a
            href={project.discord}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 transition-colors hover:text-blue-600"
            title="Discord"
          >
            {/* @ts-expect-error - react-icons type compatibility issue with React 17 */}
            <FaDiscord className="h-4 w-4" />
          </a>
        )}
        {project.medium && (
          <a
            href={project.medium}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 transition-colors hover:text-blue-600"
            title="Medium"
          >
            {/* @ts-expect-error - react-icons type compatibility issue with React 17 */}
            <SiMedium className="h-4 w-4" />
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 transition-colors hover:text-blue-600"
            title="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        )}
        {project.linkedin && (
          <a
            href={project.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 transition-colors hover:text-blue-600"
            title="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        {project.reddit && (
          <a
            href={project.reddit}
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 transition-colors hover:text-blue-600"
            title="Reddit"
          >
            {/* @ts-expect-error - react-icons type compatibility issue with React 17 */}
            <FaReddit className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

function ThirdLevelBox({
  categoryName,
  parentColor,
  parentSubcategoryName,
  subcategory,
  openPopoverId,
  setOpenPopoverId,
}: {
  categoryName: string;
  parentColor: ReturnType<typeof getCategoryColor>;
  parentSubcategoryName: string;
  subcategory: Subcategory;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
}) {
  return (
    <div
      className={`relative rounded border ${parentColor.border} bg-white px-2 pb-2 pt-6`}
    >
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded border ${parentColor.border} ${parentColor.labelBg} px-3 py-1 shadow-sm`}
      >
        <h5 className={`${parentColor.text} whitespace-nowrap text-xs`}>
          {subcategory.name}
        </h5>
      </div>
      <div className="flex flex-wrap gap-1">
        {subcategory.projects.map((project) => (
          <ProjectLogo
            key={project.id}
            project={project}
            categoryName={categoryName}
            subcategoryName={parentSubcategoryName}
            thirdLevelName={subcategory.name}
            openPopoverId={openPopoverId}
            setOpenPopoverId={setOpenPopoverId}
          />
        ))}
      </div>
    </div>
  );
}

function getCategoryColor(categoryId: string) {
  const map: Record<
    string,
    { bg: string; labelBg: string; border: string; text: string }
  > = {
    stablecoins: {
      bg: "bg-blue-100/80",
      labelBg: "bg-white",
      border: "border-blue-600",
      text: "text-blue-700",
    },
    payfi: {
      bg: "bg-purple-100/80",
      labelBg: "bg-white",
      border: "border-purple-600",
      text: "text-purple-700",
    },
    "ai-crypto": {
      bg: "bg-green-100/80",
      labelBg: "bg-white",
      border: "border-green-600",
      text: "text-green-700",
    },
    "public-chain": {
      bg: "bg-orange-100/80",
      labelBg: "bg-white",
      border: "border-orange-600",
      text: "text-orange-700",
    },
    data: {
      bg: "bg-pink-100/80",
      labelBg: "bg-white",
      border: "border-pink-600",
      text: "text-pink-700",
    },
  };
  return (
    map[categoryId] || {
      bg: "bg-gray-100/80",
      labelBg: "bg-white",
      border: "border-gray-600",
      text: "text-gray-700",
    }
  );
}

function getSubcategoryStyle(index: number) {
  const styles = [
    { border: "border-purple-400", bg: "bg-purple-50/60" },
    { border: "border-green-400", bg: "bg-green-50/60" },
    { border: "border-blue-400", bg: "bg-blue-50/60" },
    { border: "border-orange-400", bg: "bg-orange-50/60" },
    { border: "border-pink-400", bg: "bg-pink-50/60" },
    { border: "border-yellow-400", bg: "bg-yellow-50/60" },
    { border: "border-indigo-400", bg: "bg-indigo-50/60" },
    { border: "border-teal-400", bg: "bg-teal-50/60" },
  ];
  return styles[index % styles.length];
}

function calculateColSpan(subcategory: Subcategory) {
  if (subcategory.subcategories && subcategory.subcategories.length > 0) {
    const count = subcategory.subcategories.length;
    if (count <= 3) return 9;
    if (count <= 5) return 12;
    return 12;
  }
  const itemCount = subcategory.projects?.length ?? 0;
  if (itemCount <= 6) return 3;
  if (itemCount <= 9) return 4;
  if (itemCount <= 12) return 6;
  return 12;
}

