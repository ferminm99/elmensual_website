import React from "react";
import styled from "styled-components";
import { Search, ViewList } from "@material-ui/icons";
import Badge from "@mui/material/Badge";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";
import Tooltip from "@mui/material/Tooltip";
import { mobile } from "../responsive";
import axios from "axios";
import baseUrl from "../apiConfig";
import { Product as ProductComplete } from "../types";

interface Product {
  displayName: string;
  filters: string[];
}

type Category = {
  [section: string]: Product[] | { [type: string]: Product[] };
};

const Container = styled.div`
  height: 80px;
  margin-bottom: 10px;
  width: 100%;
  overflow: hidden;
  position: sticky; /* Cambiado a relative */
  top: 0;
  z-index: 1000;
  background-color: white;
`;

const SearchContainerMobile = styled.div`
  display: none;
  ${mobile({
    display: "block",
    cursor: "pointer",
  })}
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  text-align: center;
  position: relative;
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  margin-top: 20px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
`;

const Wrapper = styled.div`
  padding: 10px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;

  ${mobile({
    padding: "10px 15px", // Reduce el padding en móviles
  })}
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  ${mobile({
    justifyContent: "flex-start", // Asegura que el contenido esté alineado a la izquierda
  })}
`;

const LogoImage = styled.img`
  height: 80px;
  width: 80px;
  cursor: pointer;
  margin-right: 20px;
`;

const SearchContainer = styled.div`
  border: 1px solid lightgray;
  display: flex;
  align-items: center;
  padding: 10px;
  margin-left: 20px;

  ${mobile({
    display: "none", // Oculta el contenedor de búsqueda en móviles
  })}
`;

const Input = styled.input`
  border: none;
  font-size: 16px;
  width: 100%;
`;

const CategoryMenu = styled.div`
  position: relative;
  margin: 0 15px;
  font-size: 18px; /* Tamaño de fuente aumentado */
  font-weight: bold; /* Texto en negrita */
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #333;
  }

  &:after {
    content: "";
    display: block;
    width: 0;
    height: 2px;
    background: black;
    transition: width 0.3s;
    margin-top: 5px; /* Espacio entre el texto y la línea */
  }

  &:hover:after {
    width: 100%; /* La línea aparece al hacer hover */
  }

  &:hover .dropdown {
    visibility: visible;
    opacity: 1;
  }
  &:hover .dropdown,
  .dropdown:hover {
    visibility: visible;
    opacity: 1;
  }
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 30px; /* Espacio entre los elementos del menú */

  ${mobile({
    display: "none", // Oculta el menú en móviles
  })}
`;

const Dropdown = styled.div`
  visibility: hidden;
  opacity: 0;
  position: fixed;
  top: 8%;
  left: 0; /* Alineación para PC */
  right: 0;
  background-color: #f9f9f9;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  padding: 20px;
  z-index: 100;
  width: 100%;
  min-height: 35%;
  display: flex;
  justify-content: center; /* Centrado para PC */
  gap: 40px; /* Espacio entre columnas */
  transition: visibility 0.2s ease-in-out, opacity 0.3s ease;
  border-radius: 8px;
  box-sizing: border-box;
  overflow-y: auto;

  /* Alineación para móvil */
  @media (max-width: 768px) {
    left: 20px; /* Desplaza ligeramente hacia la derecha */
    right: 20px; /* Ajusta el ancho en móviles */
    justify-content: flex-start; /* Alinea a la izquierda para evitar demasiado centrado */
  }

  ${CategoryMenu}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

const DropdownSection = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinea los títulos y elementos a la izquierda */
  min-width: 150px;
  text-align: left; /* Alinea el texto a la izquierda */
`;

const SubDropdown = styled.div`
  visibility: hidden;
  opacity: 0;
  position: absolute;
  top: 50%;
  white-space: nowrap;
  left: calc(100% + 10px);
  transform: translateY(-50%);
  background-color: #f9f9f9;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  padding: 20px;
  min-width: 250px; /* Añade un ancho mínimo */
  width: auto; /* Ajusta el ancho automáticamente según el contenido */
  max-width: 400px; /* Opcional: establece un ancho máximo */
  transition: visibility 0.3s ease, opacity 0.3s ease;
  border-radius: 8px;
  box-sizing: border-box;
  z-index: 20;
  word-wrap: break-word; /* Permite el ajuste de palabras largas */

  &:hover {
    visibility: visible;
    opacity: 1;
  }
`;

