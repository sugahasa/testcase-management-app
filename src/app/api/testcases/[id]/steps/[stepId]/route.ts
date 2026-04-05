import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; stepId: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { stepId } = await params;
  const body = await req.json();
  const { summary, detail } = body;
  const step = await prisma.testStep.update({
    where: { id: stepId },
    data: { summary, detail },
  });
  return NextResponse.json(step);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id: testCaseId, stepId } = await params;
  await prisma.testStep.delete({ where: { id: stepId } });

  // reorder remaining steps
  const remaining = await prisma.testStep.findMany({
    where: { testCaseId },
    orderBy: { order: "asc" },
  });
  await Promise.all(
    remaining.map((s, i) => prisma.testStep.update({ where: { id: s.id }, data: { order: i + 1 } }))
  );
  return NextResponse.json({ ok: true });
}
