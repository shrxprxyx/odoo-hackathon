import { Card, CardContent } from "@/components/ui/card";

export default function AllocationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Allocation & Transfer</h1>
        <p className="text-slate-400">Manage asset allocation and transfer requests</p>
      </div>
 
      <Card>
        <CardContent>
          <p className="text-slate-300">Allocation and transfer forms coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}