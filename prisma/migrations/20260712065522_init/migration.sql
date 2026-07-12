-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "departmentId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentDeptId" INTEGER,
    "headId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Department_parentDeptId_fkey" FOREIGN KEY ("parentDeptId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "customFields" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "serialNumber" TEXT,
    "acquisitionDate" DATETIME,
    "acquisitionCost" REAL,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "location" TEXT,
    "isBookable" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "photoUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "actorId" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssetHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Allocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "holderId" INTEGER,
    "holderDeptId" INTEGER,
    "holderType" TEXT NOT NULL,
    "expectedReturnDate" DATETIME,
    "allocatedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedDate" DATETIME,
    "returnCondition" TEXT,
    "returnNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Allocation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Allocation_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "fromHolderId" INTEGER,
    "toHolderId" INTEGER NOT NULL,
    "requestedBy" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" INTEGER,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransferRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransferRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TransferRequest_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resourceId" INTEGER NOT NULL,
    "bookerId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResourceBooking_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ResourceBooking_bookerId_fkey" FOREIGN KEY ("bookerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assetId" INTEGER NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" INTEGER,
    "approvedAt" DATETIME,
    "technicianId" INTEGER,
    "assignedAt" DATETIME,
    "resolutionNotes" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceRequest_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditCycle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" INTEGER NOT NULL,
    "closedBy" INTEGER,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditAssignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cycleId" INTEGER NOT NULL,
    "auditorId" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditAssignment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AuditCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditAssignment_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditFinding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cycleId" INTEGER NOT NULL,
    "assetId" INTEGER NOT NULL,
    "auditorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "auditorNotes" TEXT,
    "conditionBefore" TEXT,
    "conditionAfter" TEXT,
    "resolutionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AuditFinding_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AuditCycle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AuditFinding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditFinding_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "relatedResourceType" TEXT,
    "relatedResourceId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actorId" INTEGER,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" INTEGER,
    "changes" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Department_status_idx" ON "Department"("status");

-- CreateIndex
CREATE INDEX "Department_parentDeptId_idx" ON "Department"("parentDeptId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetCategory_name_key" ON "AssetCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_categoryId_idx" ON "Asset"("categoryId");

-- CreateIndex
CREATE INDEX "Asset_isBookable_idx" ON "Asset"("isBookable");

-- CreateIndex
CREATE INDEX "AssetHistory_assetId_idx" ON "AssetHistory"("assetId");

-- CreateIndex
CREATE INDEX "Allocation_assetId_idx" ON "Allocation"("assetId");

-- CreateIndex
CREATE INDEX "Allocation_holderId_idx" ON "Allocation"("holderId");

-- CreateIndex
CREATE INDEX "Allocation_status_idx" ON "Allocation"("status");

-- CreateIndex
CREATE INDEX "Allocation_expectedReturnDate_idx" ON "Allocation"("expectedReturnDate");

-- CreateIndex
CREATE INDEX "TransferRequest_assetId_idx" ON "TransferRequest"("assetId");

-- CreateIndex
CREATE INDEX "TransferRequest_status_idx" ON "TransferRequest"("status");

-- CreateIndex
CREATE INDEX "ResourceBooking_resourceId_idx" ON "ResourceBooking"("resourceId");

-- CreateIndex
CREATE INDEX "ResourceBooking_bookerId_idx" ON "ResourceBooking"("bookerId");

-- CreateIndex
CREATE INDEX "ResourceBooking_status_idx" ON "ResourceBooking"("status");

-- CreateIndex
CREATE INDEX "ResourceBooking_startTime_endTime_idx" ON "ResourceBooking"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_assetId_idx" ON "MaintenanceRequest"("assetId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_requesterId_idx" ON "MaintenanceRequest"("requesterId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditAssignment_cycleId_auditorId_key" ON "AuditAssignment"("cycleId", "auditorId");

-- CreateIndex
CREATE INDEX "AuditFinding_cycleId_idx" ON "AuditFinding"("cycleId");

-- CreateIndex
CREATE INDEX "AuditFinding_assetId_idx" ON "AuditFinding"("assetId");

-- CreateIndex
CREATE INDEX "AuditFinding_status_idx" ON "AuditFinding"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_idx" ON "ActivityLog"("actorId");

-- CreateIndex
CREATE INDEX "ActivityLog_resourceType_resourceId_idx" ON "ActivityLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "ActivityLog_timestamp_idx" ON "ActivityLog"("timestamp");
