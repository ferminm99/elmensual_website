// utils/useContainerWidth.ts
import { useEffect, useRef, useState } from "react";

export const useContainerWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(500); // Valor inicial seguro

  useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return { ref, width };
};
