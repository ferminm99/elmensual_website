import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { Add, Remove, ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";
import { mobile } from "../responsive";
import { useLocation } from "react-router-dom";
import { publicRequest } from "../requestMethods";
import { addProduct } from "../redux/cartRedux";
import { useDispatch } from "react-redux";
import { Product as ProductType } from "../types";
import { createGlobalStyle } from "styled-components";
import { useCachedFetch } from "../hooks/useCachedFetch";
import { useContainerWidth } from "../utils/useContainerWidth";

const Container = styled.div`
  margin-top: 90px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  height: 100vh; /* Pantalla completa */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white; /* Fondo opcional */
`;

const SpinnerWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpinnerCircle = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  top: 0;
  left: 0;
`;

const Logo = styled.img`
  width: 80px; /* Podés ajustar el tamaño */
  height: 80px;
  object-fit: contain;
  /* animation: ${spin} 2s linear infinite; */
  position: relative;
  z-index: 2; /* Asegura que esté encima del spinner */
`;

const Wrapper = styled.div`
  padding: 50px;
  max-width: 65%; /* Amplía el ancho máximo */
  margin: 0 auto;
  display: flex;
  gap: 30px; /* Ajusta el espacio entre las columnas */

  ${mobile({
    flexDirection: "column-reverse", // Título arriba, imagen abajo
    padding: "20px",
  })}
`;

const ImgContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #e0e0e0;
  /* background-color: transparent; */
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  aspect-ratio: 3 / 4; /* 🔥 NUEVO: en vez de height fijo */
  width: 100%; /* 🔥 Siempre ocupar el ancho disponible */

  ${mobile({
    order: 2,
    marginBottom: "20px",
  })}
`;

const GlobalStyles = createGlobalStyle`
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: center; /* Centra los valores de todas las celdas */
  }
`;

const ThumbnailContainer = styled.div`
  display: flex;
  flex-direction: column; /* Columna por defecto */
  gap: 10px;
  margin-right: 10px;

  ${mobile({
    flexDirection: "row", // Cambia a fila en móviles
    justifyContent: "center", // Centra las miniaturas
    marginTop: "10px", // Añade espacio entre la imagen y miniaturas
    marginRight: "0",
    order: 2,
  })}
`;

const Thumbnail = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: #333;
  }
`;

const Image = styled.img<{ $zoomed: boolean; $transformOrigin: string }>`
  width: 100%; /* Asegura que la imagen tome todo el ancho */
  height: 100%; /* Asegura que la imagen tome todo el alto */
  object-fit: contain; /* Ajusta la imagen dentro del contenedor sin recortar */
  cursor: ${({ $zoomed }) => ($zoomed ? "zoom-out" : "zoom-in")};
  transform: ${({ $zoomed }) => ($zoomed ? "scale(1.5)" : "scale(1)")};
  transform-origin: ${({ $transformOrigin }) => $transformOrigin};
  transition: transform 0.3s ease, transform-origin 0.3s ease;
`;

const ArrowContainer = styled.div<{ direction: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ direction }) => (direction === "left" ? "left: 0" : "right: 0")};
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; /* 🔥 aseguramos que NO tenga fondo */
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;

  &:hover {
    background: transparent; /* 🔥 nada en hover */
  }

  & svg {
    background: transparent; /* 🔥 los íconos también */
  }

  ${mobile({
    width: "50px",
    height: "50px",
  })}
`;

const InfoContainer = styled.div`
  flex: 1;
  padding: 0px 50px;

  ${mobile({
    padding: "10px",
  })}
`;

const Title = styled.h1`
  font-size: 30px;
  font-weight: 400;
  margin-bottom: 20px;

  ${mobile({
    order: 1,
  })}
`;

const Desc = styled.p`
  margin: 20px 0;
  font-size: 16px;
  color: #555;
  line-height: 1.5;
`;

const Price = styled.span`
  font-weight: 700;
  font-size: 36px;
  color: #333;
`;

const FilterContainer = styled.div`
  width: 100%;
  margin: 30px 0px;
  display: flex;
  flex-direction: column; /* Filtros alineados verticalmente */
  gap: 20px;
  ${mobile({ width: "100%" })}
`;

const Filter = styled.div`
  display: flex;
  flex-direction: column; /* Cambia a columna */
  align-items: flex-start; /* Alinea los elementos al inicio horizontalmente */
  gap: 10px; /* Espacio entre el título y los elementos */

  ${mobile({
    flexDirection: "column",
    alignItems: "flex-start",
  })}/* En móviles, cambia a columna */
`;

