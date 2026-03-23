import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function ErrorsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ level: "", platform: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const params = new URLSearchParams({ limit: "100" });
    if (filter.level) params.set("level", filter.level);
    if (filter.platform) params.set("platform", filter.platform);
    const [list, st] = await Promise.all([
      api.get(`/error-log/admin?${params}`),
      api.get("/error-log/admin/stats"),
    ]);
    setItems(list.data.data?.items || []);
    setStats(st.data.data);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleString("ko") : "-";

  return (
    <>
      <div className="page-header">
        <h1>에러 로그</h1>
        <p>앱에서 수집된 에러를 실시간으로 모니터링합니다</p>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">24시간 총 에러</div>
            <div className="value red">{stats.total}</div>
          </div>
          {(stats.byLevel || []).map((l) => (
            <div className="stat-card" key={l.level}>
              <div className="label">{l.level.toUpperCase()}</div>
              <div className="value">{l._count}</div>
            </div>
          ))}
          {(stats.byScreen || []).slice(0, 3).map((s) => (
            <div className="stat-card" key={s.screen}>
              <div className="label">{s.screen || "알수없음"}</div>
              <div className="value sky">{s._count}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-10 mb-16 items-center">
        <select value={filter.level} onChange={(e) => setFilter({ ...filter, level: e.target.value })}>
          <option value="">전체 레벨</option>
          <option value="error">error</option>
          <option value="warn">warn</option>
          <option value="fatal">fatal</option>
        </select>
        <select value={filter.platform} onChange={(e) => setFilter({ ...filter, platform: e.target.value })}>
          <option value="">전체 플랫폼</option>
          <option value="web">web</option>
          <option value="android">android</option>
          <option value="ios">ios</option>
        </select>
        <button className="btn btn-ghost" onClick={load}>검색</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>레벨</th><th>메시지</th><th>화면</th><th>플랫폼</th><th>사용자</th><th>시간</th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#aaa" }}>에러 없음</td></tr>
            ) : items.map((e) => (
              <tr key={e.id}>
                <td><span className={`badge badge-${e.level}`}>{e.level}</span></td>
                <td style={{ maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.message}</td>
                <td>{e.screen || "-"}</td>
                <td>{e.platform || "-"}</td>
                <td className="text-sm">{e.user?.nickname || e.user?.deviceId?.slice(0, 8) || "-"}</td>
                <td className="text-sm text-muted">{fmtDate(e.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
