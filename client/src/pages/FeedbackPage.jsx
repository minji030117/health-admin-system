import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function FeedbackPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await api.get("/feedback/admin?limit=50");
    setItems(data.data?.items || []);
  };

  const openDetail = async (id) => {
    setSelected(id);
    const { data } = await api.get(`/feedback/admin/${id}`);
    setDetail(data.data);
    setReplyText("");
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    await api.post(`/feedback/admin/${selected}/reply`, { content: replyText });
    openDetail(selected);
    load();
  };

  const changeStatus = async (status) => {
    await api.patch(`/feedback/admin/${selected}/status`, { status });
    openDetail(selected);
    load();
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleString("ko") : "-";
  const statusLabel = { pending: "대기중", in_review: "검토중", resolved: "해결됨", rejected: "반려" };

  return (
    <>
      <div className="page-header">
        <h1>의견함</h1>
        <p>사용자 피드백을 확인하고 답변하세요</p>
      </div>

      <div className="flex gap-10 mb-16">
        <button className="btn btn-ghost" onClick={load}>새로고침</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>제목</th><th>카테고리</th><th>사용자</th><th>상태</th><th>답변수</th><th>등록일</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#aaa" }}>피드백 없음</td></tr>
            ) : items.map((f) => (
              <tr key={f.id}>
                <td style={{ fontWeight: 500 }}>{f.title}</td>
                <td>{f.category}</td>
                <td>{f.user?.nickname || f.user?.deviceId?.slice(0, 8) || "-"}</td>
                <td><span className={`badge badge-${f.status}`}>{statusLabel[f.status]}</span></td>
                <td>{f._count?.replies || 0}</td>
                <td className="text-sm text-muted">{fmtDate(f.createdAt)}</td>
                <td><button className="btn btn-sm btn-primary" onClick={() => openDetail(f.id)}>상세</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{detail.title}</h3>
            <p className="text-sm text-muted mb-16">
              {detail.category} &middot; {detail.user?.nickname || detail.user?.deviceId || "익명"} &middot; {fmtDate(detail.createdAt)}
            </p>
            <div style={{ background: "#f0f9ff", padding: 16, borderRadius: 12, marginBottom: 20, lineHeight: 1.7, fontSize: 14, border: "1px solid #d6eeff" }}>
              {detail.content}
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#003a8c", marginBottom: 10 }}>답변 내역</h4>
            {detail.replies?.length === 0 ? (
              <p className="text-sm text-muted mb-16">아직 답변이 없습니다</p>
            ) : detail.replies?.map((r) => (
              <div className="reply-bubble" key={r.id}>
                <div className="meta">{r.admin?.name || "관리자"} &middot; {fmtDate(r.createdAt)}</div>
                <div className="text">{r.content}</div>
              </div>
            ))}

            <textarea
              placeholder="답변을 입력하세요..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={sendReply}>답변 전송</button>
              <select value={detail.status} onChange={(e) => changeStatus(e.target.value)}>
                <option value="pending">대기중</option>
                <option value="in_review">검토중</option>
                <option value="resolved">해결됨</option>
                <option value="rejected">반려</option>
              </select>
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
