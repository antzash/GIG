// src/Pages/LoginPage.jsx
import React from "react";
import LoginForm from "../Components/LoginForm";
import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div>
      <LoginForm />
      <div>
        <Link to="/register">Not registered? Create your account here</Link>
      </div>
    </div>
  );
}

export default LoginPage;
