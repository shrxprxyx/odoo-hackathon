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
