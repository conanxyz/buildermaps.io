import { useMemo, useRef, useState } from "react";
import { Building2, Globe, Github, Twitter, Linkedin, Download } from "lucide-react";
import { FaTelegram, FaDiscord, FaReddit } from "react-icons/fa";
import { SiMedium } from "react-icons/si";
import * as htmlToImage from "html-to-image";

import type { Category, Project, Subcategory } from "../lib/category-utils";
import { countSubcategoryProjects, sortProjects } from "../lib/category-utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { getProductionImageUrl, getLocalhostFallback } from "../utils/image-fallback";

interface LandscapeViewProps {
  category: Category;
  exportRef?: React.RefObject<HTMLDivElement>;
}

export function LandscapeView({ category, exportRef }: LandscapeViewProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const subcatRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setSubcatRef = (key: string) => (el: HTMLDivElement | null) => {
    subcatRefs.current[key] = el;
  };

  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [hoveredSubcategoryKey, setHoveredSubcategoryKey] = useState<string | null>(null);

  const sortedSubcategories = useMemo(() => {
    return [...category.subcategories].sort(
      (a, b) => countSubcategoryProjects(b) - countSubcategoryProjects(a)
    );
  }, [category.subcategories]);
async function exportSubcategoryPng(subcategory: Subcategory) {
  const key = `${category.name}__${subcategory.name}`;
  const node = subcatRefs.current[key];
  if (!node) return;

  try {
    setOpenPopoverId(null);
    setExportingKey(key);

    await new Promise((r) => requestAnimationFrame(r));

    // Hide the export button before taking screenshot
    const exportButton = node.querySelector('button[data-export-button]') as HTMLButtonElement | null;
    const originalButtonDisplay = exportButton?.style.display || '';
    if (exportButton) {
      exportButton.style.display = 'none';
    }

    const watermark = document.createElement("div");
    watermark.innerText = "BuilderMaps.io";
    watermark.style.position = "absolute";
    watermark.style.inset = "0";
    watermark.style.display = "flex";
    watermark.style.alignItems = "center";
    watermark.style.justifyContent = "center";
    watermark.style.pointerEvents = "none";
    watermark.style.userSelect = "none";
    watermark.style.fontSize = "64px";
    watermark.style.fontWeight = "700";
    watermark.style.opacity = "0.08";
    watermark.style.transform = "rotate(-12deg)";
    watermark.style.color = "#000";
    watermark.style.zIndex = "50";

    node.style.position ||= "relative";
    node.appendChild(watermark);

    const dataUrl = await htmlToImage.toPng(node, {
      cacheBust: true,
      backgroundColor: "#ffffff",
      pixelRatio: Math.min(2, window.devicePixelRatio || 1),
    });

    const safe = (s: string) =>
      s.replace(/[\/\\?%*:|"<>]/g, "-").replace(/\s+/g, "-");

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${safe(category.name)}-${safe(subcategory.name)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Restore the export button
    if (exportButton) {
      exportButton.style.display = originalButtonDisplay || '';
    }
    watermark.remove();
    setExportingKey(null);
  } catch (err) {
    console.error("Export failed:", err);
    // Restore the export button in case of error
    const exportButton = node?.querySelector('button[data-export-button]') as HTMLButtonElement | null;
    if (exportButton) {
      exportButton.style.display = '';
    }
    setExportingKey(null);
  }
}


  return (
    <div
      ref={exportRef}
      className="relative rounded-lg border-[1.5px] border-black bg-white p-12 pb-4 shadow-lg max-[568px]:border-0 max-[568px]:w-full max-[568px]:px-3 max-[568px]:py-6"
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="select-none text-9xl max-[568px]:text-4xl text-gray-400/20 -rotate-12">
          BuilderMaps.io
        </div>
      </div>

      <h2 className="relative z-20 mb-3 text-3xl max-[568px]:text-2xl text-black tracking-wide linux-libertine-bold font-bold text-center">
        {category.name} Ecosystem Map
      </h2>

      <div className="relative z-0 grid grid-cols-12 gap-0 max-[768px]:grid-cols-6">
        {sortedSubcategories.map((subcategory, index) => {
          const hasDirectProjects =
            subcategory.projects && subcategory.projects.length > 0;
          const background = hasDirectProjects ? "bg-white" : getSubcategoryStyle(index).bg;

          // For screens < 768px (md breakpoint), always use col-span-6
          // For larger screens, use the original logic: same count = 6/6, otherwise 7/5
          const isEven = index % 2 === 0;
          const currentCount = countSubcategoryProjects(subcategory);
          const siblingIndex = isEven ? index + 1 : index - 1;
          const siblingCount =
            siblingIndex >= 0 && siblingIndex < sortedSubcategories.length
              ? countSubcategoryProjects(sortedSubcategories[siblingIndex])
              : null;
          const hasSameCountAsSibling =
            siblingCount !== null && currentCount === siblingCount;

          const desktopColumnSpan = hasSameCountAsSibling
            ? "col-span-6"
            : isEven
            ? "col-span-7"
            : "col-span-5";
          
          // Always col-span-6 on screens < 768px, use calculated span on larger screens
          const columnSpanClass = `max-md:col-span-6 ${desktopColumnSpan}`;

          const refKey = `${category.name}__${subcategory.name}`;
          const isExporting = exportingKey === refKey;
          const isHovered = hoveredSubcategoryKey === refKey;

          return (
            <div 
              ref={setSubcatRef(refKey)}
              className={`relative ${columnSpanClass} p-4`}
              onMouseEnter={() => setHoveredSubcategoryKey(refKey)}
              onMouseLeave={() => setHoveredSubcategoryKey(null)}
            >
            <div
              key={subcategory.name}              
              className={`border border-black rounded ${background} px-2 pb-2 pt-5 max-[968px]:col-span-12 max-[568px]:px-1 max-[568px]:pb-1`}
            >
              <button
                type="button"
                data-export-button
                onClick={() => exportSubcategoryPng(subcategory)}
                disabled={isExporting}
                className={`cursor-pointer absolute right-6 top-6 z-20 inline-flex items-center gap-1 rounded border border-black bg-white px-2 py-1 text-xs text-black hover:bg-gray-50 disabled:opacity-60 transition-opacity duration-200 max-md:opacity-80 ${
                  isHovered ? 'md:opacity-80' : 'md:opacity-0'
                }`}
                title="Export this section"
              >
                <Download className="h-3.5 w-3.5" />
                {isExporting ? "Exporting..." : "Export"}
              </button>

              <div className="absolute top-1 left-1/2 -translate-x-1/2 rounded bg-white px-2 py-0.5 max-[568px]:py-0.5">
                <h3 className="text-black text-sm linux-libertine text-center linux-libertine-bold">
                  {subcategory.name}
                </h3>
              </div>

              <div className="flex flex-wrap">
                {sortProjects(subcategory.projects || []).map((project) => {
                  const uniqueKey = `${project.id}-${category.name}-${subcategory.name}`;
                  return (
                    <ProjectLogo
                      key={uniqueKey}
                      project={project}
                      categoryName={category.name}
                      subcategoryName={subcategory.name}
                      openPopoverId={openPopoverId}
                      setOpenPopoverId={setOpenPopoverId}
                    />
                  );
                })}
              </div>
            </div>
            </div>
          );
        })}
      </div>

      <footer className="pt-4 g-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 max-[568px]:grid-cols-1 max-[568px]:gap-3 max-[568px]:text-xs">
            <div className="text-left">Date: {formatDate()}</div>
            <div className="text-center max-[568px]:text-left">
              Source: buildermaps.io{" "}
              <a
                href="https://x.com/ChainbaseHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                @ChainbaseHQ
              </a>
            </div>
            <div className="text-right max-[568px]:text-left">
              Disclaimer: Listed ≠ endorsement. DYOR.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


function ProjectLogo({
  project,
  categoryName,
  subcategoryName,
  openPopoverId,
  setOpenPopoverId,
}: {
  project: Project;
  categoryName: string;
  subcategoryName: string;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
}) {
  // Create a unique ID for this project instance based on its location
  const uniqueId = `${project.id}-${categoryName}-${subcategoryName}`;
  const isOpen = openPopoverId === uniqueId;
  const [imageError, setImageError] = useState(false);
  
  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => setOpenPopoverId(open ? uniqueId : null)}
    >
      <PopoverTrigger asChild>
        <div
          className="group h-[96px] w-[75px] max-[568px]:h-[90px] max-[568px]:w-[72px] cursor-pointer max-[568px]:cursor-default max-[568px]:pointer-events-none"
          title={project.name}
        >
          <div
            className={`flex flex-col h-full w-full items-center justify-center px-2 py-1 transition-all ${
              isOpen
                ? "border border-blue-600 bg-blue-50/20 shadow-md"
                : "border border-transparent hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex h-[56px] w-[56px] max-[568px]:h-[50px] max-[568px]:w-[50px] items-center justify-center rounded-full">
              {project.logoUrl && !imageError ? (
                <img
                  src={getProductionImageUrl(project.logoUrl)}
                  alt={project.name}
                  className="h-full w-full object-contain rounded-full"
                  onError={(e) => {
                    const fallback = getLocalhostFallback(project.logoUrl || '');
                    if (fallback) {
                      (e.target as HTMLImageElement).src = fallback;
                    } else {
                      setImageError(true);
                    }
                  }}
                />
              ) : (
                <div className="flex h-[56px] w-[56px] max-[568px]:h-[50px] max-[568px]:w-[50px] items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                  <Building2 className="h-7 w-7 max-[568px]:h-6 max-[568px]:w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="mt-1 h-[28px] max-[568px]:h-[26px] text-center text-xs font-bold leading-tight text-gray-900 transition-colors group-hover:text-blue-600 w-full flex items-center justify-center">
              {formatProjectName(project.name)}
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-80 border border-gray-300 p-0 shadow-lg max-[568px]:hidden"
      >
        <ProjectCard
          project={project}
          categoryName={categoryName}
          subcategoryName={subcategoryName}
        />
      </PopoverContent>
    </Popover>
  );
}

function ProjectCard({
  project,
  categoryName,
  subcategoryName,
}: {
  project: Project;
  categoryName: string;
  subcategoryName: string;
}) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
          {project.logoUrl ? (
            <img
              src={getProductionImageUrl(project.logoUrl)}
              alt={project.name}
              className="h-12 w-12 object-contain rounded-full"
              onError={(e) => {
                const fallback = getLocalhostFallback(project.logoUrl || '');
                if (fallback) {
                  (e.target as HTMLImageElement).src = fallback;
                }
              }}
            />
          ) : (
            <Building2 className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="mb-1.5 line-clamp-2 text-base leading-tight">
            {project.name}
          </h4>
          <div className="flex items-center gap-2">
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
      </div>
    </div>
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
  const itemCount = subcategory.projects?.length ?? 0;
  if (itemCount <= 6) return 3;
  if (itemCount <= 9) return 4;
  if (itemCount <= 12) return 6;
  return 12;
}

function formatDate() {
  const today = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[today.getMonth()];
  const day = today.getDate();
  const year = today.getFullYear();
  return `${month} ${day},${year}`;
}

function formatProjectName(name: string, maxLength: number = 20): string {
  // Remove parenthetical content
  let formatted = name.replace(/\s*\([^)]*\)/g, '');
  
  // If length exceeds maxLength, remove last word repeatedly
  while (formatted.length > maxLength) {
    const words = formatted.trim().split(/\s+/);
    if (words.length <= 1) break; // Can't remove more words
    words.pop(); // Remove last word
    formatted = words.join(' ');
  }
  
  return formatted;
}