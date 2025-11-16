// client/src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Slider from "../components/Slider";
import Categories from "../components/Categories";
import Products from "../components/Products";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import axios from "axios";
import baseUrl from "../apiConfig";
import { Product } from "../types";
import styled from "styled-components";
import ImageSlider from "../components/ImageSlider";

const Container = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

/* ------------------------ DEDUP util ------------------------ */
/** Palabras/expresiones que NO cambian el diseño (se ignoran al agrupar) */
const VARIANT_PATTERNS: RegExp[] = [
  /\blargo especial\b/gi,
  /\bcorto especial\b/gi,
  /\bpesad[ao]s?\b/gi,
  /\blivian[ao]s?\b/gi,
  // si querés también ignorar tiro: activá estas
  // /\btiro alto\b/gi,
  // /\btiro bajo\b/gi,
];

/** Normaliza un título para agrupar variantes similares */
const canonicalName = (title: string) => {
  let s = (title || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // saca acentos
    .toLowerCase();

  // limpia separadores comunes
  s = s.replace(/[._/-]/g, " ");

  // quita variantes que no cambian el diseño
  for (const r of VARIANT_PATTERNS) s = s.replace(r, " ");

  // colapsa espacios
  s = s.replace(/\s+/g, " ").trim();
  return s;
};

/** Da prioridad a la versión “base” (sin Largo/Corto/Pesada/Liviana) */
const scorePriority = (title: string) => {
  let score = 0;
  const t = title.toLowerCase();
  if (/largo especial|corto especial/.test(t)) score -= 2;
  if (/\bpesad[ao]s?\b|\blivian[ao]s?\b/.test(t)) score -= 1;
  if (/\bcom[uú]n\b/.test(t)) score += 2; // si dice “común”, preferila
  return score;
};

/** Agrupa por canonicalName y elige una por grupo (la de mayor score) */
const dedupeByTitle = (arr: Product[]) => {
  const groups = new Map<string, Product[]>();
  for (const p of arr) {
    const key = canonicalName(p.title);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const picked: Product[] = [];
  groups.forEach((items) => {
    items.sort((a, b) => scorePriority(b.title) - scorePriority(a.title));
    picked.push(items[0]);
  });
  return picked;
};
/* ------------------------------------------------------------ */

const Home = () => {
  const [defaultProducts, setDefaultProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchDefaultProducts = async () => {
      try {
        // Trae bombachas y luego dedup
        const res = await axios.get<Product[]>(
          `${baseUrl}/products?category=bombachas`
        );

        // 1) deduplicamos por nombre "canónico"
        const unique = dedupeByTitle(res.data);

        // 2) limitamos a 12 para la grilla principal
        const top12 = unique.slice(0, 12);

        setDefaultProducts(top12);
      } catch (err) {
        console.error("Error fetching default products:", err);
      }
    };

    fetchDefaultProducts();
  }, []);

  return (
    <Container>
      <Navbar />
      <ImageSlider />
      {/* <Slider /> */}
      <Categories />
      <Products products={defaultProducts} />
      <Newsletter />
      <Footer />
    </Container>
  );
};

export default Home;
