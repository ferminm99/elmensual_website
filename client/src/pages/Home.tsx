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

/* ======================= Utils ======================= */
// Remueve tildes y normaliza
const strip = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diacríticos sin \p{Diacritic}
    .toLowerCase()
    .replace(/[._/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// palabras que no cambian el diseño visual
const VARIANT_PATTERNS: RegExp[] = [
  /\bpesad[ao]s?\b/g,
  /\blivian[ao]s?\b/g,
  /\blargo(?:a)?(?:\s+especial)?\b/g,
  /\bcorto(?:a)?(?:\s+especial)?\b/g,
];

const canonicalName = (title: string) => {
  let s = strip(title);
  for (const r of VARIANT_PATTERNS) s = s.replace(r, " ");
  return s.replace(/\s+/g, " ").trim();
};

const scorePriority = (p: Product) => {
  const t = strip(p.title);
  let score = 0;
  if (p.inStock) score += 100;
  else score -= 100;
  if (/\blarg[oa]\b/.test(t) || /\bcort[oa]\b/.test(t)) score -= 5;
  if (/\bcomun\b/.test(t)) score += 3;
  if (/\blivian[ao]s?\b/.test(t)) score += 2;
  if (/\bpesad[ao]s?\b/.test(t)) score += 1;
  return score;
};

const dedupeByTitle = (arr: Product[]) => {
  const groups = new Map<string, Product[]>();
  for (const p of arr) {
    const key = canonicalName(p.title);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const picked: Product[] = [];
  groups.forEach((items) => {
    items.sort((a, b) => scorePriority(b) - scorePriority(a));
    picked.push(items[0]);
  });
  return picked;
};

// helper para detectar niños/adolescentes con y sin tildes
const isKidsOrTeens = (title: string) => {
  const t = strip(title);
  // niño/niña/niños/niñas -> "nino|nina|ninos|ninas" (porque ya quitamos tildes)
  if (/\bnin[oa]s?\b/.test(t)) return true;
  // adolescente/adolescentes
  if (/\badolesc(?:ente|entes)\b/.test(t)) return true;
  return false;
};
/* ===================================================== */

const Home = () => {
  const [defaultProducts, setDefaultProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchDefaultProducts = async () => {
      try {
        const res = await axios.get<Product[]>(
          `${baseUrl}/products?category=bombachas`
        );

        const cleaned = res.data
          // 0) sólo en stock
          .filter((p) => !!p.inStock)
          // 1) fuera: niños/adolescentes
          .filter((p) => !isKidsOrTeens(p.title))
          // 2) fuera: largo/corto
          .filter((p) => {
            const t = strip(p.title);
            return !/\b(larg[oa]|cort[oa])\b/.test(t);
          });

        // 3) dedupe liviana/pesada/etc por diseño visual
        const uniqueDesigns = dedupeByTitle(cleaned);

        // 4) limitar a 12
        setDefaultProducts(uniqueDesigns.slice(0, 12));
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
