"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  TestProject,
  TestCase,
  TestProjectCase,
  StepResult,
  ProjectType,
  PRIORITY_LABEL,
  PRIORITY_COLOR,
  TEST_TYPE_LABEL,
  STEP_RESULT_LABEL,
  STEP_RESULT_COLOR,
  PROJECT_TYPE_LABEL,
} from "@/lib/types";

const STEP_RESULTS: StepResult[] = ["NOT_EXECUTED", "PASSED", "FAILED", "BLOCKED"];

const PROJECT_TYPE_COLOR: Record<ProjectType, string> = {
  MANUAL: "bg-gray-100 text-gray-600",
  AUTOMATED: "bg-purple-100 text-purple-700",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<TestProject | null>(null);
  const [allTestCases, setAllTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCase, setShowAddCase] = useState(false);
  const [expandedCaseIds, setExpandedCaseIds] = useState<Set<string>>(new Set());

  // edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editProjectType, setEditProjectType] = useState<ProjectType>("MANUAL");
  const [editTestPlan, setEditTestPlan] = useState("");
  const [testPlanTab, setTestPlanTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch("/api/testcases").then((r) => r.json()),
    ]).then(([proj, cases]) => {
      setProject(proj);
      setAllTestCases(cases);
      setLoading(false);
    });
  }, [id]);

  const startEditing = (proj: TestProject) => {
    setEditName(proj.name);
    setEditDescription(proj.description);
    setEditProjectType(proj.projectType);
    setEditTestPlan(proj.testPlan);
    setEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        description: editDescription,
        projectType: editProjectType,
        testPlan: editTestPlan,
      }),
    });
    const updated = await res.json();
    setProject(updated);
    setEditing(false);
  };

  const addedCaseIds = new Set(project?.cases.map((c) => c.testCaseId) ?? []);
  const availableCases = allTestCases.filter((tc) => !addedCaseIds.has(tc.id));

  const handleAddCase = async (testCaseId: string) => {
    const res = await fetch(`/api/projects/${id}/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testCaseId }),
    });
    const newCase = await res.json();
    setProject((prev) =>
      prev ? { ...prev, cases: [...prev.cases, newCase] } : prev
    );
    setShowAddCase(false);
  };

  const handleRemoveCase = async (projectCaseId: string) => {
    if (!confirm("このテストケースをプロジェクトから除外しますか？")) return;
    await fetch(`/api/projects/${id}/cases/${projectCaseId}`, { method: "DELETE" });
    setProject((prev) =>
      prev ? { ...prev, cases: prev.cases.filter((c) => c.id !== projectCaseId) } : prev
    );
  };

  const handleSetResult = async (
    projectCase: TestProjectCase,
    stepId: string,
    result: StepResult
  ) => {
    const res = await fetch(`/api/projects/${id}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectCaseId: projectCase.id, stepId, result }),
    });
    const updated = await res.json();
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cases: prev.cases.map((c) => {
          if (c.id !== projectCase.id) return c;
          const existingIdx = c.stepResults.findIndex((r) => r.stepId === stepId);
          const newResults =
            existingIdx >= 0
              ? c.stepResults.map((r, i) => (i === existingIdx ? updated : r))
              : [...c.stepResults, updated];
          return { ...c, stepResults: newResults };
        }),
      };
    });
  };

  const toggleExpand = (caseId: string) => {
    setExpandedCaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(caseId)) next.delete(caseId);
      else next.add(caseId);
      return next;
    });
  };

  const getStepResult = (projectCase: TestProjectCase, stepId: string): StepResult => {
    return projectCase.stepResults.find((r) => r.stepId === stepId)?.result ?? "NOT_EXECUTED";
  };

  const calcProgress = (projectCase: TestProjectCase) => {
    const steps = projectCase.testCase.steps;
    if (steps.length === 0) return null;
    const passed = steps.filter((s) => getStepResult(projectCase, s.id) === "PASSED").length;
    const failed = steps.filter((s) => getStepResult(projectCase, s.id) === "FAILED").length;
    const blocked = steps.filter((s) => getStepResult(projectCase, s.id) === "BLOCKED").length;
    const notExecuted = steps.length - passed - failed - blocked;
    return { total: steps.length, passed, failed, blocked, notExecuted };
  };

  if (loading) return <p className="text-gray-400 text-sm">読み込み中...</p>;
  if (!project) return <p className="text-red-500">プロジェクトが見つかりません</p>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-gray-500 hover:text-blue-600">
          ← 実行プロジェクト一覧
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
        {editing ? (
          <form onSubmit={handleUpdate} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">プロジェクト名 *</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">概要</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">種別</label>
              <div className="flex gap-3">
                {(["MANUAL", "AUTOMATED"] as ProjectType[]).map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editProjectType"
                      value={t}
                      checked={editProjectType === t}
                      onChange={() => setEditProjectType(t)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm">{PROJECT_TYPE_LABEL[t]}</span>
                  </label>
                ))}
              </div>
            </div>
            {editProjectType === "AUTOMATED" && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">テスト計画（Markdown）</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="flex border-b border-gray-200 bg-gray-50">
                    {(["edit", "preview"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setTestPlanTab(tab)}
                        className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                          testPlanTab === tab
                            ? "bg-white text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab === "edit" ? "編集" : "プレビュー"}
                      </button>
                    ))}
                  </div>
                  {testPlanTab === "edit" ? (
                    <textarea
                      value={editTestPlan}
                      onChange={(e) => setEditTestPlan(e.target.value)}
                      rows={10}
                      placeholder={"# テスト計画\n\n## 目的\n\n## 対象範囲\n\n## 実行方法\n"}
                      className="w-full px-3 py-2 text-sm font-mono focus:outline-none resize-y"
                    />
                  ) : (
                    <div className="px-4 py-3 min-h-[120px] prose prose-sm max-w-none">
                      {editTestPlan ? (
                        <ReactMarkdown>{editTestPlan}</ReactMarkdown>
                      ) : (
                        <p className="text-gray-400 text-sm">テスト計画がありません。</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{project.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROJECT_TYPE_COLOR[project.projectType]}`}>
                  {PROJECT_TYPE_LABEL[project.projectType]}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{project.cases.length} テストケース</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEditing(project)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                編集
              </button>
              <button
                onClick={async () => {
                  if (!confirm("このプロジェクトを削除しますか？")) return;
                  await fetch(`/api/projects/${id}`, { method: "DELETE" });
                  router.push("/projects");
                }}
                className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Test plan (automated, read-only) */}
      {!editing && project.projectType === "AUTOMATED" && project.testPlan && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
          <h2 className="text-base font-semibold mb-3">テスト計画</h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{project.testPlan}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Add test case */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">テストケース</h2>
        <button
          onClick={() => setShowAddCase((v) => !v)}
          className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + ケースを追加
        </button>
      </div>

      {showAddCase && (
        <div className="mb-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-medium text-sm mb-3">追加するテストケースを選択</h3>
          {availableCases.length === 0 ? (
            <p className="text-sm text-gray-400">追加できるテストケースがありません。</p>
          ) : (
            <div className="flex flex-col gap-2">
              {availableCases.map((tc) => (
                <div key={tc.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{tc.title}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[tc.priority]}`}>
                        {PRIORITY_LABEL[tc.priority]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {TEST_TYPE_LABEL[tc.testType]}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddCase(tc.id)}
                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shrink-0"
                  >
                    追加
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button onClick={() => setShowAddCase(false)} className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
              閉じる
            </button>
          </div>
        </div>
      )}

      {project.cases.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-dashed border-gray-300 rounded-xl">
          <p className="text-sm">テストケースが追加されていません。「ケースを追加」から選択してください。</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {project.cases.map((pc) => {
            const progress = calcProgress(pc);
            const isExpanded = expandedCaseIds.has(pc.id);

            return (
              <div key={pc.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <button
                    onClick={() => toggleExpand(pc.id)}
                    className="text-gray-400 hover:text-gray-600 text-xs w-5 shrink-0"
                  >
                    {isExpanded ? "▼" : "▶"}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{pc.testCase.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[pc.testCase.priority]}`}>
                        {PRIORITY_LABEL[pc.testCase.priority]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {TEST_TYPE_LABEL[pc.testCase.testType]}
                      </span>
                      {progress && (
                        <span className="text-xs text-gray-400">
                          合格 {progress.passed} / 不合格 {progress.failed} / ブロック {progress.blocked} / 未実施 {progress.notExecuted} (計{progress.total})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCase(pc.id)}
                    className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50 shrink-0"
                  >
                    除外
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {pc.testCase.steps.length === 0 ? (
                      <p className="text-sm text-gray-400 px-6 py-4">ステップがありません。</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-xs text-gray-500">
                            <th className="text-left px-4 py-2 w-8">#</th>
                            <th className="text-left px-4 py-2">概要</th>
                            <th className="text-left px-4 py-2 hidden md:table-cell">詳細</th>
                            <th className="text-left px-4 py-2 w-36">実行結果</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pc.testCase.steps.map((step) => {
                            const result = getStepResult(pc, step.id);
                            return (
                              <tr key={step.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-400 text-xs">{step.order}</td>
                                <td className="px-4 py-3 font-medium">{step.summary}</td>
                                <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-pre-wrap">
                                  {step.detail || "-"}
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={result}
                                    onChange={(e) =>
                                      handleSetResult(pc, step.id, e.target.value as StepResult)
                                    }
                                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STEP_RESULT_COLOR[result]}`}
                                  >
                                    {STEP_RESULTS.map((r) => (
                                      <option key={r} value={r}>
                                        {STEP_RESULT_LABEL[r]}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
