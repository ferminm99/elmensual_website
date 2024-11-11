import React from "react";
import styled from "styled-components";
import { Search, ShoppingCartOutlined } from "@material-ui/icons";
import Badge from "@mui/material/Badge";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";

const Container = styled.div`
  height: 80px;
  margin-bottom: 10px;
  max-width: 100%;
  overflow: visible;
  position: relative;
  z-index: 5;
`;

const Wrapper = styled.div`
  padding: 10px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 80px;
  width: 80px;
  cursor: pointer;
  margin-right: 20px;
`;

const SearchContainer = styled.div`
  border: 1px solid lightgray;
  display: flex;
  align-items: center;
  padding: 10px;
  margin-left: 20px;
`;

const Input = styled.input`
  border: none;
  font-size: 16px;
  width: 100%;
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const CategoryMenu = styled.div`
  position: relative;
  margin: 0 15px;
  font-size: 16px;
  cursor: pointer;

  &:hover .dropdown {
    visibility: visible;
    opacity: 1;
  }
`;

const Dropdown = styled.div`
  visibility: hidden; /* Oculto por defecto */
  opacity: 0;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  padding: 20px;
  z-index: 10;
  width: 60vw;
  max-width: 800px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  transition: visibility 0s, opacity 0.3s ease;
`;

const DropdownSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
`;

const DropdownItem = styled.div`
  padding: 5px 0;
  cursor: pointer;
  color: gray;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const MenuItem = styled.div`
  font-size: 16px;
  cursor: pointer;
  margin-left: 20px;
`;

const Navbar: React.FC = () => {
  const quantity = useSelector((state: RootState) => state.cart.quantity);
  const navigate = useNavigate();

  const categories = {
    Hombre: {
      BOMBACHAS: [
        "Recta con pinzas (grafa 70 pesada)",
        "Recta con pinzas (grafa 70 liviana)",
        "Alforzada (grafa 70 pesada y liviana)",
        "Bataraza y poliester - viscoza",
        "Vestir Poplin liviano (algodon y poliester)",
        "Corderoy",
        "Poplin",
      ],
      PANTALONES: ["Grafa", "Corderoy"],
      CAMISAS: ["Manga Larga", "Manga Corta"],
    },
    Mujer: {
      BOMBACHAS: ["Grafa", "Poplin"],
      PANTALONES: ["Grafa", "Corderoy"],
      CAMISAS: ["Manga Larga", "Manga Corta"],
    },
    "Adolescentes/Niños": {
      BOMBACHAS: ["Grafa", "Poplin"],
      BERMUDAS: ["Poplin", "Poplin Cargo"],
    },
  };

  const handleCategoryClick = (
    mainCategory: string,
    subCategory: string,
    type = ""
  ) => {
    const path = type
      ? `/products/${mainCategory}/${subCategory}/${type}`
      : `/products/${mainCategory}/${subCategory}`;
    navigate(path);
  };

  return (
    <Container>
      <Wrapper>
        <Left>
          <Link to="/">
            <LogoImage
              src="https://res.cloudinary.com/djovvsorv/image/upload/v1730838721/gpehr6bac6stvmcbpuqg.png"
              alt="El Mensual Logo"
            />
          </Link>
          <SearchContainer>
            <Input placeholder="Search" />
            <Search style={{ color: "gray", fontSize: 20 }} />
          </SearchContainer>
        </Left>
        <Center>
          {Object.keys(categories).map((mainCategory) => (
            <CategoryMenu key={mainCategory}>
              {mainCategory}
              <Dropdown className="dropdown">
                {Object.keys(categories[mainCategory]).map((section) => (
                  <DropdownSection key={section}>
                    <SectionTitle>{section}</SectionTitle>
                    {categories[mainCategory][section].map((subCategory) => (
                      <DropdownItem
                        key={subCategory}
                        onClick={() =>
                          handleCategoryClick(
                            mainCategory,
                            section,
                            subCategory
                          )
                        }
                      >
                        {subCategory}
                      </DropdownItem>
                    ))}
                  </DropdownSection>
                ))}
              </Dropdown>
            </CategoryMenu>
          ))}
        </Center>
        <Right>
          <Link to="/all-products">
            <MenuItem>Ver Productos</MenuItem>
          </Link>
          <Link to="/cart">
            <MenuItem>
              <Badge badgeContent={quantity} color="primary">
                <ShoppingCartOutlined style={{ fontSize: 24 }} />
              </Badge>
            </MenuItem>
          </Link>
        </Right>
      </Wrapper>
    </Container>
  );
};

export default Navbar;
