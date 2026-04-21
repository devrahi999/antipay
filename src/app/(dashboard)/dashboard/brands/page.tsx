"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tags } from "lucide-react"

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Brands</h1>
          <p className="text-muted-foreground">Manage your different business brands and stores.</p>
        </div>
      </div>
      <Card className="bg-card/50 border-border/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Tags size={32} />
          </div>
          <h2 className="text-xl font-bold">Manage Your Brands</h2>
          <p className="text-muted-foreground max-w-md text-center">
            Organize your payment workflows under specific brand identities. Start by creating your first brand configuration.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
