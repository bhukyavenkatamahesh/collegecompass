-- CreateIndex
CREATE INDEX "Cutoff_examType_year_category_idx" ON "Cutoff"("examType", "year", "category");

-- CreateIndex
CREATE INDEX "Cutoff_examType_year_category_instituteType_idx" ON "Cutoff"("examType", "year", "category", "instituteType");

-- CreateIndex
CREATE INDEX "Cutoff_examType_year_category_source_idx" ON "Cutoff"("examType", "year", "category", "source");

-- CreateIndex
CREATE INDEX "Cutoff_examType_year_category_paper_idx" ON "Cutoff"("examType", "year", "category", "paper");

-- CreateIndex
CREATE INDEX "Cutoff_institute_idx" ON "Cutoff"("institute");
