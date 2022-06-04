/*
  Warnings:

  - You are about to drop the `admin_role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guilds_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leveling_track` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mod_role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `track_blacklisted_role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `track_channel_multiplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `track_role_multiplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `track_whitelisted_role` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LevelingTrackType" AS ENUM ('points', 'levels');

-- DropForeignKey
ALTER TABLE "admin_role" DROP CONSTRAINT "admin_role_guildId_fkey";

-- DropForeignKey
ALTER TABLE "leveling_track" DROP CONSTRAINT "leveling_track_guildId_fkey";

-- DropForeignKey
ALTER TABLE "mod_role" DROP CONSTRAINT "mod_role_guildId_fkey";

-- DropForeignKey
ALTER TABLE "track_blacklisted_role" DROP CONSTRAINT "track_blacklisted_role_trackId_fkey";

-- DropForeignKey
ALTER TABLE "track_channel_multiplier" DROP CONSTRAINT "track_channel_multiplier_trackId_fkey";

-- DropForeignKey
ALTER TABLE "track_role_multiplier" DROP CONSTRAINT "track_role_multiplier_trackId_fkey";

-- DropForeignKey
ALTER TABLE "track_whitelisted_role" DROP CONSTRAINT "track_whitelisted_role_trackId_fkey";

-- DropTable
DROP TABLE "admin_role";

-- DropTable
DROP TABLE "guilds_settings";

-- DropTable
DROP TABLE "leveling_track";

-- DropTable
DROP TABLE "mod_role";

-- DropTable
DROP TABLE "track_blacklisted_role";

-- DropTable
DROP TABLE "track_channel_multiplier";

-- DropTable
DROP TABLE "track_role_multiplier";

-- DropTable
DROP TABLE "track_whitelisted_role";

-- DropEnum
DROP TYPE "leveling_track_type";

-- CreateTable
CREATE TABLE "GuildsSettings" (
    "guildId" TEXT NOT NULL,

    CONSTRAINT "GuildsSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "ModRole" (
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "ModRole_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "AdminRole" (
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "TrackBlacklistedRole" (
    "guildId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "TrackBlacklistedRole_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "TrackWhitelistedRole" (
    "guildId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "TrackWhitelistedRole_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "TrackRoleMultiplier" (
    "guildId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,
    "multiplier" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TrackRoleMultiplier_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "TrackChannelMultiplier" (
    "guildId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "channelId" TEXT NOT NULL,
    "multiplier" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TrackChannelMultiplier_pkey" PRIMARY KEY ("channelId")
);

-- CreateTable
CREATE TABLE "LevelingTrack" (
    "guildId" TEXT NOT NULL,
    "trackId" SERIAL NOT NULL,
    "trackName" TEXT NOT NULL,
    "type" "LevelingTrackType" NOT NULL,
    "globalMultiplier" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LevelingTrack_pkey" PRIMARY KEY ("trackId")
);

-- AddForeignKey
ALTER TABLE "ModRole" ADD CONSTRAINT "ModRole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildsSettings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "AdminRole" ADD CONSTRAINT "AdminRole_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildsSettings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TrackBlacklistedRole" ADD CONSTRAINT "TrackBlacklistedRole_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "LevelingTrack"("trackId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TrackWhitelistedRole" ADD CONSTRAINT "TrackWhitelistedRole_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "LevelingTrack"("trackId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TrackRoleMultiplier" ADD CONSTRAINT "TrackRoleMultiplier_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "LevelingTrack"("trackId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TrackChannelMultiplier" ADD CONSTRAINT "TrackChannelMultiplier_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "LevelingTrack"("trackId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LevelingTrack" ADD CONSTRAINT "LevelingTrack_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "GuildsSettings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;
