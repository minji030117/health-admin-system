import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function ConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [editValues, setEditValues] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newCfg, setNewCfg] = useState({ key: "", value: "", description: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await api.get("/config/admin");
    const items = data.data || [];
    setConfigs(items);
    const vals = {};
    items.forEach((c) => { vals[c.id] = c.value; });
    setEditValues(vals);
  };

  const save = async (id) => {
    let value;
    try { value = JSON.parse(editValues[id]); } catch { value = editValues[id]; }
    await api.put(`/config/admin/${id}`, { value });
    load();
  };

  const toggleActive = async (c) => {
    await api.put(`/config/admin/${c.id}`, { isActive: !c.isActive });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await api.delete(`/config/admin/${id}`);
    load();
  };

  const addConfig = async () => {
    if (!newCfg.key) return;
    let value;
    try { value = JSON.parse(newCfg.value); } catch { value = newCfg.value; }
    await api.post("/config/admin", { ...newCfg, value });
    setShowAdd(false);
    setNewCfg({ key: "", value: "", description: "" });
    load();
  };

  return (
    <>
      <div className="page-header">
        <h1>원격 설정 (Remote Config)</h1>
        <p>앱 동작을 서버에서 실시간으로 제어합니다</p>
      </div>

      <div className="flex gap-10 mb-16">
        <button className="btn btn-ghost" onClick={load}>새로고침</button>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ 설정 추가</button>
      </div>

      <div className="card">
        {configs.map((c) => (
          <div className="config-item" key={c.id} style={{ opacity: c.isActive ? 1 : 0.5 }}>
            <span className="key">{c.key}</span>
            <span className="desc">{c.description || ""}</span>
            <input
              value={editValues[c.id] || ""}
              onChange={(e) => setEditValues({ ...editValues, [c.id]: e.target.value })}
            />
            <button className="btn btn-sm btn-success" onClick={() => save(c.id)}>저장</button>
            <button
              className={`btn btn-sm ${c.isActive ? "btn-warning" : "btn-primary"}`}
              onClick={() => toggleActive(c)}
            >
              {c.isActive ? "비활성" : "활성"}
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => remove(c.id)}>삭제</button>
          </div>
        ))}
        {configs.length === 0 && <p className="text-muted" style={{ textAlign: "center", padding: 20 }}>설정 없음</p>}
      </div>

      {/* 추가 모달 */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>새 설정 추가</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                placeholder="키 (예: feature_enabled)"
                value={newCfg.key}
                onChange={(e) => setNewCfg({ ...newCfg, key: e.target.value })}
                style={{ padding: "12px 14px", border: "2px solid #d9ecff", borderRadius: 12, fontSize: 14, background: "#f0f9ff" }}
              />
              <input
                placeholder="값 (예: true, 100, &quot;텍스트&quot;)"
                value={newCfg.value}
                onChange={(e) => setNewCfg({ ...newCfg, value: e.target.value })}
                style={{ padding: "12px 14px", border: "2px solid #d9ecff", borderRadius: 12, fontSize: 14, background: "#f0f9ff" }}
              />
              <input
                placeholder="설명"
                value={newCfg.description}
                onChange={(e) => setNewCfg({ ...newCfg, description: e.target.value })}
                style={{ padding: "12px 14px", border: "2px solid #d9ecff", borderRadius: 12, fontSize: 14, background: "#f0f9ff" }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={addConfig}>추가</button>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
