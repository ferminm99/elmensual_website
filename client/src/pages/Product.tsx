import React, { useEffect, useState } from "react";
import styled from "styled-components";
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

const Container = styled.div`
  background-color: #f5f5f5;
  padding: 20px 0; /* Añadimos algo de padding para que no esté pegado al borde */
`;

const Wrapper = styled.div`
  padding: 50px;
  width: 50%; /* Ocupa el 50% del ancho de la pantalla */
  margin: 0 auto; /* Centra horizontalmente */
  display: flex;
  ${mobile({ padding: "10px", flexDirection: "column", width: "90%" })}
`;

const ImgContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background-color: #e0e0e0;
  border-radius: 8px;
  padding: 20px;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-right: 10px;
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

const Image = styled.img<{ zoomed: boolean }>`
  width: 100%;
  height: 100%;
  max-height: 600px;
  object-fit: contain;
  cursor: ${({ zoomed }) => (zoomed ? "zoom-out" : "zoom-in")};
  transform: ${({ zoomed }) => (zoomed ? "scale(1.5)" : "scale(1)")};
  transition: transform 0.3s ease;
  ${mobile({ height: "40vh" })}
`;

const ArrowContainer = styled.div<{ direction: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ direction }) => (direction === "left" ? "left: 10px" : "right: 10px")};
  cursor: pointer;
  z-index: 2;
`;

const InfoContainer = styled.div`
  flex: 1;
  padding: 0px 50px;
  ${mobile({ padding: "10px" })}
`;

const Title = styled.h1`
  font-weight: 300;
  font-size: 32px;
`;

const Desc = styled.p`
  margin: 20px 0px;
  font-size: 16px;
  color: #555;
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
  gap: 20px;
  ${mobile({ width: "100%" })}
`;

const Filter = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterTitle = styled.span`
  font-size: 20px;
  font-weight: 200;
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
  padding: 5px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const FilterSizeOption = styled.option`
  font-size: 15px;
`;

const AddContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  gap: 20px;
  ${mobile({ width: "100%" })}
`;

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
`;

const Amount = styled.span`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: flex;
  border: 1px solid teal;
  align-items: center;
  justify-content: center;
  margin: 0px 5px;
`;

const Button = styled.button`
  padding: 15px;
  border: 2px solid teal;
  background-color: white;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    background-color: #f8f4f4;
  }
`;

const Product: React.FC = () => {
  const location = useLocation();
  const id = location.pathname.split("/")[2];
  const [product, setProduct] = useState<ProductType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const [colorImages, setColorImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const getProduct = async () => {
      try {
        const res = await publicRequest.get("/products/find/" + id);
        setProduct(res.data);

        const colors = Object.keys(res.data.images).map((color) =>
          color.replace(/\d+/g, "")
        );
        setColor(colors[0]);
        updateColorImages(colors[0], res.data.images);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    getProduct();
  }, [id]);

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

  const handleQuantity = (type: "inc" | "dec") => {
    if (type === "dec") {
      quantity > 1 && setQuantity(quantity - 1);
    } else {
      setQuantity(quantity + 1);
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

  const toggleZoom = () => setZoomed(!zoomed);

  const translateColor = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      rojo: "#FF0000",
      azul: "#0000FF",
      verde: "#008000",
      amarillo: "#FFFF00",
      negro: "#000000",
      blanco: "#FFFFFF",
      gris: "#808080",
      marron: "#875833",
      rosa: "#FFC0CB",
      naranja: "#FFA500",
    };

    return colorMap[colorName.toLowerCase()] || "#000000"; // Devuelve negro por defecto
  };

  return (
    <Container>
      <Navbar />
      <Announcement />
      <Wrapper>
        {product ? (
          <>
            <ThumbnailContainer>
              {colorImages.map((img, index) => (
                <Thumbnail
                  key={index}
                  src={img}
                  onClick={() => setCurrentImageIndex(index)}
                  className={index === currentImageIndex ? "active" : ""}
                />
              ))}
            </ThumbnailContainer>
            <ImgContainer>
              {colorImages.length > 1 && (
                <ArrowContainer
                  direction="left"
                  onClick={() => handleImageNavigation("left")}
                >
                  <ArrowBackIos />
                </ArrowContainer>
              )}
              <Image
                src={colorImages[currentImageIndex]}
                zoomed={zoomed}
                onClick={toggleZoom}
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
              <Desc>{product.desc}</Desc>
              <Price>$ {product.price}</Price>
              <FilterContainer>
                <Filter>
                  <FilterTitle>Color</FilterTitle>
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
                <AmountContainer>
                  <Remove onClick={() => handleQuantity("dec")} />
                  <Amount>{quantity}</Amount>
                  <Add onClick={() => handleQuantity("inc")} />
                </AmountContainer>
                <Button onClick={handleClick}>AGREGAR AL CARRITO</Button>
              </AddContainer>
            </InfoContainer>
          </>
        ) : (
          <p>Cargando producto...</p>
        )}
      </Wrapper>
      <Newsletter />
      <Footer />
    </Container>
  );
};

export default Product;
