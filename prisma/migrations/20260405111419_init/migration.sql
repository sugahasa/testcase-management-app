-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "testType" TEXT NOT NULL DEFAULT 'FUNCTIONAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TestStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "detail" TEXT NOT NULL DEFAULT '',
    "testCaseId" TEXT NOT NULL,
    CONSTRAINT "TestStep_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TestProjectCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    CONSTRAINT "TestProjectCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "TestProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestProjectCase_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestStepResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectCaseId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'NOT_EXECUTED',
    "note" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "TestStepResult_projectCaseId_fkey" FOREIGN KEY ("projectCaseId") REFERENCES "TestProjectCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestStepResult_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "TestStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TestProjectCase_projectId_testCaseId_key" ON "TestProjectCase"("projectId", "testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "TestStepResult_projectCaseId_stepId_key" ON "TestStepResult"("projectCaseId", "stepId");
