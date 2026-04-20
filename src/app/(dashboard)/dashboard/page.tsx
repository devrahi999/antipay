import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Store as StoreIcon, 
  Activity,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">Monitor your store activity and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳145,280.00</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-primary flex items-center"><ArrowUpRight className="h-3 w-3" /> +12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
            <StoreIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              2 stores currently processing
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-primary flex items-center"><ArrowUpRight className="h-3 w-3" /> +0.4%</span> from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-card hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plan</CardTitle>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">PRO</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Professional</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next billing date: Oct 12, 2024
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Current operational status of your merchant account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-secondary">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary" />
                <div>
                  <p className="font-semibold">KYC Verified</p>
                  <p className="text-xs text-muted-foreground">Full access to all features enabled.</p>
                </div>
              </div>
              <Badge variant="outline" className="border-primary text-primary">Verified</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-secondary">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary" />
                <div>
                  <p className="font-semibold">Payout Account</p>
                  <p className="text-xs text-muted-foreground">Linked to Bank Asia XXXX-1234</p>
                </div>
              </div>
              <Badge variant="outline" className="border-primary text-primary">Connected</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
            <CardDescription>Transactions per store identity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "MyGadget BD", volume: "৳82,000", share: "56%" },
                { name: "FashionHub", volume: "৳45,280", share: "31%" },
                { name: "Daily Needs", volume: "৳18,000", share: "13%" },
              ].map((store) => (
                <div key={store.name} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{store.name}</span>
                    <span className="text-muted-foreground font-mono">{store.volume} ({store.share})</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: store.share }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}