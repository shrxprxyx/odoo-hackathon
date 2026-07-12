import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

/* =====================================================
   Existing interfaces (KEEP)
===================================================== */

export interface AllocationConflict {
  status: 409;
  error: string;
  currently_held_by: {
    holderId: number;
    holderName: string;
    holderDepartment: string;
  };
  suggested_action: "TRANSFER_REQUEST";
  assetId: number;
}

export interface AllocationSuccess {
  statusCode: 201;
  id: number;
  assetId: number;
  holderId: number;
  status: "ACTIVE";
  allocatedDate: string;
  expectedReturnDate?: string;
}

export interface AllocationFormState {
  assetId: number | null;
  recipientId: number | null;
  expectedReturnDate?: Date;
  conflict?: AllocationConflict;
  isSubmitting: boolean;
  error?: string;
}

/* =====================================================
   Backend allocation helpers
===================================================== */

interface AllocationHolder {
  id: number;
  firstName: string;
  lastName: string;
}

interface AllocationAsset {
  id: number;
  status: string;
}

interface Allocation {
  id: number;
  assetId: number;
  holderId: number | null;
  holderDeptId: number | null;
  holderType: "EMPLOYEE" | "DEPARTMENT";
  status: "ACTIVE" | "RETURNED";
  allocatedDate: Date;
  expectedReturnDate?: Date | null;
  returnedDate?: Date | null;
  returnCondition?: "GOOD" | "FAIR" | "POOR" | null;
  returnNotes?: string | null;
  holder?: AllocationHolder | null;
  asset?: AllocationAsset | null;
}

interface CurrentlyHeldBy {
  id: number;
  name: string;
  allocatedDate: Date;
}

interface AllocationResult {
  success: boolean;
  allocation?: Allocation;
  error?: string;
  currentlyHeldBy?: CurrentlyHeldBy;
}

/* =====================================================
   Allocate Asset
===================================================== */

export async function allocateAsset(
  assetId: number,
  holderId: number | null,
  holderDeptId: number | null,
  holderType: "EMPLOYEE" | "DEPARTMENT",
  expectedReturnDate?: Date,
  actorId?: number
): Promise<AllocationResult> {
  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const asset = await tx.asset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        return {
          success: false,
          error: "Asset not found",
        };
      }

      const existingAllocation = await tx.allocation.findFirst({
        where: {
          assetId,
          status: "ACTIVE",
        },
        include: {
          holder: true,
        },
      });

      if (existingAllocation) {
        return {
          success: false,
          error: "Asset already allocated",
          currentlyHeldBy: {
            id: existingAllocation.holder?.id ?? 0,
            name: existingAllocation.holder
              ? `${existingAllocation.holder.firstName} ${existingAllocation.holder.lastName}`
              : "Unknown",
            allocatedDate: existingAllocation.allocatedDate,
          },
        };
      }

      const allocation = await tx.allocation.create({
        data: {
          assetId,
          holderId,
          holderDeptId,
          holderType,
          expectedReturnDate,
          status: "ACTIVE",
        },
        include: {
          holder: true,
          asset: true,
        },
      });

      await tx.asset.update({
        where: { id: assetId },
        data: {
          status: "ALLOCATED",
        },
      });

      return {
        success: true,
        allocation,
      };
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/* =====================================================
   Transfer Asset
===================================================== */

export async function transferAsset(
  assetId: number,
  fromHolderId: number,
  toHolderId: number,
  reason?: string,
  actorId?: number
): Promise<AllocationResult> {
  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const current = await tx.allocation.findFirst({
        where: {
          assetId,
          status: "ACTIVE",
        },
      });

      if (!current) {
        return {
          success: false,
          error: "No active allocation",
        };
      }

      if (current.holderId !== fromHolderId) {
        return {
          success: false,
          error: "Holder mismatch",
        };
      }

      await tx.allocation.update({
        where: {
          id: current.id,
        },
        data: {
          status: "RETURNED",
          returnedDate: new Date(),
        },
      });

      const allocation = await tx.allocation.create({
        data: {
          assetId,
          holderId: toHolderId,
          holderType: "EMPLOYEE",
          status: "ACTIVE",
        },
        include: {
          holder: true,
          asset: true,
        },
      });

      return {
        success: true,
        allocation,
      };
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/* =====================================================
   Return Asset
===================================================== */

export async function returnAsset(
  allocationId: number,
  condition: "GOOD" | "FAIR" | "POOR",
  returnNotes?: string,
  actorId?: number
): Promise<AllocationResult> {
  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const allocation = await tx.allocation.findUnique({
        where: {
          id: allocationId,
        },
      });

      if (!allocation) {
        return {
          success: false,
          error: "Allocation not found",
        };
      }

      if (allocation.status !== "ACTIVE") {
        return {
          success: false,
          error: "Allocation already closed",
        };
      }

      const updated = await tx.allocation.update({
        where: {
          id: allocationId,
        },
        data: {
          status: "RETURNED",
          returnedDate: new Date(),
          returnCondition: condition,
          returnNotes,
        },
      });

      await tx.asset.update({
        where: {
          id: allocation.assetId,
        },
        data: {
          status: "AVAILABLE",
        },
      });

      return {
        success: true,
        allocation: updated,
      };
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}