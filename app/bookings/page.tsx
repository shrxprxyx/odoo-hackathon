import { Card, CardContent } from "@/components/ui/card";

export function BookingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Resource Booking</h1>
        <p className="text-slate-400">Book shared resources with overlap validation</p>
      </div>
 
      <Card>
        <CardContent>
          <p className="text-slate-300">Booking calendar and form coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}