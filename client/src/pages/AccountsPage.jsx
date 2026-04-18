import React, { useEffect, useState } from "react";
import api from "../api/client";

const TABS = [
  { key: "", label: "전체", icon: "👥" },
  { key: "FREE", label: "FREE", icon: "🆓" },
  { key: "PRO", label: "PRO", icon: "⭐" },
];

export default function AccountsPage() {
  const [tab, setTab] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("lastActiveAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [checkedIds, setCheckedIds] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { setPage(1); }, [tab, keyword, sortBy, sortOrder]);
  useEffect(() => { loadUsers(); }, [tab, page, sortBy, sortOrder]);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/accounts/stats");
      setStats(data.data);
    } catch (e) { console.error(e); }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({ limit: "30", page: String(page), sortBy, sortOrder });
      if (tab) params.set("plan", tab);
      if (keyword) params.set("keyword", keyword);
      const { data } = await api.get(`/admin/accounts/search?${params}`);
      setItems(data.data?.items || []);
      setTotal(data.data?.total || 0);
      setCheckedIds([]);
    } catch (e) { console.error(e); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const openUser = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      setSelected(data.data);
      setPointsAmount(0);
    } catch (e) { console.error(e); }
  };

  const changePlan = async (id, plan) => {
    await api.patch(`/admin/users/${id}/plan`, { plan });
    loadUsers();
    loadStats();
    if (selected?.id === id) openUser(id);
  };

  const adjustPoints = async () => {
    if (!pointsAmount) return;
    await api.patch(`/admin/users/${selected.id}/points`, { amount: Number(pointsAmount) });
    openUser(selected.id);
    loadUsers();
    loadStats();
  };

  const deleteUser = async (id) => {
    await api.delete(`/admin/users/${id}`);
    setSelected(null);
    loadUsers();
    loadStats();
  };

  const bulkChangePlan = async (plan) => {
    if (!checkedIds.length) return;
    await api.post("/admin/users/bulk-plan", { ids: checkedIds, plan });
    loadUsers();
    loadStats();
    setConfirmAction(null);
  };

  const toggleCheck = (id) => {
    setCheckedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setCheckedIds((prev) => prev.length === items.length ? [] : items.map((u) => u.id));
  };

  const totalPages = Math.ceil(total / 30);
  const fmtDate = (d) => d ? new Date(d).toLocaleString("ko") : "-";
  const pctStr = (v) => ((v || 0) * 100).toFixed(1) + "%";

  return (
    <>
      <div className="page-header">
        <h1>계정 관리</h1>
        <p>FREE / PRO 플랜별 사용자를 관리합니다</p>
      </div>

      {/* 플랜별 통계 카드 */}
      {stats && (
        <div className="accounts-stats">
          <div className="plan-stat-card plan-free">
            <div className="plan-stat-header">
              <span className="plan-icon">🆓</span>
              <span className="plan-title">FREE 플랜</span>
              <span className="plan-count">{stats.free.count}명</span>
            </div>
            <div className="plan-stat-grid">
              <div><span className="label">오늘 활성</span><span className="val">{stats.free.activeToday}</span></div>
              <div><span className="label">주간 활성</span><span className="val">{stats.free.activeWeek}</span></div>
              <div><span className="label">월간 활성</span><span className="val">{stats.free.activeMonth}</span></div>
              <div><span className="label">평균 포인트</span><span className="val">{stats.free.avgPoints.toLocaleString()}p</span></div>
              <div><span className="label">평균 초록률</span><span className="val">{pctStr(stats.free.avgGreenRate)}</span></div>
              <div><span className="label">오늘 신규</span><span className="val">{stats.free.newToday}</span></div>
            </div>
          </div>

          <div className="plan-stat-card plan-pro">
            <div className="plan-stat-header">
              <span className="plan-icon">⭐</span>
              <span className="plan-title">PRO 플랜</span>
              <span className="plan-count">{stats.pro.count}명</span>
            </div>
            <div className="plan-stat-grid">
              <div><span className="label">오늘 활성</span><span className="val">{stats.pro.activeToday}</span></div>
              <div><span className="label">주간 활성</span><span className="val">{stats.pro.activeWeek}</span></div>
              <div><span className="label">월간 활성</span><span className="val">{stats.pro.activeMonth}</span></div>
              <div><span className="label">평균 포인트</span><span className="val">{stats.pro.avgPoints.toLocaleString()}p</span></div>
              <div><span className="label">평균 초록률</span><span className="val">{pctStr(stats.pro.avgGreenRate)}</span></div>
              <div><span className="label">오늘 신규</span><span className="val">{stats.pro.newToday}</span></div>
            </div>
          </div>

          <div className="plan-stat-card plan-total">
            <div className="plan-stat-header">
              <span className="plan-icon">📊</span>
              <span className="plan-title">전체 현황</span>
              <span className="plan-count">{stats.total.totalUsers}명</span>
            </div>
            <div className="plan-ratio-bar">
              <div className="ratio-free" style={{ width: stats.total.totalUsers ? `${(stats.total.freeUsers / stats.total.totalUsers * 100).toFixed(1)}%` : "50%" }}>
                FREE {stats.total.totalUsers ? (stats.total.freeUsers / stats.total.totalUsers * 100).toFixed(1) : 0}%
              </div>
              <div className="ratio-pro" style={{ width: stats.total.totalUsers ? `${(stats.total.proUsers / stats.total.totalUsers * 100).toFixed(1)}%` : "50%" }}>
                PRO {stats.total.totalUsers ? (stats.total.proUsers / stats.total.totalUsers * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 탭 + 검색 + 정렬 */}
      <div className="accounts-toolbar">
        <div className="tab-group">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              <span>{t.icon}</span> {t.label}
              {t.key === "" && stats && <span className="tab-count">{stats.total.totalUsers}</span>}
              {t.key === "FREE" && stats && <span className="tab-count">{stats.total.freeUsers}</span>}
              {t.key === "PRO" && stats && <span className="tab-count">{stats.total.proUsers}</span>}
            </button>
          ))}
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text" placeholder="닉네임 또는 디바이스ID 검색..."
            value={keyword} onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">검색</button>
        </form>

        <div className="sort-group">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="lastActiveAt">최근 활동순</option>
            <option value="createdAt">가입일순</option>
            <option value="points">포인트순</option>
            <option value="greenRate">초록달성률순</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setSortOrder((p) => p === "desc" ? "asc" : "desc")}>
            {sortOrder === "desc" ? "▼" : "▲"}
          </button>
        </div>
      </div>

      {/* 대량 작업 바 */}
      {checkedIds.length > 0 && (
        <div className="bulk-bar">
          <span>{checkedIds.length}명 선택됨</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setConfirmAction("FREE")}>FREE로 변경</button>
          <button className="btn btn-sm btn-warning" onClick={() => setConfirmAction("PRO")}>PRO로 변경</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setCheckedIds([])}>선택 해제</button>
        </div>
      )}

      {/* 사용자 테이블 */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" checked={checkedIds.length === items.length && items.length > 0} onChange={toggleAll} />
              </th>
              <th>닉네임</th>
              <th>디바이스ID</th>
              <th>플랜</th>
              <th>포인트</th>
              <th>초록달성률</th>
              <th>최근활동</th>
              <th>가입일</th>
              <th style={{ width: 180 }}>플랜 관리</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: "center", color: "#aaa", padding: 40 }}>사용자 없음</td></tr>
            ) : items.map((u) => (
              <tr key={u.id} className={checkedIds.includes(u.id) ? "row-checked" : ""}>
                <td><input type="checkbox" checked={checkedIds.includes(u.id)} onChange={() => toggleCheck(u.id)} /></td>
                <td style={{ fontWeight: 500 }}>{u.nickname || "-"}</td>
                <td className="text-sm text-muted">{u.deviceId?.slice(0, 14)}...</td>
                <td><span className={`badge badge-${u.plan}`}>{u.plan}</span></td>
                <td style={{ fontWeight: 600 }}>{(u.points || 0).toLocaleString()}p</td>
                <td>{pctStr(u.greenRate)}</td>
                <td className="text-sm text-muted">{fmtDate(u.lastActiveAt)}</td>
                <td className="text-sm text-muted">{fmtDate(u.createdAt)}</td>
                <td>
                  {u.plan === "FREE" ? (
                    <button className="btn btn-sm btn-warning" onClick={() => changePlan(u.id, "PRO")}>PRO 전환</button>
                  ) : (
                    <button className="btn btn-sm btn-ghost" onClick={() => changePlan(u.id, "FREE")}>FREE 전환</button>
                  )}
                </td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => openUser(u.id)}>상세</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>이전</button>
            <span className="page-info">{page} / {totalPages} (총 {total}명)</span>
            <button className="btn btn-sm btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>다음</button>
          </div>
        )}
      </div>

      {/* 사용자 상세 모달 */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>{selected.nickname || "익명 사용자"}</h3>
              <span className={`badge badge-${selected.plan} badge-lg`}>{selected.plan}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div className="stat-card">
                <div className="label">현재 플랜</div>
                <div className="value" style={{ fontSize: 20, color: selected.plan === "PRO" ? "#ad6800" : "#0050b3" }}>{selected.plan}</div>
              </div>
              <div className="stat-card">
                <div className="label">포인트</div>
                <div className="value green" style={{ fontSize: 20 }}>{(selected.points || 0).toLocaleString()}p</div>
              </div>
              <div className="stat-card">
                <div className="label">초록달성률</div>
                <div className="value" style={{ fontSize: 20 }}>{pctStr(selected.greenRate)}</div>
              </div>
              <div className="stat-card">
                <div className="label">가입일</div>
                <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{fmtDate(selected.createdAt)}</div>
              </div>
            </div>

            <div className="stat-card" style={{ marginBottom: 20 }}>
              <div className="label">디바이스 ID</div>
              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4, wordBreak: "break-all" }}>{selected.deviceId}</div>
            </div>

            {/* 플랜 전환 */}
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#003a8c", marginBottom: 10 }}>플랜 관리</h4>
            <div className="flex gap-10 items-center mb-16">
              {selected.plan === "FREE" ? (
                <button className="btn btn-warning" onClick={() => changePlan(selected.id, "PRO")}>PRO로 업그레이드</button>
              ) : (
                <button className="btn btn-ghost" onClick={() => changePlan(selected.id, "FREE")}>FREE로 다운그레이드</button>
              )}
            </div>

            {/* 포인트 조정 */}
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#003a8c", marginBottom: 10 }}>포인트 조정</h4>
            <div className="flex gap-10 items-center mb-16">
              <input
                type="number" placeholder="조정할 포인트 (음수 가능)"
                value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", border: "2px solid #d9ecff", borderRadius: 10, fontSize: 13, background: "#f0f9ff" }}
              />
              <button className="btn btn-success" onClick={adjustPoints}>적용</button>
            </div>

            {/* 최근 피드백 */}
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
              <button className="btn btn-danger" onClick={() => setConfirmAction("delete")}>사용자 삭제</button>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 확인 모달 */}
      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3>
              {confirmAction === "delete" ? "사용자 삭제 확인" : `${confirmAction}로 플랜 변경 확인`}
            </h3>
            <p style={{ fontSize: 14, color: "#595959", marginBottom: 20 }}>
              {confirmAction === "delete"
                ? `"${selected?.nickname || "익명"}" 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
                : `선택한 ${checkedIds.length}명의 플랜을 ${confirmAction}로 변경하시겠습니까?`
              }
            </p>
            <div className="modal-actions">
              {confirmAction === "delete" ? (
                <button className="btn btn-danger" onClick={() => { deleteUser(selected.id); setConfirmAction(null); }}>삭제</button>
              ) : (
                <button className="btn btn-primary" onClick={() => bulkChangePlan(confirmAction)}>변경</button>
              )}
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
