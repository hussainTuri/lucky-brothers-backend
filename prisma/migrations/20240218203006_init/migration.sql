-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(50) NULL,
    `productName` VARCHAR(255) NOT NULL,
    `productTypeId` INTEGER NOT NULL,
    `stockQuantity` INTEGER NULL DEFAULT 0,
    `manufacturer` VARCHAR(255) NULL,
    `manufacturingYear` INTEGER NULL,
    `imagePath` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `size` VARCHAR(255) NULL,
    `diameter` INTEGER NULL,
    `speedIndex` VARCHAR(255) NULL,
    `loadIndex` VARCHAR(255) NULL,
    `season` VARCHAR(255) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `length` INTEGER NULL,
    `startStop` INTEGER NULL,
    `design` VARCHAR(255) NULL,
    `threadSize` VARCHAR(255) NULL,
    `buyingPrice` INTEGER NULL,
    `sellingPrice` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Product_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeName` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `buyingPrice` INTEGER NOT NULL,
    `sellingPrice` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `pricePerItem` INTEGER NOT NULL,
    `originalQuantity` INTEGER NOT NULL,
    `remainingQuantity` INTEGER NOT NULL,
    `comment` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductStock_createdAt_idx`(`createdAt`),
    INDEX `ProductStock_remainingQuantity_idx`(`remainingQuantity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Inventory_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NULL,
    `imagePath` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `balance` INTEGER NULL DEFAULT 0,

    UNIQUE INDEX `Customer_phone_key`(`phone`),
    FULLTEXT INDEX `Customer_customerName_idx`(`customerName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustomerTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `invoiceId` INTEGER NULL,
    `amount` INTEGER NOT NULL,
    `comment` VARCHAR(255) NULL,
    `typeId` TINYINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CustomerTransaction_createdAt_idx`(`createdAt`),
    INDEX `CustomerTransaction_updatedAt_idx`(`updatedAt`),
    INDEX `CustomerTransaction_typeId_idx`(`typeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NULL,
    `totalAmount` INTEGER NOT NULL,
    `dueDate` DATETIME NULL,
    `statusId` INTEGER NOT NULL,
    `comment` VARCHAR(255) NULL,
    `cancelledAt` DATETIME NULL,
    `refundedAt` DATETIME NULL,
    `driverName` VARCHAR(255) NULL,
    `vehicleName` VARCHAR(255) NULL,
    `vehicleRegistrationNumber` VARCHAR(255) NULL,
    `profit` INTEGER NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Invoice_dueDate_idx`(`dueDate`),
    INDEX `Invoice_createdAt_idx`(`createdAt`),
    INDEX `Invoice_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `subTotal` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItemProductStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceItemId` INTEGER NOT NULL,
    `productStockId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InvoiceItemProductStock_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `InvoiceItemProductStock_invoiceItemId_productStockId_key`(`invoiceItemId`, `productStockId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statusName` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoicePayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `customerTransactionId` INTEGER NULL,
    `amount` INTEGER NOT NULL,
    `comment` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `InvoicePayment_createdAt_idx`(`createdAt`),
    INDEX `InvoicePayment_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(255) NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NULL,
    `address` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `expenseDate` DATETIME NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonthlyProfit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monthYear` VARCHAR(7) NOT NULL,
    `sales` INTEGER NOT NULL,
    `expense` INTEGER NOT NULL,
    `profit` INTEGER NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MonthlyProfit_monthYear_key`(`monthYear`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_productTypeId_fkey` FOREIGN KEY (`productTypeId`) REFERENCES `ProductType`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `PriceHistory` ADD CONSTRAINT `PriceHistory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ProductStock` ADD CONSTRAINT `ProductStock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `CustomerTransaction` ADD CONSTRAINT `CustomerTransaction_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `CustomerTransaction` ADD CONSTRAINT `CustomerTransaction_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `InvoiceStatus`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `InvoiceItemProductStock` ADD CONSTRAINT `InvoiceItemProductStock_invoiceItemId_fkey` FOREIGN KEY (`invoiceItemId`) REFERENCES `InvoiceItem`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `InvoiceItemProductStock` ADD CONSTRAINT `InvoiceItemProductStock_productStockId_fkey` FOREIGN KEY (`productStockId`) REFERENCES `ProductStock`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `InvoicePayment` ADD CONSTRAINT `InvoicePayment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `InvoicePayment` ADD CONSTRAINT `InvoicePayment_customerTransactionId_fkey` FOREIGN KEY (`customerTransactionId`) REFERENCES `CustomerTransaction`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
