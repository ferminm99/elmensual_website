import { useState } from "react";
import styled from "styled-components";
import { mobile } from "../responsive";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/actions";
import { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
      rgba(255, 255, 255, 0.5),
      rgba(255, 255, 255, 0.5)
    ),
    url("https://images.pexels.com/photos/6984650/pexels-photo-6984650.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940")
      center;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 25%;
  padding: 20px;
  background-color: white;
  ${mobile({ width: "75%" })}
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 300;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  flex: 1;
  min-width: 40%;
  margin: 10px 0;
  padding: 10px;
`;

const Button = styled.button`
  width: 40%;
  border: none;
  padding: 15px 20px;
  background-color: teal;
  color: white;
  cursor: pointer;
  margin-bottom: 10px;
  &:disabled {
    color: green;
    cursor: not-allowed;
  }
`;

const Link = styled.a`
  margin: 5px 0px;
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
`;

const Error = styled.span`
  color: red;
`;

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useDispatch();
  const { isFetching, error, currentUser } = useSelector(
    (state: RootState) => state.user
  );
  const navigate = useNavigate();

  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    login(dispatch, { username, password });

    // Verifica si el usuario es administrador
    if (currentUser?.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <Container>
      <Wrapper>
        <Title>INICIO DE SESIÓN</Title>
        <Form>
          <Input
            placeholder="Usuario"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Contraseña"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleClick}>LOGIN</Button>
          {error && <Error>Something went wrong...</Error>}
          <Link>NO RECORDAS TU CONTRASEÑA?</Link>
          <Link>CREAR NUEVA CUENTA</Link>
        </Form>
      </Wrapper>
    </Container>
  );
};

export default Login;
