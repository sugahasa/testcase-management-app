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
  const { name } = body;
  const project = await prisma.testProject.create({
    data: { name },
    include: { cases: true },
  });
  return NextResponse.json(project, { status: 201 });
}
