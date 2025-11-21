import { useMemo } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

import { categories, type Category } from "./lib/category-utils";
import { CategoryPage } from "./components/CategoryPage";
import { HomePage } from "./components/HomePage";
import "./styles/global.css";

function formatDate() {
  const today = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[today.getMonth()];
  const day = today.getDate();
  const year = today.getFullYear();
  return `${month} ${day},${year}`;
}

function HomeRoute() {
  const navigate = useNavigate();

  return (
    <HomePage
      onCategoryClick={(categoryId) => {
        navigate(`/category/${categoryId}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}

function CategoryRoute() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const category: Category | undefined = useMemo(() => {
    return categories.find((item) => item.id === categoryId);
  }, [categoryId]);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  return (
    <CategoryPage
      category={category}
      onBack={() => {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}

export default function Root() {
  const location = useLocation();
  const isCategoryRoute = location.pathname.startsWith("/category/");

  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/category/:categoryId" element={<CategoryRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className={`py-4 ${isCategoryRoute ? "bg-gray-50" : ""}`}>
        <div className="border-t border-gray-300 py-4 container mx-auto">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 max-[568px]:grid-cols-1 max-[568px]:gap-3 max-[568px]:text-xs">
            <div className="text-left">
              Date: {formatDate()}
            </div>
            <div className="text-center max-[568px]:text-left">
              Source:{" "}
              buildermaps.io
              {" "}
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
    </>
  );
}
