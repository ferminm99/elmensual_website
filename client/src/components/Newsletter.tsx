import { Send } from "@material-ui/icons";
import React, { useState } from "react";
import styled from "styled-components";
import { mobile } from "../responsive";

const Container = styled.div`
  height: 60vh;
  background-color: #fcf5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const Title = styled.h1`
  font-size: 70px;
  margin-bottom: 20px;
`;
const InputContainer = styled.div`
  width: 50%;
  height: 40px;
  background-color: white;
  display: flex;
  justify-content: space-between;
  border: 1px solid lightgray;
  ${mobile({ width: "80%" })}
`;

const Input = styled.input`
  border: none;
  flex: 8;
  padding-left: 20px;
`;

const Button = styled.button`
  flex: 1;
  border: none;
  background-color: teal;
  color: white;
`;

const Desc = styled.div`
  font-size: 24px;
  font-weight: 300;
  margin-bottom: 20px;
  ${mobile({ textAlign: "center" })}
`;
const Newsletter: React.FC = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message) {
      alert("Por favor, escribe tu mensaje.");
      return;
    }

    // Construir el enlace mailto
    const mailtoLink = `mailto:lamotex@elmensual.com.ar?subject=Consulta desde Pagina Web&body=${encodeURIComponent(
      `${message}`
    )}`;

    // Abrir el cliente de correo
    window.location.href = mailtoLink;
  };

  return (
    <Container>
      <Title>Contactanos</Title>
      <Desc>Ponete en contacto para comprar por mayor!</Desc>
      <InputContainer>
        <Input
          type="text"
          placeholder="Tu mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handleSend}>
          <Send />
        </Button>
      </InputContainer>
    </Container>
  );
};

export default Newsletter;
