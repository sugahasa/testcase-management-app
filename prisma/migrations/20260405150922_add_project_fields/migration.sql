-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "projectType" TEXT NOT NULL DEFAULT 'MANUAL',
    "testPlan" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TestProject" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "TestProject";
DROP TABLE "TestProject";
ALTER TABLE "new_TestProject" RENAME TO "TestProject";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
