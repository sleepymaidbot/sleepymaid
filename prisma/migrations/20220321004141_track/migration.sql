-- CreateEnum
CREATE TYPE "leveling_track_type" AS ENUM ('points', 'levels');

-- CreateTable
CREATE TABLE "guildSettings" (
    "guildId" TEXT NOT NULL,

    CONSTRAINT "guildSettings_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "mod_role" (
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "mod_role_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "admin_role" (
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "admin_role_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "track_blacklisted_role" (
    "guildId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "track_blacklisted_role_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "track_whitelisted_role" (
    "guildId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "track_whitelisted_role_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "track_role_multiplier" (
    "guildId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "roleId" TEXT NOT NULL,
    "multiplier" INTEGER NOT NULL,

    CONSTRAINT "track_role_multiplier_pkey" PRIMARY KEY ("roleId")
);

-- CreateTable
CREATE TABLE "track_channel_multiplier" (
    "guildId" TEXT NOT NULL,
    "trackId" INTEGER NOT NULL,
    "channelId" TEXT NOT NULL,
    "multiplier" INTEGER NOT NULL,

    CONSTRAINT "track_channel_multiplier_pkey" PRIMARY KEY ("channelId")
);

-- CreateTable
CREATE TABLE "leveling_track" (
    "guildId" TEXT NOT NULL,
    "trackId" SERIAL NOT NULL,
    "trackName" TEXT NOT NULL,
    "type" "leveling_track_type" NOT NULL,
    "globalMultiplier" INTEGER NOT NULL,

    CONSTRAINT "leveling_track_pkey" PRIMARY KEY ("trackId")
);

-- AddForeignKey
ALTER TABLE "mod_role" ADD CONSTRAINT "mod_role_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guildSettings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admin_role" ADD CONSTRAINT "admin_role_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guildSettings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "track_blacklisted_role" ADD CONSTRAINT "track_blacklisted_role_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "leveling_track"("trackId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "track_whitelisted_role" ADD CONSTRAINT "track_whitelisted_role_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "leveling_track"("trackId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "track_role_multiplier" ADD CONSTRAINT "track_role_multiplier_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "leveling_track"("trackId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "track_channel_multiplier" ADD CONSTRAINT "track_channel_multiplier_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "leveling_track"("trackId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "leveling_track" ADD CONSTRAINT "leveling_track_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guildSettings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;
