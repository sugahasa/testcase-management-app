import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const testCase = await prisma.testCase.findUnique({
    where: { id },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!testCase) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(testCase);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { title, priority, testType, precondition } = body;
  const testCase = await prisma.testCase.update({
    where: { id },
    data: { title, priority, testType, precondition: precondition ?? "" },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(testCase);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.testCase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