const DropdownItem = styled.div`
  padding: 5px 0;
  cursor: pointer;
  color: gray;
  position: relative;
  white-space: nowrap; /* Evita que el texto se corte */
  width: 100%;
  text-align: left; /* Alinea cada ítem a la izquierda */
  transition: color 0.3s ease;

  &:hover {
    background-color: #e6e6e6;
    border-radius: 4px;
  }

  &:hover ${SubDropdown} {
    visibility: visible;
    opacity: 1;
  }
`;

const SectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  text-transform: uppercase;
  color: #333;
  text-align: left; /* Asegura que el texto esté alineado a la izquierda */
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #555;
  }
`;

const SubsectionTitle = styled.div`
  font-weight: bold;
  margin-top: 10px;
  color: #666;
  text-align: center; /* Centra el subtítulo de cada submenú */
`;

const SubCategoryTitle = styled.div`
  font-weight: normal;
  font-size: 14px; /* Tamaño de fuente reducido */
  margin-left: 15px; /* Desplaza hacia la derecha */
  margin-bottom: 5px; /* Separación entre subcategorías */
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;

  &:hover {
    color: #444;
    transform: translateX(5px); /* Efecto de desplazamiento al pasar el mouse */
  }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;

  ${mobile({
    justifyContent: "flex-end", // Mantén el contenido alineado a la derecha
    gap: "10px",
  })}
`;

const MenuItem = styled.div`
  font-size: 16px;
  cursor: pointer;
  margin-left: 20px;
  transition: color 0.3s ease;

  &:hover {
    color: #555;
  }
  ${mobile({
    display: "none", // Visible en móviles
  })}
`;

const MenuToggle = styled.div`
  display: none;

  ${mobile({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 1001, // Siempre visible
  })}
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed; /* Menú fijo */
  top: 80px; /* Aparece debajo del navbar */
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  padding: 20px;
  z-index: 999; /* Debajo del navbar */
  flex-direction: column;
  gap: 15px;

  ${mobile({
    display: "flex", // Visible en móviles
  })}
`;

const MobileCategoryTitle = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
  cursor: pointer;
  padding: 5px 0;
  transition: color 0.3s ease;

  &:hover {
    color: #555;
  }
`;

const MobileSubCategoryTitle = styled.div`
  font-weight: normal;
  font-size: 16px;
  margin-left: 15px; /* Desplaza ligeramente a la derecha */
  margin-bottom: 8px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;

  &:hover {
    color: #444;
    transform: translateX(5px); /* Efecto de desplazamiento al pasar el mouse */
  }
`;

