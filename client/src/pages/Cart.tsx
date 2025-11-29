import React from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Footer from "../components/Footer";
import { Add, Remove } from "@material-ui/icons";
import { mobile } from "../responsive";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { normalizeProductImageUrl } from "../utils/imageUrl";
import { updateProduct } from "../redux/cartRedux";
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
}

interface CartState {
  products: Product[];
  total: number;
  quantity: number;
}

const Container = styled.div``;

const Wrapper = styled.div`
  padding: 20px;
  ${mobile({ padding: "10px" })}
`;

const Title = styled.div`
  font-weight: 300;
  text-align: center;
  font-size: 40px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
`;

interface TopButtonProps {
  type?: "filled";
}

const TopButton = styled.button<TopButtonProps>`
  padding: 10px;
  font-weight: 600;
  cursor: pointer;
  border: ${(props) => props.type === "filled" && "none"};
  background-color: ${(props) =>
    props.type === "filled" ? "black" : "transparent"};
  color: ${(props) => props.type === "filled" && "white"};
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
  display: flex;
  justify-content: space-between;
  ${mobile({ flexDirection: "column" })}
`;

const Info = styled.div`
  flex: 3;
`;

const Summary = styled.div`
  flex: 1;
  border: 0.5px solid lightgray;
  border-radius: 10px;
  padding: 20px;
  height: 50vh;
`;

const SummaryTitle = styled.h1`
  font-weight: 200;
`;

interface SummaryItemProps {
  type?: "total";
}

const SummaryItem = styled.div<SummaryItemProps>`
  margin: 30px 0px;
  display: flex;
  justify-content: space-between;
  font-weight: ${(props) => props.type === "total" && "500"};
  font-size: ${(props) => props.type === "total" && "24px"};
`;

const SummaryItemText = styled.span``;

const SummaryItemPrice = styled.span``;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: black;
  color: white;
  font-weight: 600;
  cursor: pointer;
`;

const ProductContainer = styled.div`
  display: flex;
  justify-content: space-between;
  ${mobile({ flexDirection: "column" })}
`;

const ProductDetail = styled.div`
  flex: 2;
  display: flex;
`;

const Image = styled.img`
  width: 200px;
`;

const Details = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const ProductName = styled.span``;

const ProductID = styled.span``;

interface ProductColorProps {
  color: string;
}

const ProductColor = styled.div<ProductColorProps>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

const ProductSize = styled.span``;

const Selector = styled.select`
  padding: 8px 12px;
  margin-top: 6px;
`;

const SelectorLabel = styled.span`
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
`;

const PriceDetail = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ProductAmountContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ProductAmount = styled.div`
  font-size: 24px;
  margin: 5px;
  ${mobile({ margin: "5px 15px" })}
`;

const ProductPrice = styled.div`
  font-size: 30px;
  ${mobile({ marginBottom: "20px" })}
`;

const Hr = styled.hr`
  background-color: #eee;
  border: none;
  height: 1px;
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
                    <ProductName>
                      <b>Producto:</b> {product.title}
                    </ProductName>
                    <ProductID>
                      <b>ID:</b> {product._id}
                    </ProductID>
                    <ProductColor color={product.color} />
                    <div>
                      <SelectorLabel>Tamaño</SelectorLabel>
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
                      <Selector
                        value={product.color}
                        onChange={(e) =>
                          handleColorChange(product, e.target.value)
                        }
                      >
                        {getColorOptions(product, product.size).map((color) => (
                          <option
                            key={`${product.cartItemId}-${color}`}
                            value={color}
                          >
                            {color}
                          </option>
                        ))}
                      </Selector>
                    </div>
                  </Details>
                </ProductDetail>
                <PriceDetail>
                  <ProductAmountContainer>
                    <Add onClick={() => handleQuantityChange(product, 1)} />
                    <ProductAmount>{product.quantity}</ProductAmount>
                    <Remove onClick={() => handleQuantityChange(product, -1)} />
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
