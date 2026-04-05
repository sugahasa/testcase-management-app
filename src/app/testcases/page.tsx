"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TestCase, Priority, TestType, PRIORITY_LABEL, PRIORITY_COLOR, TEST_TYPE_LABEL } from "@/lib/types";

export default function TestCasesPage() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [testType, setTestType] = useState<TestType>("FUNCTIONAL");
  const [precondition, setPrecondition] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/testcases")
      .then((r) => r.json())
      .then((data) => { setTestCases(data); setLoading(false); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/testcases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority, testType, precondition }),
    });
    const created = await res.json();
    setTestCases((prev) => [created, ...prev]);
    setTitle("");
    setPriority("MEDIUM");
    setTestType("FUNCTIONAL");
    setPrecondition("");
    setShowForm(false);
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このテストケースを削除しますか？")) return;
    await fetch(`/api/testcases/${id}`, { method: "DELETE" });
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">テストケース一覧</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          + 新規作成
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">新しいテストケース</h2>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">概要 *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="テストケースの概要を入力"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="priority" className="text-sm font-medium text-gray-700 block mb-1">優先度</label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HIGH">高</option>
                  <option value="MEDIUM">中</option>
                  <option value="LOW">低</option>
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="testType" className="text-sm font-medium text-gray-700 block mb-1">テスト種別</label>
                <select
                  id="testType"
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as TestType)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FUNCTIONAL">機能テスト</option>
                  <option value="REGRESSION">回帰テスト</option>
                  <option value="PERFORMANCE">性能テスト</option>
                  <option value="SECURITY">セキュリティテスト</option>
                  <option value="USABILITY">ユーザビリティテスト</option>
                  <option value="OTHER">その他</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">前提条件</label>
              <textarea
                value={precondition}
                onChange={(e) => setPrecondition(e.target.value)}
                placeholder="テスト実行前に満たすべき条件を入力"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                作成
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">読み込み中...</p>
      ) : testCases.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>テストケースがありません。「新規作成」から追加してください。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {testCases.map((tc) => (
            <div key={tc.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/testcases/${tc.id}`} className="font-medium hover:text-blue-600 transition-colors">
                  {tc.title}
                </Link>
                <div className="flex gap-2 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[tc.priority]}`}>
                    {PRIORITY_LABEL[tc.priority]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                    {TEST_TYPE_LABEL[tc.testType]}
                  </span>
                  <span className="text-xs text-gray-400">{tc.steps.length} ステップ</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/testcases/${tc.id}`}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  詳細
                </Link>
                <button
                  onClick={() => handleDelete(tc.id)}
                  className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
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
