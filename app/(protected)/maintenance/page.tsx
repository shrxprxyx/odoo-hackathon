import { Card, CardContent } from "@/components/ui/card";

export default function MaintenancePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Maintenance Management
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage maintenance requests through approval workflow
        </p>
      </div>

      <Card>
        <CardContent>
          <p className="text-muted-foreground">
            Maintenance Kanban board coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}