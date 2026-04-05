import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// Add testCase to project
export async function POST(req: Request, { params }: Params) {
  const { id: projectId } = await params;
  const body = await req.json();
  const { testCaseId } = body;

  const projectCase = await prisma.testProjectCase.create({
    data: { projectId, testCaseId },
    include: {
      testCase: { include: { steps: { orderBy: { order: "asc" } } } },
      stepResults: true,
    },
  });
  return NextResponse.json(projectCase, { status: 201 });
}
