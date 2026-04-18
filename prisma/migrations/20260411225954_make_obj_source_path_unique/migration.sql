/*
  Warnings:

  - A unique constraint covering the columns `[objSourcePath]` on the table `share` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "share_objSourcePath_key" ON "share"("objSourcePath");
