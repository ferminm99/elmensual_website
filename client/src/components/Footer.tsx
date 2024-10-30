import {
  Facebook,
  Instagram,
  MailOutline,
  Phone,
  Room,
} from "@material-ui/icons";
import React from "react";
import styled from "styled-components";
import { mobile } from "../responsive";

const Container = styled.div`
  display: flex;
  ${mobile({ flexDirection: "column" })}
`;

const Left = styled.div`
  flex: 1;
  padding: 20px;
  flex-direction: column;
  display: flex;
`;
const Center = styled.div`
  flex: 1;
  padding: 20px;
  ${mobile({ display: "none" })}
`;
const Right = styled.div`
  flex: 1;
  padding: 20px;
  ${mobile({ backgroundColor: "#fff8f8" })}
`;

const Title = styled.h3`
  margin-bottom: 30px;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
`;

const ListItem = styled.li`
  width: 50%;
  margin-bottom: 10px;
`;

const Logo = styled.h1``;

const Desc = styled.p`
  margin: 20px 0px;
`;

const SocialContainer = styled.div`
  display: flex;
`;

const SocialIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`;

const ContactItem = styled.div`
  display: flex;
  margin-bottom: 20px;
  align-items: center;
`;

const Payment = styled.img`
  display: flex;
`;
const Footer: React.FC = () => {
  return (
    <Container>
      <Left>
        <Logo>El Mensual</Logo>
        <Desc>Contactenos para poder trabajar con nosotros!</Desc>
        <SocialContainer>
          <SocialIcon color="3B5999">
            <Facebook />
          </SocialIcon>
          <SocialIcon color="E4405F">
            <Instagram />
          </SocialIcon>
        </SocialContainer>
      </Left>
      <Center>
        <Title>Links utiles</Title>
        <List>
          <ListItem>Home</ListItem>
          <ListItem>Carrito</ListItem>
          <ListItem>Hombre</ListItem>
          <ListItem>Mujer</ListItem>
          <ListItem>Accesorios</ListItem>
          <ListItem>Mis deseados</ListItem>
          <ListItem>Terminos</ListItem>
        </List>
      </Center>
      <Right>
        <Title>Contacto</Title>
        <ContactItem>
          <Room style={{ marginRight: "10px" }} />
          Bartolomé Mitre 3437 (C.P. 7260) Saladillo - Buenos Aires - ARG.
        </ContactItem>
        <ContactItem>
          <Phone style={{ marginRight: "10px" }} />
          (+54) 02344454-605 / (+54) 02344451-550 / (+54) 02345156-87094
        </ContactItem>
        <ContactItem>
          <MailOutline style={{ marginRight: "10px" }} />{" "}
          lamotex@elmensual.com.ar / ventas@elmensual.com.ar
        </ContactItem>
      </Right>
    </Container>
  );
};

export default Footer;
