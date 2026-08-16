"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Smartphone, Download, ShieldCheck, Zap, Loader2, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { doc } from "firebase/firestore"
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase"

export default function AndroidAppPage() {
  const db = useFirestore();

  // The APK link is set by an admin in Global Settings.
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'global');
  }, [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const apkUrl = (settings?.androidApkUrl || '').trim();
  const appVersion = (settings?.androidAppVersion || '').trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Android Node</h1>
          <p className="text-muted-foreground">Download and configure the AntiPay Sync app for your processing device.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card/50 border-border/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Smartphone size={200} />
          </div>
          <CardHeader>
            <CardTitle>AntiPay Sync{appVersion ? ` v${appVersion}` : ''}</CardTitle>
            <CardDescription>The gateway between your local device and our verification engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="space-y-4">
              <h3 className="font-bold text-sm">How it works:</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold">1</div>
                  Install the APK on the Android device intended for transaction monitoring.
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold">2</div>
                  Scan your merchant QR code (available in Settings) to authenticate the node.
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold">3</div>
                  AntiPay Sync will securely relay transaction data for instant automated verification.
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {isLoading ? (
                <Button disabled className="w-full md:w-auto bg-primary/50 font-bold h-11 px-8">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking for build...
                </Button>
              ) : apkUrl ? (
                <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 font-bold h-11 px-8">
                  <a href={apkUrl} target="_blank" rel="noreferrer" download>
                    <Download className="mr-2 h-4 w-4" /> Download Latest APK
                  </a>
                </Button>
              ) : (
                <Button disabled className="w-full md:w-auto font-bold h-11 px-8">
                  <Ban className="mr-2 h-4 w-4" /> Download Unavailable
                </Button>
              )}
              <Button variant="outline" className="w-full md:w-auto h-11 px-8">
                View Configuration Guide
              </Button>
            </div>

            {!isLoading && !apkUrl && (
              <p className="text-xs text-muted-foreground italic">
                The build is not published yet. Please check back shortly or contact support.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: "Battery Optimization", desc: "Disable battery restrictions for AntiPay Sync to ensure 24/7 uptime.", icon: Zap },
             { title: "Internet Stability", desc: "Ensure your device has a stable 4G or Wi-Fi connection at all times.", icon: ShieldCheck },
             { title: "Auto-Start", desc: "Enable 'Auto-start' permission in your Android settings for maximum reliability.", icon: Smartphone }
           ].map((item, i) => (
             <Card key={i} className="bg-secondary/20 border-none p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <item.icon size={20} />
                </div>
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
             </Card>
           ))}
        </div>
      </div>
    </div>
  )
}
