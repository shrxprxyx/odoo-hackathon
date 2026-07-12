import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
 
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Real-time asset and resource overview</p>
      </div>
 
      {/* KPI Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Available Assets", value: "42" },
          { label: "Allocated Assets", value: "18" },
          { label: "Maintenance Today", value: "3" },
          { label: "Active Bookings", value: "12" },
          { label: "Pending Transfers", value: "2" },
          { label: "Overdue Returns", value: "1" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-slate-400 text-sm">{kpi.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{kpi.value}</p>
          </Card>
        ))}
      </div>
 
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button>Register Asset</Button>
          <Button variant="secondary">Book Resource</Button>
          <Button variant="secondary">Raise Maintenance Request</Button>
        </CardContent>
      </Card>
    </div>
  );
}