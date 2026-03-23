import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [planFilter, setPlanFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [pointsAmount, setPointsAmount] = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const params = new URLSearchParams({ limit: "50" });
    if (planFilter) params.set("plan", planFilter);
    const { data } = await api.get(`/admin/users?${params}`);
    setItems(data.data?.items || []);
    setTotal(data.data?.total || 0);
  };

  const openUser = async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    setSelected(data.data);
    setPointsAmount(0);
  };

  const adjustPoints = async () => {
    if (!pointsAmount) return;
    await api.patch(`/admin/users/${selected.id}/points`, { amount: Number(pointsAmount) });
    openUser(selected.id);
    load();
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleString("ko") : "-";

  return (
    <>
      <div className="page-header">
        <h1>사용자 관리</h1>
        <p>총 {total}명의 사용자</p>
      </div>

      <div className="flex gap-10 mb-16 items-center">
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option value="">전체 플랜</option>
          <option value="FREE">FREE</option>
          <option value="PRO">PRO</option>
        </select>
        <button className="btn btn-ghost" onClick={load}>검색</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>닉네임</th><th>디바이스ID</th><th>플랜</th><th>포인트</th><th>초록달성률</th><th>최근활동</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.nickname || "-"}</td>
                <td className="text-sm text-muted">{u.deviceId?.slice(0, 14)}...</td>
                <td><span className={`badge badge-${u.plan}`}>{u.plan}</span></td>
                <td style={{ fontWeight: 600 }}>{u.points.toLocaleString()}p</td>
                <td>{(u.greenRate * 100).toFixed(1)}%</td>
                <td className="text-sm text-muted">{fmtDate(u.lastActiveAt)}</td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => openUser(u.id)}>상세</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 사용자 상세 모달 */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.nickname || "익명 사용자"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div className="stat-card">
                <div className="label">플랜</div>
                <div className="value sky" style={{ fontSize: 20 }}>{selected.plan}</div>
              </div>
              <div className="stat-card">
                <div className="label">포인트</div>
                <div className="value green" style={{ fontSize: 20 }}>{selected.points.toLocaleString()}p</div>
              </div>
              <div className="stat-card">
                <div className="label">초록달성률</div>
                <div className="value" style={{ fontSize: 20 }}>{(selected.greenRate * 100).toFixed(1)}%</div>
              </div>
              <div className="stat-card">
                <div className="label">디바이스</div>
                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>{selected.deviceId}</div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#003a8c", marginBottom: 10 }}>포인트 조정</h4>
            <div className="flex gap-10 items-center mb-16">
              <input
                type="number" placeholder="조정할 포인트 (음수 가능)"
                value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", border: "2px solid #d9ecff", borderRadius: 10, fontSize: 13, background: "#f0f9ff" }}
              />
              <button className="btn btn-success" onClick={adjustPoints}>적용</button>
            </div>

            {selected.feedbacks?.length > 0 && (
              <>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#003a8c", marginBottom: 10 }}>최근 피드백</h4>
                {selected.feedbacks.map((f) => (
                  <div key={f.id} className="reply-bubble">
                    <div className="meta">{f.category} &middot; <span className={`badge badge-${f.status}`}>{f.status}</span></div>
                    <div className="text">{f.title}</div>
                  </div>
                ))}
              </>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
