import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// Body: { orderedIds: string[] } — full list of step IDs in new order
export async function PUT(req: Request, { params }: Params) {
  const { id: testCaseId } = await params;
  const { orderedIds }: { orderedIds: string[] } = await req.json();

  await Promise.all(
    orderedIds.map((stepId, index) =>
      prisma.testStep.update({
        where: { id: stepId, testCaseId },
        data: { order: index + 1 },
      })
    )
  );

  const steps = await prisma.testStep.findMany({
    where: { testCaseId },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(steps);
}
