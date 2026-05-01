-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "title" TEXT,
    "hospital" TEXT NOT NULL DEFAULT '',
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT NOT NULL DEFAULT '',
    "specialtyDesc" TEXT NOT NULL DEFAULT '',
    "consultationFee" INTEGER NOT NULL DEFAULT 0,
    "profile" TEXT NOT NULL DEFAULT '',
    "intlCertification" TEXT NOT NULL DEFAULT '',
    "techAdvantages" TEXT NOT NULL DEFAULT '',
    "primaryCategory" TEXT NOT NULL DEFAULT '常规病症咨询',
    "tags" TEXT NOT NULL DEFAULT '',
    "customPrompt" TEXT,
    "knowledgeFiles" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "sourceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KnowledgeDocument_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConsultationSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT,
    "userDisplayName" TEXT,
    "userLocale" TEXT NOT NULL DEFAULT 'en-US',
    "messageHistoryJson" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_fullName_key" ON "Doctor"("fullName");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_doctorId_idx" ON "KnowledgeDocument"("doctorId");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_language_idx" ON "KnowledgeDocument"("language");

-- CreateIndex
CREATE UNIQUE INDEX "HealthArticle_slug_key" ON "HealthArticle"("slug");

-- CreateIndex
CREATE INDEX "HealthArticle_language_locale_idx" ON "HealthArticle"("language", "locale");

-- CreateIndex
CREATE INDEX "HealthArticle_published_idx" ON "HealthArticle"("published");

-- CreateIndex
CREATE INDEX "ConsultationSession_doctorId_idx" ON "ConsultationSession"("doctorId");

-- CreateIndex
CREATE INDEX "ConsultationSession_userLocale_idx" ON "ConsultationSession"("userLocale");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
