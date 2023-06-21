-- CreateTable
CREATE TABLE `User` (
    `userId` VARCHAR(191) NOT NULL,
    `starRailUID` VARCHAR(191) NOT NULL,
    `hoyoCookie` VARCHAR(191) NOT NULL,
    `firstUse` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `User_userId_key`(`userId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
