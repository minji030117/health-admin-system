import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [errStats, setErrStats] = useState(null);
  const [recentFb, setRecentFb] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [d, e, f] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/error-log/admin/stats"),
        api.get("/feedback/admin?limit=5"),
      ]);
      setStats(d.data.data);
      setErrStats(e.data.data);
      setRecentFb(f.data.data?.items || []);
    } catch (err) { console.error(err); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("ko") : "-";

  if (!stats) return <p>로딩 중...</p>;

  return (
    <>
      <div className="page-header">
        <h1>대시보드</h1>
        <p>건강신호등 서비스 현황을 한눈에 확인하세요</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">전체 사용자</div>
          <div className="value sky">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="label">FREE 사용자</div>
          <div className="value green">{stats.freeUsers}</div>
        </div>
        <div className="stat-card">
          <div className="label">PRO 사용자</div>
          <div className="value orange">{stats.proUsers}</div>
        </div>
        <div className="stat-card">
          <div className="label">오늘 활성</div>
          <div className="value purple">{stats.activeToday}</div>
        </div>
        <div className="stat-card">
          <div className="label">총 피드백</div>
          <div className="value sky">{stats.totalFeedback}</div>
        </div>
        <div className="stat-card">
          <div className="label">대기 중 피드백</div>
          <div className="value red">{stats.pendingFeedback}</div>
        </div>
      </div>

      {/* 에러 통계 */}
      <div className="card">
        <h3>에러 로그 통계 (최근 24시간)</h3>
        {errStats && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">총 에러</div>
              <div className="value red">{errStats.total}</div>
            </div>
            {(errStats.byLevel || []).map((l) => (
              <div className="stat-card" key={l.level}>
                <div className="label">{l.level.toUpperCase()}</div>
                <div className="value">{l._count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 피드백 */}
      <div className="card">
        <h3>최근 피드백</h3>
        <table>
          <thead>
            <tr><th>제목</th><th>카테고리</th><th>상태</th><th>등록일</th></tr>
          </thead>
          <tbody>
            {recentFb.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: "center", color: "#aaa" }}>피드백 없음</td></tr>
            ) : recentFb.map((f) => (
              <tr key={f.id}>
                <td>{f.title}</td>
                <td>{f.category}</td>
                <td><span className={`badge badge-${f.status}`}>{f.status}</span></td>
                <td>{fmtDate(f.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
