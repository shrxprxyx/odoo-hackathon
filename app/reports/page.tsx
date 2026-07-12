import { Card, CardContent } from "@/components/ui/card";
export function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
        <p className="text-slate-400">Utilization trends, maintenance frequency, and more</p>
      </div>
 
      <Card>
        <CardContent>
          <p className="text-slate-300">Charts and reports coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}