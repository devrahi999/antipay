"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BookOpen, Code2, Terminal } from "lucide-react"

export default function DeveloperDocsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Developer Docs</h1>
          <p className="text-muted-foreground">Everything you need to integrate AntiPay into your system.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" /> API Reference
            </CardTitle>
            <CardDescription>Comprehensive guide to our RESTful endpoints.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Learn how to authenticate requests, create sessions, and verify transactions programmatically.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" /> SDKs & Libraries
            </CardTitle>
            <CardDescription>Official packages for Node.js, PHP, and Python.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Speed up your integration process with our pre-built software development kits.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <BookOpen className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground italic">Full documentation portal coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
