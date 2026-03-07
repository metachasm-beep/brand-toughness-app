const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres:p%3F3!-7jC9_diNAw@db.pbfkvjosccsyuzeorerd.supabase.co:5432/postgres?sslmode=require",
});

const sql = `
-- Drop existing tables if they exist to avoid conflicts (optional but safer since we got errors)
-- DROP TABLE IF EXISTS "AuditFinding";
-- DROP TABLE IF EXISTS "Audit";
-- DROP TABLE IF EXISTS "User";

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "overallScore" INTEGER,
    "categories" JSONB,
    "userEmail" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP,
    "meta" JSONB,
    CONSTRAINT "Audit_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User" ("email") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "recommendation" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "evidence" JSONB,
    CONSTRAINT "AuditFinding_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_email_key') THEN
        CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Audit_uid_key') THEN
        CREATE UNIQUE INDEX "Audit_uid_key" ON "Audit"("uid");
    END IF;
END $$;
`;

async function apply() {
  try {
    await client.connect();
    console.log('Connected to Supabase');
    await client.query(sql);
    console.log('Database structures created successfully');
  } catch (err) {
    console.error('Migration failed', err.stack);
  } finally {
    await client.end();
  }
}
apply();
