"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TestCase, TestStep, Priority, TestType, PRIORITY_LABEL, PRIORITY_COLOR, TEST_TYPE_LABEL } from "@/lib/types";

export default function TestCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [testType, setTestType] = useState<TestType>("FUNCTIONAL");
  const [precondition, setPrecondition] = useState("");

  // step form
  const [showStepForm, setShowStepForm] = useState(false);
  const [stepSummary, setStepSummary] = useState("");
  const [stepDetail, setStepDetail] = useState("");
  const [stepSubmitting, setStepSubmitting] = useState(false);

  // inline step editing
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepSummary, setEditStepSummary] = useState("");
  const [editStepDetail, setEditStepDetail] = useState("");

  useEffect(() => {
    fetch(`/api/testcases/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTestCase(data);
        setTitle(data.title);
        setPriority(data.priority);
        setTestType(data.testType);
        setPrecondition(data.precondition ?? "");
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/testcases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority, testType, precondition }),
    });
    const updated = await res.json();
    setTestCase(updated);
    setEditing(false);
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepSummary.trim()) return;
    setStepSubmitting(true);
    const res = await fetch(`/api/testcases/${id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: stepSummary, detail: stepDetail }),
    });
    const step = await res.json();
    setTestCase((prev) => prev ? { ...prev, steps: [...prev.steps, step] } : prev);
    setStepSummary("");
    setStepDetail("");
    setShowStepForm(false);
    setStepSubmitting(false);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm("このステップを削除しますか？")) return;
    await fetch(`/api/testcases/${id}/steps/${stepId}`, { method: "DELETE" });
    setTestCase((prev) => prev ? { ...prev, steps: prev.steps.filter((s) => s.id !== stepId) } : prev);
  };

  const startEditStep = (step: TestStep) => {
    setEditingStepId(step.id);
    setEditStepSummary(step.summary);
    setEditStepDetail(step.detail);
  };

  const handleUpdateStep = async (stepId: string) => {
    const res = await fetch(`/api/testcases/${id}/steps/${stepId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: editStepSummary, detail: editStepDetail }),
    });
    const updated = await res.json();
    setTestCase((prev) =>
      prev ? { ...prev, steps: prev.steps.map((s) => (s.id === stepId ? updated : s)) } : prev
    );
    setEditingStepId(null);
  };

  if (loading) return <p className="text-gray-400 text-sm">読み込み中...</p>;
  if (!testCase) return <p className="text-red-500">テストケースが見つかりません</p>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/testcases" className="text-sm text-gray-500 hover:text-blue-600">
          ← テストケース一覧
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
        {editing ? (
          <form onSubmit={handleUpdate} className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">優先度</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="HIGH">高</option>
                  <option value="MEDIUM">中</option>
                  <option value="LOW">低</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">テスト種別</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as TestType)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
              <label className="text-xs text-gray-500 block mb-1">前提条件</label>
              <textarea
                value={precondition}
                onChange={(e) => setPrecondition(e.target.value)}
                placeholder="テスト実行前に満たすべき条件を入力"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(false)} className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                キャンセル
              </button>
              <button type="submit" className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                保存
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{testCase.title}</h1>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[testCase.priority]}`}>
                  {PRIORITY_LABEL[testCase.priority]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                  {TEST_TYPE_LABEL[testCase.testType]}
                </span>
              </div>
              {testCase.precondition && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700 mb-1">前提条件</p>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">{testCase.precondition}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                編集
              </button>
              <button
                onClick={async () => {
                  if (!confirm("このテストケースを削除しますか？")) return;
                  await fetch(`/api/testcases/${id}`, { method: "DELETE" });
                  router.push("/testcases");
                }}
                className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">テストステップ ({testCase.steps.length})</h2>
        <button
          onClick={() => setShowStepForm((v) => !v)}
          className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + ステップ追加
        </button>
      </div>

      {showStepForm && (
        <form onSubmit={handleAddStep} className="mb-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">概要 *</label>
              <input
                value={stepSummary}
                onChange={(e) => setStepSummary(e.target.value)}
                placeholder="ステップの概要"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">詳細</label>
              <textarea
                value={stepDetail}
                onChange={(e) => setStepDetail(e.target.value)}
                placeholder="具体的な手順・入力値・確認内容など"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowStepForm(false)} className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                キャンセル
              </button>
              <button type="submit" disabled={stepSubmitting} className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                追加
              </button>
            </div>
          </div>
        </form>
      )}

      {testCase.steps.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white border border-dashed border-gray-300 rounded-xl">
          <p className="text-sm">ステップがありません。「ステップ追加」から追加してください。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {testCase.steps.map((step, i) => (
            <div key={step.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              {editingStepId === step.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editStepSummary}
                    onChange={(e) => setEditStepSummary(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editStepDetail}
                    onChange={(e) => setEditStepDetail(e.target.value)}
                    rows={2}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingStepId(null)} className="text-sm px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">キャンセル</button>
                    <button onClick={() => handleUpdateStep(step.id)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-gray-400 pt-0.5 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{step.summary}</p>
                    {step.detail && <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{step.detail}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEditStep(step)} className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">編集</button>
                    <button onClick={() => handleDeleteStep(step.id)} className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50">削除</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
