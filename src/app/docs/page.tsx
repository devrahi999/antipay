'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  BookOpen, 
  Terminal, 
  Globe, 
  Link as LinkIcon, 
  Key, 
  AlertCircle,
  ChevronRight,
  Copy
} from "lucide-react"
import { Footer } from "@/components/landing/footer"

export default function DocsPage() {
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "base-url", title: "Base URL" },
    { id: "create-session", title: "1. Create Session" },
    { id: "verify-payment", title: "2. Verify Payment" },
    { id: "authentication", title: "Authentication" },
    { id: "error-handling", title: "Error Handling" },
    { id: "webhooks", title: "Webhooks" },
    { id: "workflow", title: "Example Workflow" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.imgur.com/18owxBD.png" alt="AntiPay" className="h-9 w-auto" />
            <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 font-bold">
              <Link href="/login">Merchant Console</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Documentation</h4>
                <nav className="flex flex-col gap-2">
                  {sections.map((section) => (
                    <a key={section.id} href={`#${section.id}`} className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center group transition-colors">
                      <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          <main className="flex-1 max-w-4xl">
            <div className="space-y-16 pb-20">
              <section id="introduction" className="scroll-mt-28 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  <BookOpen className="h-3 w-3" /> Get Started
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">AntiPay Developer Documentation</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Welcome to <span className="text-primary font-bold">AntiPay</span> Developer Docs! Integrate our Verify APIs into your system.
                </p>
              </section>

              {/* Sections remain same... */}
              <section id="base-url" className="scroll-mt-28 space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground"><Globe className="h-5 w-5 text-primary" /> Base URL</h2>
                <div className="bg-[#0b141a] p-4 rounded-xl border border-border/10">
                  <code className="text-primary font-mono text-sm break-all">https://pay.antipay.site/v1/</code>
                </div>
              </section>

              <section id="create-session" className="scroll-mt-28 space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground"><Terminal className="h-5 w-5 text-primary" /> 1. Create Session</h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 font-bold uppercase text-[10px]">POST</Badge>
                  <code className="text-xs font-mono text-muted-foreground">/v1/create</code>
                </div>
                {/* Multi-language examples... */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Request Examples</h3>
                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-[#162129] border border-border/10 p-1 mb-0 rounded-t-xl rounded-b-none h-auto flex flex-wrap justify-start gap-1">
                      <TabsTrigger value="curl" className="px-4 py-2 text-xs font-bold">cURL</TabsTrigger>
                      <TabsTrigger value="js" className="px-4 py-2 text-xs font-bold">JavaScript</TabsTrigger>
                      <TabsTrigger value="php" className="px-4 py-2 text-xs font-bold">PHP</TabsTrigger>
                    </TabsList>
                    <div className="bg-[#0b141a] rounded-b-xl border border-t-0 border-border/10 p-6">
                      <TabsContent value="curl" className="m-0"><pre className="text-xs font-mono text-emerald-400"><code>{`curl -X POST "https://pay.antipay.site/v1/create" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"amount": 145}'`}</code></pre></TabsContent>
                    </div>
                  </Tabs>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}