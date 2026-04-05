"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TestProject,
  TestCase,
  TestProjectCase,
  StepResult,
  PRIORITY_LABEL,
  PRIORITY_COLOR,
  TEST_TYPE_LABEL,
  STEP_RESULT_LABEL,
  STEP_RESULT_COLOR,
} from "@/lib/types";

const STEP_RESULTS: StepResult[] = ["NOT_EXECUTED", "PASSED", "FAILED", "BLOCKED"];

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<TestProject | null>(null);
  const [allTestCases, setAllTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCase, setShowAddCase] = useState(false);
  const [expandedCaseIds, setExpandedCaseIds] = useState<Set<string>>(new Set());

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
    const passed = steps.filter(
      (s) => getStepResult(projectCase, s.id) === "PASSED"
    ).length;
    const failed = steps.filter(
      (s) => getStepResult(projectCase, s.id) === "FAILED"
    ).length;
    const blocked = steps.filter(
      (s) => getStepResult(projectCase, s.id) === "BLOCKED"
    ).length;
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
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{project.cases.length} テストケース</p>
        </div>
        <button
          onClick={async () => {
            if (!confirm("このプロジェクトを削除しますか？")) return;
            await fetch(`/api/projects/${id}`, { method: "DELETE" });
            router.push("/projects");
          }}
          className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 shrink-0"
        >
          削除
        </button>
      </div>

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
                {/* Case header */}
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

                {/* Steps */}
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
