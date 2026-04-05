import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id: testCaseId } = await params;
  const body = await req.json();
  const { summary, detail } = body;

  const lastStep = await prisma.testStep.findFirst({
    where: { testCaseId },
    orderBy: { order: "desc" },
  });
  const order = (lastStep?.order ?? 0) + 1;

  const step = await prisma.testStep.create({
    data: { testCaseId, summary, detail: detail ?? "", order },
  });
  await prisma.testCase.update({ where: { id: testCaseId }, data: { updatedAt: new Date() } });
  return NextResponse.json(step, { status: 201 });
}