const MobileDropdownItem = styled.div`
  font-size: 14px; /* Tamaño más pequeño */
  margin-left: 30px; /* Desplaza aún más a la derecha */
  color: gray;
  padding: 5px 0;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: black;
  }
`;
const Navbar: React.FC = () => {
  const categories = {
    Hombre: {
      BOMBACHAS: {
        "Grafa Pesada": {
          filters: ["grafa", "pesada"],
          items: [
            {
              displayName: "Grafa pesada común",
              filters: ["grafa", "pesada", "recta", "tiroalto", "comun"],
            },
            {
              displayName: "Grafa pesada largo especial",
              filters: ["grafa", "pesada", "recta", "tiroalto", "largo"],
            },
            {
              displayName: "Grafa pesada corto especial",
              filters: ["grafa", "pesada", "recta", "tiroalto", "corto"],
            },
            {
              displayName: "Grafa gabardina común",
              filters: [
                "grafa",
                "pesada",
                "recta",
                "tiroalto",
                "comun",
                "gabardina",
              ],
            },
          ],
        },
        "Grafa Liviana": {
          filters: ["grafa", "liviana"],
          items: [
            {
              displayName: "Grafa liviana común",
              filters: ["grafa", "liviana", "recta", "tiroalto", "comun"],
            },
            {
              displayName: "Grafa liviana largo especial",
              filters: ["grafa", "liviana", "recta", "tiroalto", "largo"],
            },
            {
              displayName: "Grafa liviana corto especial",
              filters: ["grafa", "liviana", "recta", "tiroalto", "corto"],
            },
          ],
        },
        Alforzada: {
          filters: ["alforzada"],
          items: [
            {
              displayName: "Grafa alforzada pesada común",
              filters: ["grafa", "alforzada", "pesada", "tiroalto", "comun"],
            },
            {
              displayName: "Grafa alforzada liviana común",
              filters: ["grafa", "alforzada", "liviana", "tiroalto", "comun"],
            },
          ],
        },
        Bataraza: {
          filters: ["bataraza"],
          items: [
            {
              displayName: "Bataraza",
              filters: ["bataraza", "tiroalto", "comun"],
            },
            {
              displayName: "Bataraza poliéster-viscosa",
              filters: ["bataraza", "tiroalto", "comun", "poliester"],
            },
          ],
        },
        Poplin: {
          filters: ["poplin"],
          items: [
            {
              displayName: "Poplin común",
              filters: ["poplin", "tiroalto", "comun"],
            },
            {
              displayName: "Poplin largo especial",
              filters: ["poplin", "tiroalto", "largo"],
            },
            {
              displayName: "Poplin corto especial",
              filters: ["poplin", "tiroalto", "corto"],
            },
            {
              displayName: "Poplin Fantasia",
              filters: ["fantasia", "tiroalto", "comun"],
            },
            {
              displayName: "Poplin Fantasia Jaspeada",
              filters: ["fantasia", "jaspeada", "tiroalto", "comun"],
            },
            {
              displayName: "Poplin Denim",
              filters: ["denim", "tiroalto", "comun"],
            },
          ],
        },
        Corderoy: {
          filters: ["corderoy"],
          items: [
            {
              displayName: "Corderoy común",
              filters: ["corderoy", "tiroalto", "comun"],
            },
            {
              displayName: "Corderoy largo especial",
              filters: ["corderoy", "tiroalto", "largo"],
            },
            {
              displayName: "Corderoy corto especial",
              filters: ["corderoy", "tiroalto", "corto"],
            },
          ],
        },
        Sarga: {
          filters: ["sarga"],
          items: [
            {
              displayName: "Recta Pesada",
              filters: ["sarga", "recta", "pesada", "comun", "tiroalto"],
            },
            {
              displayName: "Recta Liviana",
              filters: ["sarga", "recta", "liviana", "comun", "tiroalto"],
            },
          ],
        },
      },
      PANTALONES: [
        { displayName: "Grafa trabajo", filters: ["grafa", "trabajo"] },
        { displayName: "Grafa cargo", filters: ["grafa", "cargo"] },
        { displayName: "Corderoy", filters: ["corderoy"] },
        { displayName: "Grafa Sport/Poplin", filters: ["grafa", "poplin"] },
        {
          displayName: "Grafa Sport Gabardina",
          filters: ["grafa", "gabardina"],
        },
      ],
      CAMISAS: [
        { displayName: "Grafa Trabajo", filters: ["grafa", "trabajo"] },
        { displayName: "Grafa Poplin", filters: ["grafa", "poplin"] },
        {
          displayName: "Grafa Gabardina Manga Corta",
          filters: ["grafa", "gabardina"],
        },
      ],
      BERMUDAS: [
        {
          displayName: "Poplin",
          filters: ["poplin", "simple"],
        },
        {
          displayName: "Poplin Cargo",
          filters: ["poplin", "cargo"],
        },
      ],
      JEANS: [
        {
          displayName: "Recto Rígido",
          filters: ["rigido", "recto"],
        },
        {
          displayName: "Recto con Expander",
          filters: ["expander", "recto"],
        },
      ],
      OTROS: [
        { displayName: "Boinas de Hilo", filters: ["boina"] },
        { displayName: "Delantal Carnicero", filters: ["delantal"] },
        { displayName: "Alpargatas", filters: ["alpargatas"] },
      ],
    },
    Mujer: {
      BOMBACHAS: {
        "Grafa Pesada": {
          filters: ["grafa", "pesada"],
          items: [
            {
              displayName: "Grafa pesada común (tiro alto)",
              filters: ["grafa", "pesada", "recta", "tiroalto", "comun"],
            },
            {
              displayName: "Grafa pesada largo especial (tiro alto)",
              filters: ["grafa", "pesada", "recta", "tiroalto", "largo"],
            },
            {
              displayName: "Grafa pesada corto especial (tiro alto)",
              filters: ["grafa", "pesada", "recta", "tiroalto", "corto"],
            },
            {
              displayName: "Grafa pesada común (tiro bajo)",
              filters: ["grafa", "pesada", "recta", "tirobajo", "comun"],
            },
            {
              displayName: "Grafa pesada largo especial (tiro bajo)",
              filters: ["grafa", "pesada", "recta", "tirobajo", "largo"],
            },
          ],
        },
        "Grafa Liviana": {
          filters: ["grafa", "liviana"],
          items: [
            {
              displayName: "Grafa liviana común (tiro alto)",
              filters: ["grafa", "liviana", "recta", "tiroalto", "comun"],
            },
            {
              displayName: "Grafa liviana largo especial (tiro alto)",
              filters: ["grafa", "liviana", "recta", "tiroalto", "largo"],
            },
            {
              displayName: "Grafa liviana corto especial (tiro alto)",
              filters: ["grafa", "liviana", "recta", "tiroalto", "corto"],
            },
            {
              displayName: "Grafa liviana común (tiro bajo)",
              filters: ["grafa", "liviana", "recta", "tirobajo", "comun"],
            },
          ],
        },
        Alforzada: {
          filters: ["grafa", "alforzada"],
          items: [
            {
              displayName: "Grafa alforzada liviana común (tiro alto)",
              filters: ["grafa", "alforzada", "liviana", "tiroalto", "comun"],
            },
            {
              displayName: "Grafa alforzada pesada común (tiro alto)",
              filters: ["grafa", "alforzada", "pesada", "tiroalto", "comun"],
            },
          ],
        },
        Bataraza: {
          filters: ["bataraza"],
          items: [
            {
              displayName: "bataraza (tiro alto)",
              filters: ["bataraza", "tiroalto", "comun"],
            },
            {
              displayName: "bataraza polister - viscoza  (tiro alto)",
              filters: ["bataraza", "tiroalto", "comun", "poliester"],
            },
          ],
        },
        Poplin: {
          filters: ["poplin"],
          items: [
            {
              displayName: "Poplin común (tiro alto)",
              filters: ["poplin", "tiroalto", "comun"],
            },
            {
              displayName: "Poplin común (tiro bajo)",
              filters: ["poplin", "tirobajo", "comun"],
            },
            {
              displayName: "Poplin largo especial (tiro alto)",
              filters: ["poplin", "tiroalto", "largo"],
            },
            {
              displayName: "Poplin corto especial (tiro alto)",
              filters: ["poplin", "tiroalto", "corto"],
            },
            {
              displayName: "Poplin común (tiro bajo)",
              filters: ["poplin", "tirobajo", "comun"],
            },
            {
              displayName: "Poplin Fantasia (tiro alto)",
              filters: ["fantasia", "tiroalto", "comun"],
            },
            {
              displayName: "Poplin Fantasia Jaspeada (tiro alto)",
              filters: ["fantasia", "jaspeada", "tiroalto", "comun"],
            },
            {
              displayName: "Poplin Denim (tiro alto)",
              filters: ["denim", "tiroalto", "comun"],
            },
          ],
        },
        Corderoy: {
          filters: ["corderoy"],
          items: [
            {
              displayName: "Corderoy común (tiro alto)",
              filters: ["corderoy", "tiroalto", "comun"],
            },
            {
              displayName: "Corderoy largo especial (tiro alto)",
              filters: ["corderoy", "tiroalto", "largo"],
            },
            {
              displayName: "Corderoy corto especial (tiro alto)",
              filters: ["corderoy", "tiroalto", "corto"],
            },
            {
              displayName: "Corderoy común (tiro bajo)",
              filters: ["corderoy", "tirobajo", "comun"],
            },
          ],
        },
        Sarga: {
          filters: ["sarga"],
          items: [
            {
              displayName: "Recta Pesada (tiro alto)",
              filters: ["sarga", "recta", "pesada", "comun", "tiroalto"],
            },
            {
              displayName: "Recta Liviana (tiro alto)",
              filters: ["sarga", "recta", "liviana", "comun", "tiroalto"],
            },
          ],
        },
      },
      PANTALONES: [
        {
          displayName: "Grafa trabajo (tiro alto)",
          filters: ["grafa", "trabajo"],
        },
        { displayName: "Grafa cargo (tiro alto)", filters: ["grafa", "cargo"] },
        { displayName: "Corderoy (tiro alto)", filters: ["corderoy"] },
        {
          displayName: "Grafa Sport/Poplin (tiro alto)",
          filters: ["grafa", "poplin"],
        },
        {
          displayName: "Grafa Sport Gabardina (tiro alto)",
          filters: ["grafa", "gabardina"],
        },
      ],
      CAMISAS: [
        { displayName: "Grafa Trabajo", filters: ["grafa", "trabajo"] },
        { displayName: "Grafa Poplin", filters: ["grafa", "poplin"] },
        {
          displayName: "Grafa Gabardina Manga Corta",
          filters: ["grafa", "gabardina"],
        },
      ],
      BERMUDAS: [
        {
          displayName: "Poplin (tiro alto)",
          filters: ["poplin", "simple"],
        },
        {
          displayName: "Poplin Cargo (tiro alto)",
          filters: ["poplin", "cargo"],
        },
      ],
      JEANS: [
        {
          displayName: "Recto Rígido",
          filters: ["rigido", "recto"],
        },
        {
          displayName: "Recto con Expander",
          filters: ["expander", "recto"],
        },
      ],
      OTROS: [
        { displayName: "Boinas de Hilo", filters: ["boina"] },
        { displayName: "Delantal Carnicero", filters: ["delantal"] },
        { displayName: "Alpargatas", filters: ["alpargatas"] },
      ],
    },
    Adolescentes: {
      BOMBACHAS: [
        {
          displayName: "Grafa pesada común",
          filters: ["grafa", "pesada", "recta", "tiroalto", "comun"],
        },
        {
          displayName: "Grafa liviana común",
          filters: ["grafa", "liviana", "recta", "tiroalto", "comun"],
        },
        {
          displayName: "Bataraza",
          filters: ["bataraza", "tiroalto", "comun"],
        },
        {
          displayName: "Poplin común",
          filters: ["poplin", "tiroalto", "comun"],
        },
        {
          displayName: "Poplin Fantasia",
          filters: ["fantasia", "tiroalto", "comun"],
        },
        {
          displayName: "Corderoy",
          filters: ["corderoy", "tiroalto", "comun"],
        },
        {
          displayName: "Recta Pesada",
          filters: ["sarga", "recta", "pesada", "comun"],
        },
      ],

      CAMISAS: [{ displayName: "Grafa Scout", filters: ["grafa", "scout"] }],
      OTROS: [{ displayName: "Alpargatas", filters: ["alpargatas"] }],
    },
    Niños: {
      BOMBACHAS: [
        {
          displayName: "Grafa pesada común",
          filters: ["grafa", "pesada", "recta", "tiroalto", "comun"],
        },
        {
          displayName: "Grafa liviana común",
          filters: ["grafa", "liviana", "recta", "tiroalto", "comun"],
        },
        {
          displayName: "Bataraza",
          filters: ["bataraza", "tiroalto", "comun"],
        },
        {
          displayName: "Poplin común",
          filters: ["poplin", "tiroalto", "comun"],
        },
        {
          displayName: "Poplin Fantasia",
          filters: ["fantasia", "tiroalto", "comun"],
        },
        {
          displayName: "Corderoy",
          filters: ["corderoy", "tiroalto", "comun"],
        },
        {
          displayName: "Recta Pesada",
          filters: ["sarga", "recta", "pesada", "comun"],
        },
      ],
      OTROS: [{ displayName: "Alpargatas", filters: ["alpargatas"] }],
    },
  };

  const [isModalOpen, setModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  //const quantity = useSelector((state: RootState) => state.cart.quantity);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null
  );
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0); // Desplaza al inicio
    navigate(path);
  };

  // Función para normalizar las categorías, reemplazando caracteres especiales
  const normalizeCategory = (category: string) => {
    return category.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Elimina tildes y acentos
  };

  const handleCategoryClick = (
    mainCategory: string,
    section: string | null,
    filters: string[]
  ) => {
    setMobileMenuOpen(false); // Cierra el menú al hacer clic
    window.scrollTo(0, 0);
    const normalizedMainCategory = normalizeCategory(mainCategory);
    const normalizedSection = section ? normalizeCategory(section) : "";
    const normalizedFilters = filters.map(normalizeCategory).join("-");

    const path = `/products/${normalizedMainCategory}/${
      normalizedSection || ""
    }${normalizedFilters ? `/${normalizedFilters}` : ""}`;
    navigate(path);
  };

  const safeToLower = (str: string | undefined) =>
    str ? str.toLowerCase() : "";

  const handleSearch = async (searchTerm: string) => {
    const term = String(searchTerm).trim(); // Asegurar que es un string y limpiar espacios

    if (!term) return;

    // Lista de palabras irrelevantes a ignorar en la búsqueda
    const stopWords = new Set([
      "de",
      "para",
      "el",
      "la",
      "los",
      "las",
      "un",
      "una",
      "unos",
      "unas",
    ]);

    // Función para normalizar términos eliminando acentos y caracteres especiales
    const normalizeText = (text: string) => {
      return text
        .normalize("NFD") // Descompone caracteres con tildes
        .replace(/[\u0300-\u036f]/g, "") // Remueve las tildes
        .toLowerCase();
    };

    const normalizationMap: { [key: string]: string } = {
      hombres: "hombre",
      mujeres: "mujer",
      niños: "ninos",
      nenes: "ninos",
      nena: "ninos",
      niñas: "ninos",
      niña: "ninos",
      nenas: "ninos",
      nene: "ninos",
      niño: "ninos",
      bombacha: "bombachas",
      hombre: "hombre",
      mujer: "mujer",
      alpargata: "alpargatas",
      dama: "mujer",
      damas: "mujer",
    };

    // Normalización de términos de búsqueda
    const normalizeTerm = (term: string) => {
      const lowerTerm = normalizeText(term);
      return normalizationMap[lowerTerm] || lowerTerm;
    };

    // Dividir búsqueda en palabras y eliminar palabras irrelevantes
    const keywords = searchTerm
      .split(/\s+/) // Divide por espacios
      .map(normalizeTerm) // Normaliza cada palabra
      .filter((word) => !stopWords.has(word)); // Filtra palabras irrelevantes

    let results: any[] = [];

    try {
      // Obtener todos los productos desde la base de datos
      const response = await axios.get<ProductComplete[]>(
        `${baseUrl}/products`
      );
      const products: ProductComplete[] = response.data;

      // Filtrar productos que coincidan con **todas** las palabras clave en alguna categoría o filtros
      results = products.filter((product) => {
        const combinedCategories = (product.categories || [])
          .map((category: string) => normalizeText(category))
          .join(" ");

        const combinedFilters = (product.filters || [])
          .map((filter: string) => normalizeText(filter))
          .join(" ");

        const combinedText = `${combinedCategories} ${combinedFilters}`;

        // Verificar si todas las palabras clave están en la descripción del producto
        return keywords.every((keyword) => combinedText.includes(keyword));
      });

      if (results.length > 0) {
        console.log("Resultados encontrados:", results);
        // **Desplazar al inicio antes de navegar**
        window.scrollTo({ top: 0, behavior: "smooth" });
        navigate("/all-products", { state: { results } });
      } else {
        alert("No se encontraron resultados.");
      }
    } catch (error) {
      console.error("Error al buscar productos:", error);
    }
  };

  return (
    <Container>
      <Wrapper>
        <Left>
          <Link
            to="/"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <LogoImage
              src="https://res.cloudinary.com/djovvsorv/image/upload/v1730838721/gpehr6bac6stvmcbpuqg.png"
              alt="El Mensual Logo"
            />
          </Link>
          <SearchContainerMobile onClick={() => setModalOpen(true)}>
            <Search style={{ fontSize: "24px", color: "gray" }} />
          </SearchContainerMobile>
          {isModalOpen && (
            <ModalOverlay onClick={() => setModalOpen(false)}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={() => setModalOpen(false)}>×</CloseButton>
                <h3>Buscar Productos</h3>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escribe tu búsqueda"
                />
                <SearchButton onClick={() => handleSearch(searchTerm)}>
                  Buscar
                </SearchButton>
              </ModalContent>
            </ModalOverlay>
          )}
          <SearchContainer>
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchTerm);
                }
              }}
            />
            <Search
              style={{ color: "gray", fontSize: 20, cursor: "pointer" }}
              onClick={() => handleSearch(searchTerm)}
            />
          </SearchContainer>
        </Left>
        <Center>
          {Object.keys(categories).map((mainCategory) => (
            <CategoryMenu
              key={mainCategory}
              onClick={(e) => {
                e.stopPropagation(); // Detenemos la propagación del clic desde los hijos
                handleCategoryClick(mainCategory, null, []);
              }}
            >
              {mainCategory}
              <Dropdown>
                {Object.entries(
                  categories[mainCategory as keyof typeof categories]
                ).map(([section, data]) => {
                  const isComplexSection =
                    typeof data === "object" && !Array.isArray(data);

                  return (
                    <DropdownSection key={section}>
                      <SectionTitle>{section}</SectionTitle>
                      {isComplexSection &&
                        Object.entries(data).map(([subSection, subData]) => (
                          <DropdownItem
                            key={subSection}
                            onClick={(e) => {
                              e.stopPropagation(); // Detenemos la propagación del clic
                              const subCategoryFilters = subData.filters || [];
                              handleCategoryClick(
                                mainCategory, // Hombre, Mujer, etc.
                                section, // BOMBACHAS
                                subCategoryFilters // Filtros de la subcategoría
                              );
                            }}
                          >
                            {subSection}
                            <SubDropdown className="sub-dropdown">
                              {(subData.items || []).map((product: any) => (
                                <DropdownItem
                                  key={product.displayName}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Detenemos la propagación del clic
                                    handleCategoryClick(
                                      mainCategory, // Hombre
                                      section, // BOMBACHAS
                                      product.filters // Filtros del producto
                                    );
                                  }}
                                >
                                  {product.displayName}
                                </DropdownItem>
                              ))}
                            </SubDropdown>
                          </DropdownItem>
                        ))}
                      {!isComplexSection &&
                        (data as Product[]).map((product) => (
                          <DropdownItem
                            key={product.displayName}
                            onClick={(e) => {
                              e.stopPropagation(); // Detenemos la propagación del clic
                              handleCategoryClick(
                                mainCategory, // Hombre
                                section, // PANTALONES, CAMISAS, etc.
                                product.filters
                              );
                            }}
                          >
                            {product.displayName}
                          </DropdownItem>
                        ))}
                    </DropdownSection>
                  );
                })}
              </Dropdown>
            </CategoryMenu>
          ))}
        </Center>

        <Right>
          <Link to="/all-products">
            <MenuItem>
              <Tooltip title="Ver Productos">
                <ViewList style={{ fontSize: 24 }} />
              </Tooltip>
            </MenuItem>
          </Link>
          <MenuToggle onClick={toggleMobileMenu}>
            <ViewList />
          </MenuToggle>
        </Right>
      </Wrapper>

      {/* Menú para móviles */}
      {isMobileMenuOpen && (
        <MobileMenu>
          {Object.entries(categories).map(([mainCategory, sections]) => (
            <div key={mainCategory}>
              {/* Título principal */}
              <MobileCategoryTitle
                onClick={() =>
                  setActiveCategory(
                    activeCategory === mainCategory ? null : mainCategory
                  )
                }
              >
                {mainCategory}
              </MobileCategoryTitle>

              {/* Subcategorías y elementos secundarios */}
              {activeCategory === mainCategory &&
                Object.entries(sections).map(([section, data]) => {
                  const isComplexSection =
                    typeof data === "object" && !Array.isArray(data);

                  return (
                    <div key={section}>
                      {/* Subcategoría */}
                      <MobileSubCategoryTitle
                        onClick={() =>
                          setActiveSection(
                            activeSection === section ? null : section
                          )
                        }
                      >
                        {section}
                      </MobileSubCategoryTitle>

                      {/* Elementos secundarios */}
                      {activeSection === section &&
                        (isComplexSection
                          ? Object.entries(data).map(
                              ([subSection, subData]: any) => (
                                <div key={subSection}>
                                  <MobileDropdownItem
                                    onClick={() =>
                                      handleCategoryClick(
                                        mainCategory,
                                        section,
                                        subData.filters
                                      )
                                    }
                                  >
                                    {subSection}
                                  </MobileDropdownItem>
                                  {(subData.items || []).map((product: any) => (
                                    <MobileDropdownItem
                                      key={product.displayName}
                                      onClick={() =>
                                        handleCategoryClick(
                                          mainCategory,
                                          section,
                                          [
                                            ...subData.filters,
                                            ...product.filters,
                                          ]
                                        )
                                      }
                                    >
                                      {product.displayName}
                                    </MobileDropdownItem>
                                  ))}
                                </div>
                              )
                            )
                          : (data as any[]).map((product: any) => (
                              <MobileDropdownItem
                                key={product.displayName}
                                onClick={() =>
                                  handleCategoryClick(
                                    mainCategory,
                                    section,
                                    product.filters
                                  )
                                }
                              >
                                {product.displayName}
                              </MobileDropdownItem>
                            )))}
                    </div>
                  );
                })}
            </div>
          ))}
        </MobileMenu>
      )}
    </Container>
  );
};

export default Navbar;
