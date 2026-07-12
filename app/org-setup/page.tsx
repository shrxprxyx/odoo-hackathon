import { Card, CardContent } from "@/components/ui/card";
export function OrganizationSetupPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Organization Setup</h1>
        <p className="text-slate-400">Admin only: Manage departments, categories, and employees</p>
      </div>
 
      {/* Tabs placeholder */}
      <Card>
        <div className="flex gap-4 border-b border-slate-700 -m-6 mb-4 px-6">
          <button className="px-4 py-3 text-white border-b-2 border-blue-600">
            Departments
          </button>
          <button className="px-4 py-3 text-slate-400 hover:text-white">
            Asset Categories
          </button>
          <button className="px-4 py-3 text-slate-400 hover:text-white">
            Employees
          </button>
        </div>
        <CardContent>
          <p className="text-slate-300">Tab content coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}