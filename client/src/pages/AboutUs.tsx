import React from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Footer from "../components/Footer";

const Container = styled.div`
  background-color: #f9f9f9;
  margin-top: 90px;
`;

const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  background: url("https://source.unsplash.com/1600x900/?factory,rural")
    center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
`;

const HeroText = styled.h1`
  position: relative;
  color: #fff;
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  z-index: 1;
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
`;

const Text = styled.p`
  font-size: 18px;
  line-height: 1.8;
  color: #555;
  text-align: justify;
`;

const List = styled.ul`
  padding-left: 20px;
`;

const ListItem = styled.li`
  font-size: 18px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 10px;
  list-style: none;

  &:before {
    content: "✔";
    color: #333;
    margin-right: 10px;
  }
`;

const President = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 18px;
  font-style: italic;
  color: #555;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 40px;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AboutUs: React.FC = () => {
  return (
    <Container>
      <Navbar />
      <HeroSection>
        <HeroOverlay />
        <HeroText>Bienvenidos a LAMOTEX S.A.</HeroText>
      </HeroSection>
      <Content>
        <Section>
          <Title>En nombre de LAMOTEX S.A.</Title>
          <Text>
            Es un placer darle la bienvenida a nuestro nuevo sitio web. Como
            parte de nuestro proceso de expansión y mejora continua ponemos en
            marcha este sitio web que fue diseñado con el objetivo de presentar
            nuestros productos a quienes aún no nos conocen...
          </Text>
          <President>— Pedro Gastón Moreno, Presidente</President>
        </Section>
        <Section>
          <Title>Nuestra Historia</Title>
          <List>
            <ListItem>
              En sus comienzos, toda la producción que fabricábamos en el taller
              estaba destinada a comercializarse por terceros.
            </ListItem>
            <ListItem>
              Fuimos creciendo y, a finales de la década del 80, creamos una
              Sociedad Anónima a la que denominamos LAMOTEX S.A., componiendo su
              Directorio nuestro núcleo familiar.
            </ListItem>
            <ListItem>
              Durante el año 1992 nos mudamos a una nueva planta de confección y
              a mediados del año 1996 registramos nuestra propia marca EL
              MENSUAL.
            </ListItem>
            <ListItem>
              El nombre deriva de una modalidad de trabajo común en las
              estancias, donde se contrataba mano de obra por temporada, pagando
              al peón un salario mensual, identificando nuestras confecciones
              con la vestimenta que utilizaban estos trabajadores de campo.
            </ListItem>
            <ListItem>
              En la actualidad estas prendas se adaptan a los tiempos modernos y
              responden a las exigencias tanto del hombre de campo como de
              quienes la adoptaron en la ciudad, destacando por su resistencia y
              comodidad.
            </ListItem>
            <ListItem>
              Hoy LAMOTEX S.A. es una PYME con 34 empleados, instalada en su
              ciudad natal, con una capacidad de producción de 250,000 prendas
              anuales, principalmente bombachas de campo, camisas y pantalones
              de trabajo.
            </ListItem>
            <ListItem>
              Con más de 20 años en el rubro, atendemos todo el territorio
              nacional, destacándonos por nuestra calidad, costos competitivos,
              y capacidad de respuesta rápida.
            </ListItem>
          </List>
        </Section>
        <Section>
          <Title>Imagenes de Fiestas Patrias en Saladillo</Title>
          <ImageGrid>
            <Image
              src="https://elmensual.com.ar/images/domaSaladillo1.jpg"
              alt="Doma 1"
            />
            <Image
              src="https://elmensual.com.ar/images/domaSaladillo3.jpg"
              alt="Doma 2"
            />
            <Image
              src="https://elmensual.com.ar/images/domaSaladillo4.jpg"
              alt="Doma 3"
            />
            <Image
              src="https://elmensual.com.ar/images/domaSaladillo2.jpg"
              alt="Doma 4"
            />
          </ImageGrid>
        </Section>
      </Content>
      <Footer />
    </Container>
  );
};

export default AboutUs;
