import { useMemo } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { categories, type Category } from "./lib/category-utils";
import { CategoryPage } from "./components/CategoryPage";
import { HomePage } from "./components/HomePage";
import "./styles/global.css";

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
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/category/:categoryId" element={<CategoryRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
