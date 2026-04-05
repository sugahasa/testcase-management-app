export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type TestType = "FUNCTIONAL" | "REGRESSION" | "PERFORMANCE" | "SECURITY" | "USABILITY" | "OTHER";
export type StepResult = "NOT_EXECUTED" | "PASSED" | "FAILED" | "BLOCKED";

export interface TestStep {
  id: string;
  order: number;
  summary: string;
  detail: string;
  testCaseId: string;
}

export interface TestCase {
  id: string;
  title: string;
  priority: Priority;
  testType: TestType;
  steps: TestStep[];
  createdAt: string;
  updatedAt: string;
}

export interface TestStepResult {
  id: string;
  projectCaseId: string;
  stepId: string;
  result: StepResult;
  note: string;
}

export interface TestProjectCase {
  id: string;
  projectId: string;
  testCaseId: string;
  testCase: TestCase;
  stepResults: TestStepResult[];
}

export interface TestProject {
  id: string;
  name: string;
  cases: TestProjectCase[];
  createdAt: string;
  updatedAt: string;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

export const TEST_TYPE_LABEL: Record<TestType, string> = {
  FUNCTIONAL: "機能テスト",
  REGRESSION: "回帰テスト",
  PERFORMANCE: "性能テスト",
  SECURITY: "セキュリティテスト",
  USABILITY: "ユーザビリティテスト",
  OTHER: "その他",
};

export const STEP_RESULT_LABEL: Record<StepResult, string> = {
  NOT_EXECUTED: "未実施",
  PASSED: "合格",
  FAILED: "不合格",
  BLOCKED: "ブロック",
};

export const STEP_RESULT_COLOR: Record<StepResult, string> = {
  NOT_EXECUTED: "bg-gray-100 text-gray-600",
  PASSED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  BLOCKED: "bg-orange-100 text-orange-700",
};
