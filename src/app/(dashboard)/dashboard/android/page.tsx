"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Smartphone, Download, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AndroidAppPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Android App</h1>
          <p className="text-muted-foreground">Download and configure the AntiPay Sync app for your device.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>AntiPay Sync v2.1</CardTitle>
            <CardDescription>The gateway between your SMS and our verification engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sm">How it works:</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold">1</div>
                  Install the APK on the Android device that receives mobile banking SMS.
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold">2</div>
                  Scan your merchant QR code (available in Settings) to link the device.
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold">3</div>
                  AntiPay Sync will securely forward transaction SMS for instant verification.
                </li>
              </ul>
            </div>
            <Button className="w-full md:w-auto bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" /> Download Latest APK
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary text-lg">App Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="relative">
              <Smartphone className="h-16 w-16 text-primary/40" />
              <ShieldCheck className="absolute -bottom-1 -right-1 h-8 w-8 text-primary bg-background rounded-full p-1" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">No Active Device</p>
            <p className="text-[10px] text-muted-foreground text-center">
              Link a device to start automating your payment verification.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
