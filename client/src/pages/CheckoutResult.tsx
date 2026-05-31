import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Footer from "../components/Footer";
import { userRequest } from "../requestMethods";
import { mobile } from "../responsive";

interface OrderItem {
  productId: string;
  title?: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
}

interface OrderResponse {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  status: string;
  paymentMetadata?: Record<string, unknown>;
  createdAt?: string;
}

const Container = styled.div``;

const Wrapper = styled.div`
  min-height: 60vh;
  padding: 20px;
  ${mobile({ padding: "12px" })}
`;

const Title = styled.h1`
  font-weight: 400;
  text-align: center;
  margin-bottom: 12px;
`;

const StatusBadge = styled.span<{ variant: string }>`
  display: inline-block;
  padding: 8px 14px;
  border-radius: 12px;
  text-transform: capitalize;
  background: ${({ variant }) =>
    variant === "approved"
      ? "#e8f5e9"
      : variant === "failed"
      ? "#ffebee"
      : "#fff3e0"};
  color: ${({ variant }) =>
    variant === "approved"
      ? "#2e7d32"
      : variant === "failed"
      ? "#c62828"
      : "#ef6c00"};
`;

const OrderInfo = styled.div`
  max-width: 720px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const SectionTitle = styled.h3`
  margin: 16px 0 8px;
  font-weight: 500;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  ${mobile({ flexDirection: "column" })}
`;

const ButtonsRow = styled.div`
  margin-top: 18px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: ${({ variant }) => (variant === "secondary" ? "#111" : "white")};
  background: ${({ variant }) =>
    variant === "secondary" ? "#e0e0e0" : "#111"};
`;

const HelperText = styled.p`
  margin: 12px 0;
  color: #555;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-top: 10px;
`;

const statusMessages: Record<string, string> = {
  approved: "¡Pago aprobado! Estamos preparando tu pedido.",
  pending:
    "Estamos validando el pago. Si el estado tarda en actualizarse, puedes volver a intentarlo.",
  failed:
    "El pago no se completó. Puedes intentar nuevamente desde tu carrito.",
};

const pollingStatuses = new Set(["pending", "processing"]);

const CheckoutResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const statusHint = searchParams.get("status") || "pending";
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const statusVariant = useMemo(() => {
    if (order?.status) return order.status;
    return statusHint;
  }, [order?.status, statusHint]);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userRequest.get(`/orders/${orderId}`);
        setOrder(response.data);

        if (
          pollingStatuses.has((response.data.status || "").toLowerCase()) &&
          pollCount < 5
        ) {
          setTimeout(() => setPollCount((current) => current + 1), 2500);
        }
      } catch (err) {
        console.error("No se pudo obtener la orden", err);
        setError("No se pudo cargar la orden. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, pollCount]);

  if (!orderId) {
    return (
      <Container>
        <Navbar />
        <Announcement />
        <Wrapper>
          <Title>Orden no encontrada</Title>
          <HelperText>
            Agrega productos al carrito para iniciar un pago.
          </HelperText>
          <ButtonsRow>
            <Button onClick={() => navigate("/")}>Volver al inicio</Button>
          </ButtonsRow>
        </Wrapper>
        <Footer />
      </Container>
    );
  }

  return (
    <Container>
      <Navbar />
      <Announcement />
      <Wrapper>
        <Title>Resultado de tu compra</Title>
        <OrderInfo>
          <StatusBadge variant={statusVariant}>{statusVariant}</StatusBadge>
          <HelperText>
            {statusMessages[statusVariant] || statusMessages.pending}
          </HelperText>

          <SectionTitle>Resumen de la orden</SectionTitle>
          {loading && <HelperText>Actualizando estado...</HelperText>}
          {error && <HelperText>{error}</HelperText>}
          {!loading && order && (
            <div>
              {order.items.map((item) => (
                <ItemRow key={`${item.productId}-${item.size}-${item.color}`}>
                  <div>
                    <strong>{item.title || "Producto"}</strong>
                    <div style={{ color: "#555", fontSize: "14px" }}>
                      {item.size && `Talle: ${item.size} `}
                      {item.color && `Color: ${item.color}`}
                    </div>
                  </div>
                  <div>
                    x{item.quantity} — ${item.price * item.quantity}
                  </div>
                </ItemRow>
              ))}
              <SummaryRow>
                <span>Total</span>
                <span>${order.subtotal}</span>
              </SummaryRow>
            </div>
          )}

          <ButtonsRow>
            <Button onClick={() => navigate("/")}>Seguir comprando</Button>
            <Button
              variant="secondary"
              onClick={() => setPollCount((c) => c + 1)}
            >
              Reintentar actualización
            </Button>
          </ButtonsRow>
        </OrderInfo>
      </Wrapper>
      <Footer />
    </Container>
  );
};

export default CheckoutResult;