const FilterTitle = styled.span`
  font-size: 20px;
  font-weight: 200;
  margin-bottom: 5px; /* Añade espacio debajo del título */
`;

const FilterColor = styled.div<{ color: string; selected: boolean }>`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  cursor: pointer;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  border: ${({ selected }) => (selected ? "2px solid #333" : "none")};
`;

const FilterSize = styled.select`
  width: 100%; /* Ocupa todo el ancho */
  padding: 15px; /* Similar al botón */
  font-size: 16px;
  border: 2px solid #ddd; /* Bordes más definidos */
  border-radius: 5px; /* Bordes redondeados */
  background-color: #f9f9f9; /* Fondo claro */
  text-align: left;
  outline: none;

  &:hover {
    border-color: #555; /* Cambio de borde al pasar el mouse */
  }

  &:focus {
    border-color: #333; /* Borde al enfocarse */
  }
`;

const FilterColorsContainer = styled.div`
  display: flex;
  gap: 10px; /* Espacio entre los círculos de color */
`;

const FilterSizeOption = styled.option`
  font-size: 16px;
  color: #333;
  background-color: white;
`;

const AddContainer = styled.div`
  display: flex;
  flex-direction: column; /* Alinea los elementos verticalmente */
  align-items: flex-start; /* Alinea los elementos al inicio horizontal */
  gap: 15px; /* Espacio entre los elementos */
  width: 100%; /* Asegura que use todo el ancho disponible */
  ${mobile({ width: "100%" })}
`;

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; /* Espacio entre los botones y el número */
`;

const Amount = styled.span`
  width: 40px;
  height: 40px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid teal;
  font-size: 16px;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #333;
  color: #fff;
  &:hover {
    background: #555;
  }
