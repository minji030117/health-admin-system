import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/", icon: "\u{1F4CA}", label: "\uB300\uC2DC\uBCF4\uB4DC" },
  { to: "/feedback", icon: "\u{1F4EC}", label: "\uC758\uACAC\uD568" },
  { to: "/errors", icon: "\u{1F6A8}", label: "\uC5D0\uB7EC \uB85C\uADF8" },
  { to: "/users", icon: "\u{1F465}", label: "\uC0AC\uC6A9\uC790 \uAD00\uB9AC" },
  { to: "/config", icon: "\u2699\uFE0F", label: "\uC6D0\uACA9 \uC124\uC815" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2><span>건강신호등</span></h2>
          <p>ADMIN DASHBOARD</p>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>로그아웃</button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
