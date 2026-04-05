import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; caseId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { caseId } = await params;
  await prisma.testProjectCase.delete({ where: { id: caseId } });
  return NextResponse.json({ ok: true });
}
