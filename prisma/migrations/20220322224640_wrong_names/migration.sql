/*
  Warnings:

  - You are about to drop the `guildSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admin_role" DROP CONSTRAINT "admin_role_guildId_fkey";

-- DropForeignKey
ALTER TABLE "leveling_track" DROP CONSTRAINT "leveling_track_guildId_fkey";

-- DropForeignKey
ALTER TABLE "mod_role" DROP CONSTRAINT "mod_role_guildId_fkey";

-- DropTable
DROP TABLE "guildSettings";

-- CreateTable
CREATE TABLE "guilds_settings" (
    "guildId" TEXT NOT NULL,

    CONSTRAINT "guilds_settings_pkey" PRIMARY KEY ("guildId")
);

-- AddForeignKey
ALTER TABLE "mod_role" ADD CONSTRAINT "mod_role_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds_settings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admin_role" ADD CONSTRAINT "admin_role_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds_settings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "leveling_track" ADD CONSTRAINT "leveling_track_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds_settings"("guildId") ON DELETE CASCADE ON UPDATE NO ACTION;
