import {
  Facebook,
  Instagram,
  MailOutline,
  Phone,
  Room,
} from "@material-ui/icons";
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom"; // Importar Link para la navegación
import { mobile } from "../responsive";

const Container = styled.div`
  display: flex;
  background-color: #1a1a1a; /* Negro más suave */
  color: #eaeaea; /* Blanco menos brillante */
  padding: 20px 0;
  width: 100%;

  ${mobile({ flexDirection: "column", textAlign: "center" })}
`;

const Left = styled.div`
  flex: 1;
  padding: 20px;
`;

const Center = styled.div`
  flex: 1;
  padding: 20px;

  ${mobile({
    display: "block", // Asegura que se mantenga visible en móviles
  })}
`;

const Right = styled.div`
  flex: 1;
  padding: 20px;

  ${mobile({
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Centra los elementos horizontalmente
    textAlign: "center", // Centra el texto también
  })}
`;

const Title = styled.h3`
  margin-bottom: 20px;
  color: #eaeaea; /* Asegura que el título sea blanco menos brillante */
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;

  ${mobile({
    flexDirection: "column", // Muestra una lista vertical en móviles
    alignItems: "center", // Centra los enlaces
    gap: "10px", // Añade espacio entre los elementos
  })}
`;

const ListItem = styled.li`
  width: 50%;
  margin-bottom: 10px;

  ${mobile({
    width: "100%", // Ocupa todo el ancho en móviles
  })}

  a {
    text-decoration: none;
    color: #dddada;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Desc = styled.p`
  margin: 10px 0px;
  font-size: 14px;
`;

const SocialContainer = styled.div`
  display: flex;
  gap: 15px; /* Espacio entre los íconos */
  margin-top: 10px;

  ${mobile({
    justifyContent: "center", // Centra los íconos solo en móviles
  })}
`;

const SocialIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  a {
    color: #e9e4e4;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    transform: scale(1.1);
    transition: transform 0.3s ease;
  }
`;

const ContactItem = styled.div`
  display: flex;
  margin-bottom: 10px;
  align-items: center;
  flex-wrap: wrap; /* Permite que el texto se envuelva */

  svg {
    margin-right: 10px;
  }

  ${mobile({
    fontSize: "14px", // Tamaño de fuente reducido
    flexDirection: "column", // Coloca el ícono arriba del texto en móviles
    alignItems: "flex-start", // Alinea el texto a la izquierda
    gap: "5px", // Espaciado entre ícono y texto
  })}
`;

const Footer: React.FC = () => {
  return (
    <Container>
      <Left>
        <Logo>El Mensual</Logo>
        <Desc>Contáctenos para poder trabajar con nosotros!</Desc>
        <SocialContainer>
          <SocialIcon color="3B5999">
            <a
              href="https://www.facebook.com/www.elmensual.com.ar"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook />
            </a>
          </SocialIcon>
          <SocialIcon color="E4405F">
            <a
              href="https://www.instagram.com/elmensual_laplata/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram />
            </a>
          </SocialIcon>
        </SocialContainer>
      </Left>
      <Center>
        <Title>Links útiles</Title>
        <List>
          <ListItem>
            <Link
              to="/acercade"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
            >
              Acerca de Nosotros!
            </Link>
          </ListItem>
          {/* Los demás enlaces no serán visibles en móviles */}
          <ListItem>
            <Link
              to="/"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
            >
              Home
            </Link>
          </ListItem>
          <ListItem>
            <Link
              to="/products/hombre"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
            >
              Hombre
            </Link>
          </ListItem>
          <ListItem>
            <Link
              to="/products/mujer"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
            >
              Mujer
            </Link>
          </ListItem>
          <ListItem>
            <Link
              to="/products/adolescentes"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
            >
              Adolescentes
            </Link>
          </ListItem>
          <ListItem>
            <Link
              to="/products/niños"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
            >
              Niños
            </Link>
          </ListItem>
          <ListItem>
            <Link
              to="/terminos"
              onClick={() => {
                window.scrollTo(0, 0);
              }}
            >
              Términos
            </Link>
          </ListItem>
        </List>
      </Center>
      <Right>
        <Title>Contacto</Title>
        <ContactItem>
          <Room />
          Bartolomé Mitre 3437 (C.P. 7260) Saladillo - Buenos Aires - ARG.
        </ContactItem>
        <ContactItem>
          <Phone />
          (+54) 02344451-550 / (+54) 02345156-87094
        </ContactItem>
        <ContactItem>
          <MailOutline />
          administracion@elmensual.com.ar
        </ContactItem>
      </Right>
    </Container>
  );
};

export default Footer;
