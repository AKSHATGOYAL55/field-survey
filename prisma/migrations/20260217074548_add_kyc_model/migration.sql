-- CreateTable
CREATE TABLE "KYC" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aadharName" TEXT NOT NULL,
    "aadharNumber" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KYC_userId_key" ON "KYC"("userId");

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
