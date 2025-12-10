-- CreateEnum
CREATE TYPE "DailySmokingRange" AS ENUM ('UNDER_5', 'FROM_5_10', 'FROM_10_20', 'OVER_20', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('FIRST', 'NORMAL', 'EARLY');

-- CreateEnum
CREATE TYPE "ReasonCode" AS ENUM ('BREAK_TIME', 'STRESS', 'HABIT', 'BORED', 'SOCIAL', 'AFTER_MEAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CoachingMode" AS ENUM ('NONE', 'LIGHT', 'FULL');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_DELAY', 'DAILY_10_MINUTES', 'STREAK_3_DAYS', 'STREAK_7_DAYS', 'MAX_INTERVAL_90', 'TOTAL_200_MINUTES', 'TOTAL_500_MINUTES', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isGuest" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT,
    "passwordHash" TEXT,
    "nickname" TEXT,
    "dailySmokingRange" "DailySmokingRange",
    "dayStartTime" TEXT NOT NULL DEFAULT '04:00',
    "currentTargetInterval" INTEGER NOT NULL DEFAULT 60,
    "currentMotivation" TEXT,
    "totalDelayMinutes" INTEGER NOT NULL DEFAULT 0,
    "intervalLevel" INTEGER NOT NULL DEFAULT 1,
    "notifyOnTargetTime" BOOLEAN NOT NULL DEFAULT true,
    "notifyMorningDelay" BOOLEAN NOT NULL DEFAULT false,
    "notifyDailyReminder" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmokingRecord" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "smokedAt" TIMESTAMP(3) NOT NULL,
    "type" "RecordType" NOT NULL,
    "reasonCode" "ReasonCode",
    "reasonText" TEXT,
    "coachingMode" "CoachingMode" NOT NULL DEFAULT 'NONE',
    "emotionNote" TEXT,
    "delayedMinutes" INTEGER NOT NULL DEFAULT 0,
    "intervalFromPrevious" INTEGER,
    "targetIntervalAtTime" INTEGER,
    "wasOnTarget" BOOLEAN,

    CONSTRAINT "SmokingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "targetInterval" INTEGER NOT NULL,
    "motivation" TEXT,
    "totalSmoked" INTEGER NOT NULL DEFAULT 0,
    "averageInterval" DOUBLE PRECISION,
    "totalDelayMinutes" INTEGER NOT NULL DEFAULT 0,
    "firstSmokeTime" TIMESTAMP(3),
    "hasDelaySuccess" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isGuest_idx" ON "User"("isGuest");

-- CreateIndex
CREATE INDEX "SmokingRecord_userId_smokedAt_idx" ON "SmokingRecord"("userId", "smokedAt");

-- CreateIndex
CREATE INDEX "SmokingRecord_userId_createdAt_idx" ON "SmokingRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DailySnapshot_userId_date_idx" ON "DailySnapshot"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySnapshot_userId_date_key" ON "DailySnapshot"("userId", "date");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeType_key" ON "UserBadge"("userId", "badgeType");

-- AddForeignKey
ALTER TABLE "SmokingRecord" ADD CONSTRAINT "SmokingRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySnapshot" ADD CONSTRAINT "DailySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
