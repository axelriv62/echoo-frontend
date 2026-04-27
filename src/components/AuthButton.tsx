import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router";

interface AuthButtonProps {
  token: string | null;
  setToken: (token: string | null) => void;
  onLogout?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = (props) => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("authToken");
    props.setToken(null);
    props.onLogout?.();
  };
  const fct = props.token ? logout : () => navigate("/auth");

  return (
    <Button color="secondary" variant="outlined" onClick={fct} sx={{ ml: "auto" }}>
      {props.token ? "déconnexion" : "connexion"}
    </Button>
  );
};

export default AuthButton;

