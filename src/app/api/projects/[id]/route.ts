import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const project = await prisma.testProject.findUnique({
    where: { id },
    include: {
      cases: {
        include: {
          testCase: { include: { steps: { orderBy: { order: "asc" } } } },
          stepResults: true,
        },
      },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { name, description, projectType, testPlan } = body;
  const project = await prisma.testProject.update({
    where: { id },
    data: {
      name,
      description: description ?? "",
      projectType: projectType ?? "MANUAL",
      testPlan: testPlan ?? "",
    },
    include: {
      cases: {
        include: {
          testCase: { include: { steps: { orderBy: { order: "asc" } } } },
          stepResults: true,
        },
      },
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.testProject.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
