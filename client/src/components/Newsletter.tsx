import { Send } from "@material-ui/icons";
import React, { useState } from "react";
import styled from "styled-components";
import { mobile } from "../responsive";

const Container = styled.div`
  height: 60vh;
  background-color: #eeeeee; /* Fondo gris */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 70px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2b2b2b; /* Color del texto */
`;

const Desc = styled.p`
  font-size: 24px;
  font-weight: 300;
  margin-bottom: 40px; /* Más separación */
  color: #555;
  ${mobile({ textAlign: "center", marginBottom: "20px" })}
`;

const InputContainer = styled.div`
  width: 50%;
  height: 50px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  border: 1px solid #ddd;
  border-radius: 8px; /* Bordes redondeados */
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sutil sombra */
  ${mobile({ width: "80%" })}
`;

const Input = styled.input`
  border: none;
  flex: 8;
  padding-left: 20px;
  font-size: 16px;
  color: #333;

  &:focus {
    outline: none;
  }
`;

const Button = styled.button`
  flex: 1;
  border: none;
  background-color: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #333; /* Efecto hover */
  }
`;

const Newsletter: React.FC = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message) {
      alert("Por favor, escribe tu mensaje.");
      return;
    }

    const mailtoLink = `mailto:lamotex@elmensual.com.ar?subject=Consulta desde Página Web&body=${encodeURIComponent(
      `${message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <Container>
      <Title>Contáctanos</Title>
      <Desc>Ponete en contacto para comprar por mayor</Desc>
      <InputContainer>
        <Input
          type="text"
          placeholder="Escribí tu mensaje..."
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
