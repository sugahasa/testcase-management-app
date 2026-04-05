import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const testCases = await prisma.testCase.findMany({
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(testCases);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, priority, testType, precondition } = body;
  const testCase = await prisma.testCase.create({
    data: { title, priority, testType, precondition: precondition ?? "" },
    include: { steps: true },
  });
  return NextResponse.json(testCase, { status: 201 });
}
