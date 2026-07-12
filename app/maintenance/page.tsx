import { Card, CardContent } from "@/components/ui/card";

export function MaintenancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Maintenance Management</h1>
        <p className="text-slate-400">Manage maintenance requests through approval workflow</p>
      </div>
 
      <Card>
        <CardContent>
          <p className="text-slate-300">Maintenance Kanban board coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}