
'use client';

import { use, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Database, 
  Calendar,
  ShieldCheck,
  Hash,
  Store,
  Wallet,
  Loader2
} from "lucide-react";
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { generateInvoiceAction } from '@/app/actions/invoice';

export default function InvoiceDetailsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch Session Data
  const sessionRef = useMemoFirebase(() => {
    if (!db || !user || !sessionId) return null;
    return doc(db, 'payment_sessions', user.uid, 'sessions', sessionId);
  }, [db, user?.uid, sessionId]);

  const { data: invoice, isLoading } = useDoc(sessionRef);

  // Fetch Store Data using apiKey from the session document as the Document ID
  const storeRef = useMemoFirebase(() => {
    if (!db || !invoice?.apiKey) return null;
    return doc(db, 'stores', invoice.apiKey);
  }, [db, invoice?.apiKey]);

  const { data: store } = useDoc(storeRef);

  const copyTrxId = () => {
    if (invoice?.trxId) {
      navigator.clipboard.writeText(invoice.trxId);
      toast({ title: "Copied", description: "Transaction ID copied to clipboard." });
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) {
        toast({ variant: "destructive", title: "Wait", description: "Loading document data..." });
        return;
    }
    
    setIsDownloading(true);
    try {
      // PREVENT SERIALIZATION ERROR:
      // Firestore Timestamps crash Server Actions. We build a clean JSON object.
      const plainData = {
        amount: Number(invoice.amount) || 0,
        trxId: String(invoice.trxId || "—"),
        method: String(invoice.method || "—"),
        val_id: String(invoice.val_id || "—"),
        sender: String(invoice.sender || "—"),
        userId: String(invoice.userId || ""),
        status: String(invoice.status || "pending"),
        id: sessionId,
        createdAtFormatted: invoice.createdAt?.toDate ? format(invoice.createdAt.toDate(), 'PPP p') : '—',
        verifiedAtFormatted: invoice.verifiedAt?.toDate ? format(invoice.verifiedAt.toDate(), 'PPP p') : '—',
      };

      const plainStore = {
        name: String(store?.name || invoice.storeName || "AntiPay Merchant"),
        logoUrl: String(store?.logoUrl || ""),
      };

      // Call server action with purely plain objects
      const pdfBase64 = await generateInvoiceAction(plainData, plainStore);
      
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = `Invoice-${sessionId.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: "Success", description: "PDF generated successfully." });
    } catch (error: any) {
      console.error('DOWNLOAD FAILED:', error);
      toast({ variant: "destructive", title: "Error", description: "Could not generate PDF. Please try again." });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Decrypting Receipt...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <Card className="max-w-md mx-auto p-12 border-dashed">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold">Invoice Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The requested payment record could not be located.</p>
          <Button asChild variant="outline" className="rounded-xl font-bold">
            <Link href="/dashboard/invoices">Back to Invoices</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/10">
          <Link href="/dashboard/invoices"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black font-headline tracking-tight uppercase">Invoice Details</h1>
          <p className="text-xs text-muted-foreground font-bold tracking-widest">{sessionId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Receipt */}
        <Card className="md:col-span-2 border-none shadow-2xl overflow-hidden rounded-[2.5rem] bg-card relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#16a34a]" />
          
          <CardHeader className="p-8 bg-secondary/5 border-b border-border/10">
            <div className="flex justify-between items-start">
               <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                    {store?.logoUrl ? (
                        <img src={store.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <Store size={24} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground">{store?.name || invoice.storeName || "Merchant Payment"}</h3>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-primary" /> AntiPay Verified Transaction
                    </p>
                  </div>
               </div>
               <Badge className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${
                  invoice.status === 'verified' ? 'bg-[#16a34a]/20 text-[#16a34a]' : 
                  invoice.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 
                  'bg-rose-500/20 text-rose-500'
               }`}>
                  {invoice.status}
               </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-10 space-y-12">
            {/* Big Amount */}
            <div className="text-center py-6 border-y border-dashed border-border/40">
               <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground mb-2">Total Settled Amount</p>
               <h2 className="text-6xl font-black text-foreground tabular-nums tracking-tighter">৳{invoice.amount}</h2>
               <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-widest border border-border/10">
                  <Wallet className="h-3 w-3 text-primary" /> {invoice.method} Personal
               </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-10 gap-x-6">
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <Smartphone className="h-3 w-3 text-primary" /> Sender Number
                </p>
                <p className="text-sm font-mono font-bold text-slate-200">{invoice.sender || "Not Provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <Hash className="h-3 w-3 text-[#16a34a]" /> Transaction ID
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-primary">{invoice.trxId || "—"}</p>
                  {invoice.trxId && (
                    <button onClick={copyTrxId} className="text-muted-foreground hover:text-white transition-colors">
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-amber-500" /> Created On
                </p>
                <p className="text-sm font-bold text-slate-200">
                  {invoice.createdAt?.toDate ? format(invoice.createdAt.toDate(), 'PPP p') : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-blue-500" /> Internal Ref
                </p>
                <p className="text-sm font-bold text-slate-200">{invoice.val_id || "—"}</p>
              </div>
            </div>

            {/* Verification Success UI */}
            {invoice.status === 'verified' && (
              <div className="p-5 bg-[#16a34a]/5 border border-[#16a34a]/10 rounded-2xl flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-[#16a34a]/20 flex items-center justify-center text-[#16a34a]">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-100">Instantly Verified</p>
                    <p className="text-[10px] text-muted-foreground">The funds reached your account and were validated by AntiPay Node.</p>
                 </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-8 border-t border-border/10 bg-secondary/5 flex justify-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
              This is a digital receipt generated by AntiPay Infrastructure.
            </p>
          </CardFooter>
        </Card>

        {/* Sidebar Actions */}
        <div className="space-y-6">
           <Card className="border-border/40 p-6 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</h4>
              <div className="grid grid-cols-1 gap-2">
                 <Button 
                    className="ios-btn bg-[#16a34a] hover:bg-[#15803d] font-bold w-full justify-start h-11 px-4"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                 >
                   {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} 
                   Download PDF
                 </Button>
                 <Button variant="outline" className="font-bold w-full justify-start h-11 px-4 border-border/40 hover:bg-secondary/10" onClick={copyTrxId}>
                   <Copy className="mr-2 h-4 w-4" /> Copy Reference
                 </Button>
              </div>
           </Card>

           <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 relative overflow-hidden group">
              <ShieldCheck className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/10 group-hover:scale-110 transition-transform" />
              <h4 className="text-xs font-bold text-primary mb-2">Audit Log Ready</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This transaction hash is immutable. Every verification step is logged for security compliance.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
