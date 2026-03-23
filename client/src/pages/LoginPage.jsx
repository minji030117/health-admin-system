import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@health-traffic.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("adminName", data.data.admin.name);
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "서버에 연결할 수 없습니다");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>건강신호등</h1>
        <p className="sub">관리자 대시보드</p>
        {error && <div className="login-error">{error}</div>}
        <input
          type="email" placeholder="이메일" value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password" placeholder="비밀번호" value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-login">로그인</button>
      </form>
    </div>
  );
}
