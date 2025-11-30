import React from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Footer from "../components/Footer";
import { Add, DeleteOutline, Remove } from "@material-ui/icons";
import { mobile } from "../responsive";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { normalizeProductImageUrl } from "../utils/imageUrl";
import { removeProduct, updateProduct } from "../redux/cartRedux";
import { userRequest } from "../requestMethods";

// Define los tipos para los productos y el estado del carrito
interface VariantOption {
  size?: string;
  color?: string;
  stock?: number;
}

interface Product {
  cartItemId: string;
  productId?: string;
  _id: string;
  img: string;
  title: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  variants?: VariantOption[];
  availableSizes?: string[];
  availableColors?: string[];
  images?: { [key: string]: string }; // 🔥 NUEVO
}

interface CartState {
  products: Product[];
  total: number;
  quantity: number;
}

const Container = styled.div``;

const Wrapper = styled.div`
  padding: 32px 24px;
  background: #f7f7f8;
  min-height: 100vh;
  ${mobile({ padding: "16px" })}
`;

const Title = styled.div`
  font-weight: 700;
  text-align: center;
  font-size: 32px;
  letter-spacing: 0.4px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
`;

interface TopButtonProps {
  type?: "filled";
}

const TopButton = styled.button<TopButtonProps>`
  padding: 12px 18px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
  border: ${(props) =>
    props.type === "filled" ? "none" : "1px solid #d1d5db"};
  background-color: ${(props) =>
    props.type === "filled" ? "#111827" : "white"};
  color: ${(props) => (props.type === "filled" ? "white" : "#111827")};
  box-shadow: ${(props) =>
    props.type === "filled" && "0 10px 30px rgba(0,0,0,0.15)"};
`;

const TopTexts = styled.div`
  ${mobile({ display: "none" })}
`;

const TopText = styled.span`
  text-decoration: underline;
  cursor: pointer;
  margin: 0px 10px;
`;

const Bottom = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
  ${mobile({ gridTemplateColumns: "1fr" })}
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Summary = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 24px;
  background: white;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 110px;
`;

const SummaryTitle = styled.h1`
  font-weight: 700;
  font-size: 22px;
`;

interface SummaryItemProps {
  type?: "total";
}

const SummaryItem = styled.div<SummaryItemProps>`
  margin: 16px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: ${(props) => (props.type === "total" ? "700" : "500")};
  font-size: ${(props) => (props.type === "total" ? "20px" : "16px")};
  color: ${(props) => (props.type === "total" ? "#111827" : "#4b5563")};
`;

const SummaryItemText = styled.span``;

const SummaryItemPrice = styled.span``;

const Button = styled.button`
  width: 100%;
  padding: 12px 14px;
  background-color: #111827;
  color: white;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  letter-spacing: 0.4px;
  transition: transform 0.08s ease, box-shadow 0.08s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.05);
  ${mobile({ gridTemplateColumns: "1fr", padding: "14px", gap: "12px" })}
`;

const ProductDetail = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 14px;
  align-items: start;
  ${mobile({ gridTemplateColumns: "1fr", alignItems: "center" })}
`;

const Image = styled.img`
  width: 100%;
  max-width: 160px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  ${mobile({ maxWidth: "100%" })}
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const ProductName = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
`;

const ProductID = styled.span`
  font-size: 13px;
  color: #9ca3af;
`;

interface ProductColorProps {
  color: string;
}

const ProductColor = styled.div<ProductColorProps>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  border: 2px solid #e5e7eb;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.6);
`;

const mapColorNameToHex = (colorName: string): string => {
  if (!colorName) return "#000000";

  // Ej: "Beige2" -> "beige"
  const normalized = colorName.toLowerCase().replace(/[0-9]/g, "");

  const colorMap: Record<string, string> = {
    rojo: "#ff0000",
    azul: "#0000ff",
    verde: "#008000",
    amarillo: "#ffff00",
    negro: "#000000",
    blanco: "#ffffff",
    gris: "#9a98b9",
    marron: "#875833",
    rosa: "#ffc0cb",
    naranja: "#ffa500",
    beige: "#f0e5e5",
    celeste: "#5050d4",
    chocolate: "#632b00",
    marronoscuro: "#3b220f",
    tiza: "#f7ebeb",
  };

  return colorMap[normalized] || "#000000";
};

const getProductImageUrl = (product: Product) => {
  if (product.images && product.color) {
    const target = product.color.toLowerCase();
    const matchingKey = Object.keys(product.images)
      .filter((key) => key.toLowerCase().startsWith(target))
      .sort()[0];

    if (matchingKey) {
      return normalizeProductImageUrl(product.images[matchingKey]);
    }
  }

  // fallback a imagen principal
  return normalizeProductImageUrl(product.img);
};

const SelectorsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 4px;
`;

const ColorDotsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ColorDot = styled.button<{ color: string; selected: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background-color: ${({ color }) => color};
  border: ${({ selected }) =>
    selected ? "2px solid #111827" : "1px solid #e5e7eb"};
  cursor: pointer;
  padding: 0;
  outline: none;
`;

const ProductSize = styled.span`
  font-weight: 700;
`;

const VariationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const VariationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  color: #111827;
  padding: 8px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
`;

const Selector = styled.select`
  padding: 10px 12px;
  margin-top: 6px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  font-weight: 600;
  color: #111827;
`;

const SelectorLabel = styled.span`
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
  color: #6b7280;
  font-weight: 600;
`;

const PriceDetail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 10px;
  ${mobile({ alignItems: "flex-start" })}
`;

const ProductAmountContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
`;

const ProductAmount = styled.div`
  font-size: 18px;
  font-weight: 700;
  min-width: 28px;
  text-align: center;
  ${mobile({ margin: "0 6px" })}
`;

const ProductPrice = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  ${mobile({ marginBottom: "10px" })}
`;

const Hr = styled.hr`
  background-color: #f3f4f6;
  border: none;
  height: 1px;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
`;

const RemoveButton = styled.button`
  background: #fef2f2;
  border: 1px solid #fecdd3;
  color: #b91c1c;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  transition: transform 0.08s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const uniqueValues = (values: (string | undefined)[]) =>
  Array.from(new Set(values.filter(Boolean) as string[]));

const getSizeOptions = (product: Product) => {
  if (product.variants && product.variants.length) {
    return uniqueValues(product.variants.map((variant) => variant.size));
  }

  if (product.availableSizes && product.availableSizes.length) {
    return uniqueValues(product.availableSizes);
  }

  return product.size ? [product.size] : [];
};

const getColorOptions = (product: Product, size?: string) => {
  if (product.variants && product.variants.length) {
    const filtered = size
      ? product.variants.filter((variant) => variant.size === size)
      : product.variants;

    return uniqueValues(filtered.map((variant) => variant.color));
  }

  if (product.availableColors && product.availableColors.length) {
    return uniqueValues(product.availableColors);
  }

  return product.color ? [product.color] : [];
};

const getVariantStock = (product: Product, size?: string, color?: string) => {
  if (!product.variants || product.variants.length === 0) return undefined;

  const variant = product.variants.find(
    (item) => item.size === size && item.color === color
  );

  return variant?.stock;
};

const getCartItemId = (product: Product) =>
  product.cartItemId || `${product._id}-${product.size}-${product.color}`;

const Cart: React.FC = () => {
  const cart = useSelector((state: { cart: CartState }) => state.cart);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSizeChange = (product: Product, newSize: string) => {
    const colorOptions = getColorOptions(product, newSize);
    const nextColor = colorOptions.includes(product.color)
      ? product.color
      : colorOptions[0] || "";

    dispatch(
      updateProduct({
        cartItemId: getCartItemId(product),
        updates: { size: newSize, color: nextColor },
      })
    );
  };

  const handleColorChange = (product: Product, newColor: string) => {
    dispatch(
      updateProduct({
        cartItemId: getCartItemId(product),
        updates: { color: newColor },
      })
    );
  };

  const handleQuantityChange = (product: Product, delta: number) => {
    const proposedQuantity = Math.max(1, product.quantity + delta);
    const stock = getVariantStock(product, product.size, product.color);
    const quantity = stock
      ? Math.min(proposedQuantity, stock)
      : proposedQuantity;

    dispatch(
      updateProduct({
        cartItemId: getCartItemId(product),
        updates: { quantity },
      })
    );
  };

  const handleCheckout = async () => {
    if (!cart.products.length) return;

    const items = cart.products.map((product) => ({
      productId: product.productId || product._id,
      size: product.size,
      color: product.color,
      quantity: product.quantity,
    }));

    try {
      const response = await userRequest.post("/checkout", {
        items,
        paymentMetadata: { source: "web" },
      });

      const { checkoutUrl, orderId } = response.data;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      navigate(`/checkout/result?orderId=${orderId}`);
    } catch (error) {
      console.error("Error al crear la orden", error);
      alert("No se pudo crear la orden. Revisa el stock e intenta nuevamente.");
    }
  };

  return (
    <Container>
      <Navbar />
      <Announcement />
      <Wrapper>
        <Title>TU CARRITO</Title>
        <Top>
          <TopButton onClick={() => navigate("/")}>
            CONTINUA COMPRANDO
          </TopButton>
          <TopTexts>
            <TopText>Carrito de compra({cart.products.length})</TopText>
            <TopText>Tu lista deseada</TopText>
          </TopTexts>
          <TopButton type="filled" onClick={handleCheckout}>
            COMPRAR
          </TopButton>
        </Top>
        <Bottom>
          <Info>
            {cart.products.map((product) => (
              <ProductContainer key={getCartItemId(product)}>
                <ProductDetail>
                  <Image src={normalizeProductImageUrl(product.img)} />
                  <Details>
                    <ProductHeader>
                      <div>
                        <ProductName>{product.title}</ProductName>
                      </div>
                    </ProductHeader>

                    <VariationRow>
                      <VariationBadge>
                        <span>Talle</span>
                        <ProductSize>{product.size}</ProductSize>
                      </VariationBadge>
                      <VariationBadge>
                        <span>Color</span>
                        <ProductColor
                          color={mapColorNameToHex(product.color)}
                        />
                        <span style={{ textTransform: "capitalize" }}>
                          {product.color}
                        </span>
                      </VariationBadge>
                    </VariationRow>

                    <SelectorsRow>
                      <div>
                        <SelectorLabel>Talle</SelectorLabel>
                        <Selector
                          value={product.size}
                          onChange={(e) =>
                            handleSizeChange(product, e.target.value)
                          }
                        >
                          {getSizeOptions(product).map((size) => (
                            <option
                              key={`${product.cartItemId}-${size}`}
                              value={size}
                            >
                              {size}
                            </option>
                          ))}
                        </Selector>
                      </div>

                      <div>
                        <SelectorLabel>Color</SelectorLabel>
                        <ColorDotsRow>
                          {getColorOptions(product, product.size).map(
                            (optionColor) => (
                              <ColorDot
                                key={`${product.cartItemId}-${optionColor}`}
                                color={mapColorNameToHex(optionColor)}
                                selected={optionColor === product.color}
                                onClick={() =>
                                  handleColorChange(product, optionColor)
                                }
                                aria-label={optionColor}
                              />
                            )
                          )}
                        </ColorDotsRow>
                      </div>
                    </SelectorsRow>
                  </Details>
                </ProductDetail>
                <PriceDetail>
                  <RemoveButton
                    onClick={() =>
                      dispatch(
                        removeProduct({
                          cartItemId: getCartItemId(product),
                        })
                      )
                    }
                    aria-label={`Eliminar ${product.title} del carrito`}
                  >
                    <DeleteOutline style={{ fontSize: 18 }} />
                    Borrar
                  </RemoveButton>

                  <ProductAmountContainer>
                    <Add
                      style={{ cursor: "pointer" }}
                      onClick={() => handleQuantityChange(product, 1)}
                    />
                    <ProductAmount>{product.quantity}</ProductAmount>
                    <Remove
                      style={{ cursor: "pointer" }}
                      onClick={() => handleQuantityChange(product, -1)}
                    />
                  </ProductAmountContainer>

                  <ProductPrice>
                    $ {product.price * product.quantity}
                  </ProductPrice>
                </PriceDetail>
              </ProductContainer>
            ))}
            <Hr />
          </Info>
          <Summary>
            <SummaryTitle>RESUMEN DE ORDEN</SummaryTitle>
            <SummaryItem>
              <SummaryItemText>Subtotal</SummaryItemText>
              <SummaryItemPrice>$ {cart.total}</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem>
              <SummaryItemText>Envio Estimado</SummaryItemText>
              <SummaryItemPrice>$ 5.90</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem>
              <SummaryItemText>Descuento de Envio</SummaryItemText>
              <SummaryItemPrice>$ -5.90</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem type="total">
              <SummaryItemText>Total</SummaryItemText>
              <SummaryItemPrice>$ {cart.total}</SummaryItemPrice>
            </SummaryItem>
            <Button onClick={handleCheckout}>COMPRAR AHORA</Button>
          </Summary>
        </Bottom>
      </Wrapper>
      <Footer />
    </Container>
  );
};

export default Cart;
