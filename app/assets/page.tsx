import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function AssetsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Asset Registry</h1>
        <p className="text-slate-400">Track all assets and their lifecycle status</p>
      </div>
 
      {/* Search & filter placeholder */}
      <Card>
        <div className="flex gap-2 flex-wrap mb-4">
          <input
            type="text"
            placeholder="Search by tag, serial, name..."
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
          />
          <Button>Register Asset</Button>
        </div>
      </Card>
 
      {/* Table placeholder */}
      <Card>
        <CardContent>
          <p className="text-slate-300">Asset table coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}