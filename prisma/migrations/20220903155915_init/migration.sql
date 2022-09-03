-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "onContract" BOOLEAN NOT NULL DEFAULT false,
    "department" TEXT NOT NULL,
    "subDepartment" TEXT NOT NULL
);
