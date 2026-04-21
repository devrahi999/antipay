"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Generate and track payment invoices for your customers.</p>
        </div>
      </div>
      <Card className="bg-card/50 border-border/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FileText size={32} />
          </div>
          <h2 className="text-xl font-bold">Payment Invoices</h2>
          <p className="text-muted-foreground max-w-md text-center">
            Create professional billing invoices that customers can pay instantly via mobile banking.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
