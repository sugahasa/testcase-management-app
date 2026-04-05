import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// Upsert step result
export async function POST(req: Request, { params }: Params) {
  const { id: projectId } = await params;
  const body = await req.json();
  const { projectCaseId, stepId, result, note } = body;

  // verify projectCase belongs to this project
  const projectCase = await prisma.testProjectCase.findFirst({
    where: { id: projectCaseId, projectId },
  });
  if (!projectCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stepResult = await prisma.testStepResult.upsert({
    where: { projectCaseId_stepId: { projectCaseId, stepId } },
    create: { projectCaseId, stepId, result, note: note ?? "" },
    update: { result, note: note ?? "" },
  });
  return NextResponse.json(stepResult);
}
