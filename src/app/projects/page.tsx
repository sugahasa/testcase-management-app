"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TestProject, ProjectType, PROJECT_TYPE_LABEL } from "@/lib/types";

const PROJECT_TYPE_COLOR: Record<ProjectType, string> = {
  MANUAL: "bg-gray-100 text-gray-600",
  AUTOMATED: "bg-purple-100 text-purple-700",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<TestProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("MANUAL");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); });
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setProjectType("MANUAL");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, projectType }),
    });
    const created = await res.json();
    setProjects((prev) => [created, ...prev]);
    resetForm();
    setShowForm(false);
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この実行プロジェクトを削除しますか？")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">テスト実行プロジェクト</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          + 新規作成
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">新しい実行プロジェクト</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">プロジェクト名 *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="プロジェクト名"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">概要</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="プロジェクトの目的や対象範囲など"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">種別</label>
              <div className="flex gap-3">
                {(["MANUAL", "AUTOMATED"] as ProjectType[]).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="projectType"
                      value={t}
                      checked={projectType === t}
                      onChange={() => setProjectType(t)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">{PROJECT_TYPE_LABEL[t]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                キャンセル
              </button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                作成
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">読み込み中...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>実行プロジェクトがありません。「新規作成」から追加してください。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/projects/${p.id}`} className="font-medium hover:text-blue-600 transition-colors">
                    {p.name}
                  </Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROJECT_TYPE_COLOR[p.projectType]}`}>
                    {PROJECT_TYPE_LABEL[p.projectType]}
                  </span>
                </div>
                {p.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{p.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{p.cases.length} テストケース</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/projects/${p.id}`} className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  詳細
                </Link>
                <button onClick={() => handleDelete(p.id)} className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
