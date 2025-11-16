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

/* ======================= Utils de normalización ======================= */
const strip = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[._/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Variantes que no cambian el diseño visual */
const VARIANT_PATTERNS: RegExp[] = [
  /\bpesad[ao]s?\b/gi,
  /\blivian[ao]s?\b/gi,
  /\blargo(?:a)?(?:\s+especial)?\b/gi,
  /\bcorto(?:a)?(?:\s+especial)?\b/gi,
];

const canonicalName = (title: string) => {
  let s = strip(title);
  for (const r of VARIANT_PATTERNS) s = s.replace(r, " ");
  return s.replace(/\s+/g, " ").trim();
};

const scorePriority = (p: Product) => {
  const t = strip(p.title);
  let score = 0;
  // Prioridad fuerte para EN STOCK
  if (p.inStock) score += 100;
  else score -= 100;

  // Por si se colara alguno de largo/corto (igual los filtramos antes)
  if (/\blarg[oa]\b/.test(t) || /\bcort[oa]\b/.test(t)) score -= 5;

  // Preferencias: Común > Liviana > Pesada
  if (/\bcomun\b/.test(t)) score += 3;
  if (/\blivian[ao]s?\b/.test(t)) score += 2;
  if (/\bpesad[ao]s?\b/.test(t)) score += 1;

  return score;
};

/** Agrupa por nombre canónico y se queda con la mejor variante según prioridad */
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
/* ===================================================================== */

const Home = () => {
  const [defaultProducts, setDefaultProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchDefaultProducts = async () => {
      try {
        const res = await axios.get<Product[]>(
          `${baseUrl}/products?category=bombachas`
        );

        // 0) Excluir SIN STOCK
        const onlyInStock = res.data.filter((p) => !!p.inStock);

        // 1) Excluir todo lo que diga “largo/larga” o “corto/corta”
        const noLengthVariants = onlyInStock.filter((p) => {
          const t = strip(p.title);
          return !/\b(larg[oa]|cort[oa])\b/.test(t);
        });

        // 2) Deduplicar Pesada/Liviana (y cualquier rastro de largo/corto)
        const uniqueDesigns = dedupeByTitle(noLengthVariants);

        // 3) Mostrar hasta 12
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
