import { z } from "zod";

// ── Auth Schemas ─────────────────────────────────────
export const SignupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignupInput = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ── Department Schemas ───────────────────────────────
export const DepartmentSchema = z.object({
  name: z.string().min(1, "Department name required"),
  description: z.string().optional(),
  headId: z.number().optional().nullable(),
  parentDeptId: z.number().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
export type DepartmentInput = z.infer<typeof DepartmentSchema>;

// ── Asset Category Schemas ───────────────────────────
export const AssetCategorySchema = z.object({
  name: z.string().min(1, "Category name required").max(100),
  description: z.string().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});
export type AssetCategoryInput = z.infer<typeof AssetCategorySchema>;

// ── Asset Schemas ────────────────────────────────────
export const AssetSchema = z.object({
  name: z.string().min(1, "Asset name required"),
  categoryId: z.number().min(1, "Category required"),
  serialNumber: z.string().optional(),
  acquisitionDate: z.date().optional(),
  acquisitionCost: z.number().optional(),
  condition: z.enum(["GOOD", "FAIR", "POOR"]).default("GOOD"),
  location: z.string().optional(),
  isBookable: z.boolean().default(false),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional(),
});
export type AssetInput = z.infer<typeof AssetSchema>;

// Full asset with auto-generated tag (read-only)
export const AssetDetailSchema = AssetSchema.extend({
  assetTag: z.string(),
  status: z.enum([
    "AVAILABLE",
    "ALLOCATED",
    "RESERVED",
    "UNDER_MAINTENANCE",
    "LOST",
    "RETIRED",
    "DISPOSED",
  ]),
});
export type AssetDetail = z.infer<typeof AssetDetailSchema>;

// ── Allocation Schemas ───────────────────────────────
export const AllocationSchema = z.object({
  assetId: z.number().min(1),
  holderId: z.number().min(1, "Employee required"),
  holderType: z.enum(["EMPLOYEE", "DEPARTMENT"]).default("EMPLOYEE"),
  expectedReturnDate: z.date().optional(),
});
export type AllocationInput = z.infer<typeof AllocationSchema>;

export const AllocationDetailSchema = AllocationSchema.extend({
  status: z.enum(["ACTIVE", "RETURNED", "OVERDUE"]),
  allocatedDate: z.date(),
  returnedDate: z.date().nullable(),
  returnCondition: z.enum(["GOOD", "FAIR", "POOR"]).nullable(),
  returnNotes: z.string().nullable(),
});
export type AllocationDetail = z.infer<typeof AllocationDetailSchema>;

// Return an allocation
export const AllocationReturnSchema = z.object({
  condition: z.enum(["GOOD", "FAIR", "POOR"]),
  returnNotes: z.string().optional(),
});
export type AllocationReturnInput = z.infer<typeof AllocationReturnSchema>;

// ── Transfer Request Schemas ─────────────────────────
export const TransferRequestSchema = z.object({
  assetId: z.number().min(1),
  fromHolderId: z.number().optional(),
  toHolderId: z.number().min(1, "Recipient required"),
  reason: z.string().optional(),
});
export type TransferRequestInput = z.infer<typeof TransferRequestSchema>;

export const TransferRequestDetailSchema = TransferRequestSchema.extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]),
});
export type TransferRequestDetail = z.infer<typeof TransferRequestDetailSchema>;

// ── Resource Booking Schemas ─────────────────────────
export const ResourceBookingSchema = z.object({
  resourceId: z.number().min(1, "Resource required"),
  startTime: z.date(),
  endTime: z.date(),
  purpose: z.string().optional(),
});
export type ResourceBookingInput = z.infer<typeof ResourceBookingSchema>;

export const ResourceBookingDetailSchema = ResourceBookingSchema.extend({
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]),
});
export type ResourceBookingDetail = z.infer<typeof ResourceBookingDetailSchema>;

// ── Maintenance Request Schemas ──────────────────────
export const MaintenanceRequestSchema = z.object({
  assetId: z.number().min(1),
  description: z.string().min(5, "Description required"),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .default("MEDIUM"),
  photoUrl: z.string().url().optional(),
});
export type MaintenanceRequestInput = z.infer<typeof MaintenanceRequestSchema>;

export const MaintenanceRequestDetailSchema = MaintenanceRequestSchema.extend({
  status: z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
    "IN_PROGRESS",
    "RESOLVED",
  ]),
  technicianId: z.number().nullable(),
  resolutionNotes: z.string().nullable(),
});
export type MaintenanceRequestDetail = z.infer<
  typeof MaintenanceRequestDetailSchema
>;

// ── Audit Schemas ────────────────────────────────────
export const AuditCycleSchema = z.object({
  name: z.string().min(1, "Audit name required"),
  scopeType: z.enum(["DEPARTMENT", "LOCATION", "ALL"]),
  scopeId: z.number().optional(),
  startDate: z.date(),
  endDate: z.date(),
});
export type AuditCycleInput = z.infer<typeof AuditCycleSchema>;

export const AuditFindingSchema = z.object({
  cycleId: z.number().min(1),
  assetId: z.number().min(1),
  auditorId: z.number().min(1),
  status: z.enum(["VERIFIED", "MISSING", "DAMAGED"]),
  auditorNotes: z.string().optional(),
  conditionBefore: z.enum(["GOOD", "FAIR", "POOR"]).optional(),
  conditionAfter: z.enum(["GOOD", "FAIR", "POOR"]).optional(),
});
export type AuditFindingInput = z.infer<typeof AuditFindingSchema>;

// ── Employee/User Schemas ────────────────────────────
export const PromoteEmployeeSchema = z.object({
  role: z.enum(["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]),
});
export type PromoteEmployeeInput = z.infer<typeof PromoteEmployeeSchema>;