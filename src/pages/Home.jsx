import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px", color: "#e1e1e6" }}>
      {/* Приветствие от Рошана */}
      <div
        style={{
          background: "linear-gradient(135deg, #24191c 0%, #121215 100%)",
          border: "1px solid #4a282e",
          borderRadius: "12px",
          padding: "40px",
          marginBottom: "35px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ color: "#ff5555", fontWeight: "bold", letterSpacing: "1px", marginBottom: "10px" }}>
          ГОЛОС ИЗ ЯМЫ РОШАНА
        </div>
        <h1 style={{ color: "#d4af37", fontSize: "38px", margin: "0 0 15px 0", fontFamily: "serif" }}>
          «Я помню каждого, кто приходил за Aegis...»
        </h1>
        <p style={{ color: "#bbb", fontSize: "16px", lineHeight: "1.7", margin: "0 0 25px 0" }}>
          Приветствую в моем Логове. Здесь фиксируются все преступления героев Dota 2: кто тайком забирает
          сыр, кто ворует Эгиду на 10-й минуте, и как с ними бороться. Записывай выводы из своих каток, чтобы 
          переиграть оппонентов на линии.
        </p>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <Link
            to="/heroes"
            style={{
              background: "#b82e2e",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            👁️ Открыть Досье Героев
          </Link>
          <Link
            to="/dashboard"
            style={{
              background: "#22222a",
              border: "1px solid #3d3d4a",
              color: "#d4af37",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            📝 Мой Журнал Заметок
          </Link>
        </div>
      </div>

      {/* Описание функционала */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        <div style={{ background: "#18181c", border: "1px solid #282830", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ color: "#d4af37", marginTop: 0 }}>👁️ Досье Рошана</h3>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Взгляд Рошана на каждого героя: его характер, прокасты и то, как он проявляет себя в матче.
          </p>
        </div>

        <div style={{ background: "#18181c", border: "1px solid #282830", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ color: "#d4af37", marginTop: 0 }}>📝 Личные Советы</h3>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Записывай тайминги, итембилды, контр-пики и фишки для каждого героя в своем личном кабинете.
          </p>
        </div>

        <div style={{ background: "#18181c", border: "1px solid #282830", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ color: "#d4af37", marginTop: 0 }}>🔍 База OpenDota</h3>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Техническая разведка: точные характеристики брони, скорости и атаки из публичного API.
          </p>
        </div>
      </div>
    </div>
  );
}