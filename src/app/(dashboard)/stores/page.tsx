import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Plus, MoreVertical, ExternalLink, Key, RefreshCcw, Trash2 } from "lucide-react"

export default function StoresPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Stores & API Keys</h1>
          <p className="text-muted-foreground">Manage your store identities and security credentials.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create New Store
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[
          {
            name: "MyGadget BD",
            url: "https://mygadget.com.bd",
            apiKey: "ap_live_7x8k2v9m1p5q0w3n",
            status: "Active",
            email: "support@mygadget.com.bd",
            lastUsed: "2 mins ago"
          },
          {
            name: "FashionHub",
            url: "https://fashionhub.io",
            apiKey: "ap_live_m3n9p1q5w0x2k8v7",
            status: "Active",
            email: "care@fashionhub.io",
            lastUsed: "14 hours ago"
          }
        ].map((store) => (
          <Card key={store.apiKey} className="shadow-sm border-none overflow-hidden">
            <div className="h-1 bg-primary w-full" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold text-xl">
                  {store.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-xl">{store.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    {store.url} <ExternalLink className="h-3 w-3" />
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">{store.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <p className="text-sm font-medium">{store.email}</p>
                </div>
                <div className="space-y-2">
                  <Label>Last Activity</Label>
                  <p className="text-sm font-medium">{store.lastUsed}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="h-3 w-3 text-primary" /> API Secret Key
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-secondary p-2.5 rounded-lg text-sm font-mono flex justify-between items-center">
                    <span>{store.apiKey}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">Keep this key secret. Do not share it in public or client-side code.</p>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/30 border-t flex justify-between px-6 py-4">
              <div className="flex gap-4">
                <Button variant="outline" size="sm" className="bg-background">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Roll Key
                </Button>
                <Button variant="outline" size="sm" className="bg-background">
                  <Settings className="mr-2 h-4 w-4" /> Edit Config
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Store
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}