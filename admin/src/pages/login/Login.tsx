import { useState, FormEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/apiCalls";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import React from "react";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Obtenemos el estado de currentUser para verificar si el usuario está autenticado
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const handleClick = (e: FormEvent) => {
    e.preventDefault();
    login(dispatch, { username, password });
  };

  // UseEffect para redirigir automáticamente cuando el usuario se autentica
  useEffect(() => {
    if (currentUser) {
      if (currentUser.isAdmin) {
        navigate("/"); // Redirige al dashboard si es admin
      } else {
        navigate("/home"); // Puedes cambiar esta ruta a la página de usuarios no admin
      }
    }
  }, [currentUser, navigate]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <input
        style={{ padding: 10, marginBottom: 20 }}
        type="text"
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        style={{ padding: 10, marginBottom: 20 }}
        type="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleClick} style={{ padding: 10, width: 100 }}>
        Login
      </button>
    </div>
  );
};

export default Login;