`;

interface ContactModalProps {
  contactType: "minorista" | "mayorista" | "";
  onClose: () => void;
  onSelectContactType: (type: "minorista" | "mayorista") => void;
  handleWhatsAppContact: () => void;
  handleEmailContact: () => void;
  handleInstagramContact: () => void;
}

// AGREGADO: utilidad para optimizar imágenes
const optimizedImageCache: Record<string, string> = {};

const getOptimizedCloudinaryURL = (
  url: string | undefined,
  width: number = 800
) => {
  if (!url || typeof url !== "string" || !url.includes("/upload/"))
    return url || "";

  const key = `${url}-w${width}`;
  if (optimizedImageCache[key]) return optimizedImageCache[key];

  // Partimos en '/upload/'
  const [prefix, rest] = url.split("/upload/");
  // rest = "<posibles-transformaciones>/<public_id...>"

  // Tomamos el primer segmento de 'rest' hasta la primera '/'
  const firstSlash = rest.indexOf("/");
  const maybeTransforms = firstSlash !== -1 ? rest.slice(0, firstSlash) : rest;
  const hasTransforms =
    maybeTransforms.includes(",") ||
    maybeTransforms.includes("_") ||
    maybeTransforms.includes(":");

  let newUrl: string;

  if (hasTransforms) {
    // Ya hay transformaciones (p.ej. "c_pad,ar_3:4,b_auto:predominant")
    const existingTransforms = maybeTransforms;
    const restWithoutTransforms =
      firstSlash !== -1 ? rest.slice(firstSlash + 1) : "";
    newUrl = `${prefix}/upload/${existingTransforms},w_${width},f_auto,q_auto/${restWithoutTransforms}`;
  } else {
    // No hay transformaciones todavía
    newUrl = `${prefix}/upload/w_${width},f_auto,q_auto/${rest}`;
  }

  optimizedImageCache[key] = newUrl;
  return newUrl;
};

export const LoadingScreen = () => {
  return (
    <LoadingContainer>
      <SpinnerWrapper>
        <SpinnerCircle />
        <Logo
          src="https://res.cloudinary.com/djovvsorv/image/upload/v1730838721/gpehr6bac6stvmcbpuqg.png"
          alt="Loading..."
        />
      </SpinnerWrapper>
    </LoadingContainer>
  );
};

const Product: React.FC = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const { data: product, loading } = useCachedFetch<ProductType>(
    `/products/find/${id}`,
    `product_${id}`
  );
  const { ref: imgContainerRef, width: imageWidth } = useContainerWidth();
  const { ref: thumbnailRef, width: thumbnailWidth } = useContainerWidth();

  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const [colorImages, setColorImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const [isExpanded, setIsExpanded] = useState(false);
  const description = product?.desc || "";
  const [showModal, setShowModal] = useState(false);
  const [contactType, setContactType] = useState<
    "minorista" | "mayorista" | ""
  >("");

  const dispatch = useDispatch();

  // Funciones de contacto
  const handleWhatsAppContact = () => {
    const phoneNumber = "2345687094";
    const message = encodeURIComponent(
      contactType === "minorista"
        ? `¡Hola! Estoy interesado en este producto.`
        : `Hola, estoy interesado en comprar al por mayor. ¿Podrían darme más información?`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent(
      `Consulta para ${contactType === "minorista" ? "productos" : "mayorista"}`
    );
    const body = encodeURIComponent(
      contactType === "minorista"
        ? `¡Hola! Estoy interesado en este producto.`
        : `Hola, quisiera información sobre compras al por mayor.`
    );
    window.open(
      `mailto:administracion@elmensual.com.ar?subject=${subject}&body=${body}`,
      "_blank"
    );
  };

  const handleInstagramContact = () => {
    window.open(`https://instagram.com/elmensual_laplata`, "_blank");
  };

  const closeModal = () => setShowModal(false);

  // Divide la descripción en dos partes usando "Guía de talles" como delimitador
  const splitPoint = description.indexOf("Guía de talles:");
  const firstPart =
    splitPoint !== -1
      ? description.slice(0, splitPoint + "Guía de talles:".length)
      : description;
  const secondPart =
    splitPoint !== -1
      ? description.slice(splitPoint + "Guía de talles:".length)
      : "";

  useEffect(() => {
    window.scrollTo(0, 0); // Desplaza la página al inicio
  }, []);

  useEffect(() => {
    if (product && product.images) {
      const colors = Object.keys(product.images).map((color) =>
        color.replace(/\d+/g, "")
      );
      setColor(colors[0]);
      updateColorImages(colors[0], product.images);
    }
  }, [product]);

  const updateColorImages = (
    selectedColor: string,
    images: { [key: string]: string }
  ) => {
    const filteredImages = Object.keys(images)
      .filter((key) => key.startsWith(selectedColor))
      .map((key) => images[key]);
    setColorImages(filteredImages);
    setCurrentImageIndex(0);
  };

  const handleColorChange = (selectedColor: string) => {
    setColor(selectedColor);
    if (product) {
      updateColorImages(selectedColor, product.images);
    }
  };

  const handleImageNavigation = (direction: "left" | "right") => {
    if (direction === "left") {
      setCurrentImageIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : colorImages.length - 1
      );
    } else {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < colorImages.length - 1 ? prevIndex + 1 : 0
      );
    }
  };

  const handleClick = () => {
    if (product) {
      const completeProduct = {
        ...product,
        quantity,
        color,
        size,
      };
      dispatch(addProduct(completeProduct));
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (window.innerWidth <= 768) return; // 🔥 Si es celular, no hacemos nada
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100; // Porcentaje X
    const y = ((e.clientY - top) / height) * 100; // Porcentaje Y
    setTransformOrigin(`${x}% ${y}%`); // Ajusta el origen del zoom
    setZoomed(!zoomed);
  };

  const toggleZoom = () => setZoomed(!zoomed);

  const translateColor = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      rojo: "#FF0000",
      azul: "#0000FF",
      verde: "#008000",
      amarillo: "#FFFF00",
      negro: "#000000",
      blanco: "#FFFFFF",
      gris: "#9a98b9",
      marron: "#875833",
      rosa: "#FFC0CB",
      naranja: "#FFA500",
      beige: "#f0e5e5",
      celeste: "#5050d4",
      chocolate: "#632b00",
      marronoscuro: "#3b220f",
      tiza: "#f7ebeb",
    };

    return colorMap[colorName.toLowerCase()] || "#000000"; // Devuelve negro por defecto
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <GlobalStyles />
      <Container>
        <Navbar />
        {/* <Announcement /> */}
        <Wrapper>
          {product ? (
            <>
              <ThumbnailContainer ref={thumbnailRef}>
                {colorImages.map((img, index) => (
                  <Thumbnail
                    key={index}
                    src={getOptimizedCloudinaryURL(img, thumbnailWidth)} // ⬅️ Tamaño chiquito
                    onClick={() => setCurrentImageIndex(index)}
                    className={index === currentImageIndex ? "active" : ""}
                  />
                ))}
              </ThumbnailContainer>
              <ImgContainer ref={imgContainerRef}>
                {colorImages.length > 1 && (
                  <ArrowContainer
                    direction="left"
                    onClick={() => handleImageNavigation("left")}
                  >
                    <ArrowBackIos />
                  </ArrowContainer>
                )}
                <Image
                  src={getOptimizedCloudinaryURL(
                    colorImages[currentImageIndex],
                    imageWidth
                  )}
                  $zoomed={zoomed}
                  $transformOrigin={transformOrigin}
                  onClick={handleImageClick}
                />

                {colorImages.length > 1 && (
                  <ArrowContainer
                    direction="right"
                    onClick={() => handleImageNavigation("right")}
                  >
                    <ArrowForwardIos />
                  </ArrowContainer>
                )}
              </ImgContainer>
              <InfoContainer>
                <Title>{product.title}</Title>

                <FilterContainer>
                  <Filter>
                    <FilterTitle>Color</FilterTitle>
                    <FilterColorsContainer>
                      {Object.keys(product.images)
                        .map((key) => key.replace(/\d+/g, ""))
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map((uniqueColor) => (
                          <FilterColor
                            color={translateColor(uniqueColor)}
                            key={uniqueColor}
                            onClick={() => handleColorChange(uniqueColor)}
                            selected={color === uniqueColor}
                          />
                        ))}
                    </FilterColorsContainer>
                  </Filter>
                  <Filter>
                    <FilterTitle>Tamaño</FilterTitle>
                    <FilterSize onChange={(e) => setSize(e.target.value)}>
                      {product.size.map((s) => (
                        <FilterSizeOption key={s}>{s}</FilterSizeOption>
                      ))}
                    </FilterSize>
                  </Filter>
                </FilterContainer>
                <AddContainer>
                  {/* <AmountContainer>
                  <Remove onClick={() => handleQuantity("dec")} />
                  <Amount>{quantity}</Amount>
                  <Add onClick={() => handleQuantity("inc")} />
                </AmountContainer> */}
                  <Button onClick={() => setShowModal(true)}>CONTACTAR</Button>
                </AddContainer>
                <Desc>
                  <div>
                    {/* Renderiza siempre la descripción hasta e incluyendo "Guía de talles" */}
                    <div dangerouslySetInnerHTML={{ __html: firstPart }} />

                    {/* Botón para mostrar/ocultar la segunda parte (tabla o contenido extra) */}
                    {!isExpanded && (
                      <button
                        onClick={() => setIsExpanded(true)}
                        style={{
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          color: "blue",
                          textDecoration: "underline",
                          marginTop: "10px",
                        }}
                      >
                        Ver más ▼
                      </button>
                    )}

                    {/* Si está expandido, se muestra el contenido extra */}
                    {isExpanded && (
                      <div>
                        <div dangerouslySetInnerHTML={{ __html: secondPart }} />
                        <button
                          onClick={() => setIsExpanded(false)}
                          style={{
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            color: "blue",
                            textDecoration: "underline",
                            marginTop: "10px",
                          }}
                        >
                          Ver menos ▲
                        </button>
                      </div>
                    )}
                  </div>
                </Desc>
              </InfoContainer>
            </>
          ) : (
            <p>Cargando producto...</p>
          )}
        </Wrapper>

        {/* Modal de selección de contacto */}
        {showModal && (
          <>
            <Overlay onClick={closeModal} />
            <Modal>
              <h2>Selecciona tu tipo de consulta</h2>
              <Button onClick={() => setContactType("minorista")}>
                Minorista
              </Button>
              <Button onClick={() => setContactType("mayorista")}>
                Mayorista
              </Button>

              {contactType === "minorista" && (
                <>
                  <h3>Opciones de contacto:</h3>
                  <Button onClick={handleInstagramContact}>Instagram</Button>
                </>
              )}

              {contactType === "mayorista" && (
                <>
                  <h3>Opciones de contacto:</h3>
                  <Button onClick={handleWhatsAppContact}>WhatsApp</Button>
                  <Button onClick={handleEmailContact}>
                    Correo Electrónico
                  </Button>
                </>
              )}

              <Button onClick={closeModal}>Cancelar</Button>
            </Modal>
          </>
        )}
        <Newsletter />
        <Footer />
      </Container>
    </div>
  );
};

export default Product;
