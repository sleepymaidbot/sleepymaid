-- CreateTable
CREATE TABLE "mondecorte" (
    "user_id" TEXT NOT NULL,
    "custom_role_id" TEXT,
    "points" INTEGER DEFAULT 0,
    "social_credit" INTEGER DEFAULT 500,
    "vote" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "mondecorte_user_id_key" ON "mondecorte"("user_id");
