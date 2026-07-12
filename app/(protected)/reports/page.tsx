import { Card, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Reports & Analytics
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Utilization trends, maintenance frequency, and more
        </p>
      </div>

      <Card>
        <CardContent>
          <p className="text-muted-foreground">Charts and reports coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}