'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, Save, ShieldCheck, Cpu, Globe } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Global Settings</h1>
        <p className="text-muted-foreground">Control system-wide configurations and maintenance mode.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#162129] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#16a34a]" /> System Security
            </CardTitle>
            <CardDescription>Manage security thresholds and access control.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#0b141a] rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-white">Maintenance Mode</Label>
                <p className="text-[10px] text-muted-foreground">Block all non-admin access to dashboard.</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0b141a] rounded-xl">
              <div className="space-y-0.5">
                <Label className="text-white">New Registrations</Label>
                <p className="text-[10px] text-muted-foreground">Allow new users to sign up.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#162129] border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> API Configuration
            </CardTitle>
            <CardDescription>Global API rate limits and endpoints.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label className="text-xs uppercase text-muted-foreground font-bold">Default Rate Limit</Label>
               <Input placeholder="100 requests / min" className="bg-[#0b141a] border-border/10" defaultValue="100" />
             </div>
             <div className="space-y-2">
               <Label className="text-xs uppercase text-muted-foreground font-bold">API Domain</Label>
               <Input placeholder="api.antipay.io" className="bg-[#0b141a] border-border/10" defaultValue="api.antipay.io" />
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button className="bg-[#16a34a] hover:bg-[#15803d] px-8 font-bold">
          <Save className="mr-2 h-4 w-4" /> Save Global Config
        </Button>
      </div>
    </div>
  )
}
