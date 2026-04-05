import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Development only: reset all data for demo/testing
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }
  await prisma.testStepResult.deleteMany();
  await prisma.testProjectCase.deleteMany();
  await prisma.testProject.deleteMany();
  await prisma.testStep.deleteMany();
  await prisma.testCase.deleteMany();
  return NextResponse.json({ ok: true });
}
