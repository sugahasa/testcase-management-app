import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <h1 className="text-3xl font-bold">テストケース管理</h1>
      <p className="text-gray-500">テストケースの作成・管理と、テスト実行プロジェクトの運用を一元管理します。</p>
      <div className="flex gap-4 mt-4">
        <Link
          href="/testcases"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          テストケース一覧
        </Link>
        <Link
          href="/projects"
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          実行プロジェクト一覧
        </Link>
      </div>
    </div>
  );
}
