-- CreateTable
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `gender` VARCHAR(191) NOT NULL DEFAULT 'other',
  `partnerId` VARCHAR(191) NULL,
  `pairingCode` VARCHAR(191) NULL,
  `relationshipConfirmedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Relationship` (
  `id` VARCHAR(191) NOT NULL,
  `userOneId` VARCHAR(191) NOT NULL,
  `userTwoId` VARCHAR(191) NULL,
  `coupleNames` JSON NOT NULL,
  `startedOn` DATETIME(3) NOT NULL,
  `milestones` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Memory` (
  `id` VARCHAR(191) NOT NULL,
  `relationshipId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `photoUrl` VARCHAR(191) NOT NULL,
  `location` JSON NOT NULL,
  `happenedOn` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
  `id` VARCHAR(191) NOT NULL,
  `relationshipId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `scheduledOn` DATETIME(3) NOT NULL,
  `attachments` JSON NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'upcoming',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BucketItem` (
  `id` VARCHAR(191) NOT NULL,
  `relationshipId` VARCHAR(191) NOT NULL,
  `position` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
  `id` VARCHAR(191) NOT NULL,
  `relationshipId` VARCHAR(191) NOT NULL,
  `author` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `User_partnerId_key` ON `User`(`partnerId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_pairingCode_key` ON `User`(`pairingCode`);

-- CreateIndex
CREATE INDEX `Relationship_userOneId_idx` ON `Relationship`(`userOneId`);

-- CreateIndex
CREATE INDEX `Relationship_userTwoId_idx` ON `Relationship`(`userTwoId`);

-- CreateIndex
CREATE INDEX `Memory_relationshipId_idx` ON `Memory`(`relationshipId`);

-- CreateIndex
CREATE INDEX `Plan_relationshipId_idx` ON `Plan`(`relationshipId`);

-- CreateIndex
CREATE UNIQUE INDEX `BucketItem_relationshipId_position_key` ON `BucketItem`(`relationshipId`, `position`);

-- CreateIndex
CREATE INDEX `Message_relationshipId_idx` ON `Message`(`relationshipId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relationship` ADD CONSTRAINT `Relationship_userOneId_fkey` FOREIGN KEY (`userOneId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relationship` ADD CONSTRAINT `Relationship_userTwoId_fkey` FOREIGN KEY (`userTwoId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Memory` ADD CONSTRAINT `Memory_relationshipId_fkey` FOREIGN KEY (`relationshipId`) REFERENCES `Relationship`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Plan` ADD CONSTRAINT `Plan_relationshipId_fkey` FOREIGN KEY (`relationshipId`) REFERENCES `Relationship`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BucketItem` ADD CONSTRAINT `BucketItem_relationshipId_fkey` FOREIGN KEY (`relationshipId`) REFERENCES `Relationship`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_relationshipId_fkey` FOREIGN KEY (`relationshipId`) REFERENCES `Relationship`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
