import { Card, CardContent } from "@/components/ui/card";

export default function OrganizationSetupPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Organization Setup
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Admin only: Manage departments, categories, and employees
        </p>
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex gap-4 overflow-x-auto border-b border-border -m-6 mb-4 px-6">
          <button className="shrink-0 px-4 py-3 text-sm font-medium text-foreground border-b-2 border-primary">
            Departments
          </button>
          <button className="shrink-0 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            Asset Categories
          </button>
          <button className="shrink-0 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            Employees
          </button>
        </div>
        <CardContent>
          <p className="text-muted-foreground">Tab content coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}