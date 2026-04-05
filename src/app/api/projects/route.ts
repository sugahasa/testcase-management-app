import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.testProject.findMany({
    include: {
      cases: {
        include: {
          testCase: { include: { steps: { orderBy: { order: "asc" } } } },
          stepResults: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, description, projectType, testPlan } = body;
  const project = await prisma.testProject.create({
    data: {
      name,
      description: description ?? "",
      projectType: projectType ?? "MANUAL",
      testPlan: testPlan ?? "",
    },
    include: { cases: true },
  });
  return NextResponse.json(project, { status: 201 });
}
