import { Card, CardContent } from "@/components/ui/card";

export default function AllocationsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Allocation & Transfer
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage asset allocation and transfer requests
        </p>
      </div>

      <Card>
        <CardContent>
          <p className="text-muted-foreground">
            Allocation and transfer forms coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}