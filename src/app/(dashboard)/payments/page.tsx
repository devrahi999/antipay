import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Save } from "lucide-react"

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">Payment Methods</h1>
        <p className="text-muted-foreground">Configure your receiver accounts and active gateways.</p>
      </div>

      <Alert className="bg-accent/20 border-accent/50 text-accent-foreground">
        <Info className="h-4 w-4" />
        <AlertTitle>Developer Tip</AlertTitle>
        <AlertDescription>
          Make sure your mobile banking numbers are personal or merchant accounts that can receive funds directly.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "bKash", color: "bg-[#e2136e]", icon: "BK" },
          { name: "Nagad", color: "bg-[#f7941d]", icon: "NG" },
          { name: "Rocket", color: "bg-[#8c3494]", icon: "RK" },
          { name: "Upay", color: "bg-[#000000]", icon: "UP" },
        ].map((method) => (
          <Card key={method.name} className="shadow-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className={`${method.color} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {method.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                </div>
              </div>
              <Switch defaultChecked={method.name === "bKash" || method.name === "Nagad"} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${method.name}-number`}>Receiver Number</Label>
                <Input id={`${method.name}-number`} placeholder="01XXXXXXXXX" defaultValue={method.name === "bKash" ? "01712345678" : ""} />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1 bg-secondary text-primary border border-primary/20">Personal</Button>
                  <Button variant="ghost" size="sm" className="flex-1 hover:bg-secondary">Merchant</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
          <Save className="mr-2 h-4 w-4" /> Save Configuration
        </Button>
      </div>
    </div>
  )
}