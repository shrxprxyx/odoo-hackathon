import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AssetsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Asset Registry
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track all assets and their lifecycle status
        </p>
      </div>

      {/* Search & filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="Search by tag, serial, name..."
              className="flex-1 h-10 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring/50"
            />
            <Button className="sm:w-auto w-full">Register Asset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table placeholder */}
      <Card>
        <CardContent>
          <p className="text-muted-foreground">Asset table coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}