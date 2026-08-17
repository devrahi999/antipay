'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Timer,
  Hash,
  Fingerprint,
  Smartphone,
  CircleDollarSign,
  Webhook,
  Store,
  Globe,
  Ban,
  ExternalLink,
  Braces,
  Wallet,
  Database,
  Hourglass,
  AlertTriangle,
  ShieldQuestion,
  Activity
} from "lucide-react"
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  verified: 'border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10',
  expired: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  cancelled: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
};

/** Firestore Timestamps and nested objects → plain JSON-safe values. */
const toPlain = (value: any): any => {
  if (value === null || value === undefined) return null;
  if (typeof value?.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch (e) {
      return String(value);
    }
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    Object.keys(value).sort().forEach((k) => { out[k] = toPlain(value[k]); });
    return out;
  }
  return value;
};

const JSON_TABS = [
  { key: 'webhook', label: 'Webhook Payload' },
  { key: 'api', label: 'API Response' },
  { key: 'raw', label: 'Raw Session' },
];

export default function PaymentSessionDetailsPage() {
  const { id } = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('webhook');
  const [copied, setCopied] = useState(false);

  const sessionId = Array.isArray(id) ? id[0] : id;

  // Sessions live under the signed-in merchant only, so this path can never
  // reach another account's data.
  const sessionRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !sessionId) return null;
    return doc(db, 'payment_sessions', user.uid, 'sessions', sessionId);
  }, [db, user?.uid, sessionId]);
  const { data: session, isLoading } = useDoc(sessionRef);

  // The brand this payment was created against (`stores` doc ID is the API key).
  const storeRef = useMemoFirebase(() => {
    if (!db || !session?.apiKey) return null;
    return doc(db, 'stores', session.apiKey);
  }, [db, session?.apiKey]);
  const { data: store } = useDoc(storeRef);

  // A manual review request, if the customer ever raised one. The review route
  // writes `pending_transactions/{sessionId}`, so this is a direct read — no
  // query and no composite index needed.
  const reviewRef = useMemoFirebase(() => {
    if (!db || !sessionId) return null;
    return doc(db, 'pending_transactions', sessionId);
  }, [db, sessionId]);
  const { data: review } = useDoc(reviewRef);

  // The raw record in the verification pool that settled this payment.
  const poolRef = useMemoFirebase(() => {
    if (!db || !session?.trxId) return null;
    return doc(db, 'transactions', String(session.trxId).trim().toUpperCase());
  }, [db, session?.trxId]);
  const { data: poolRecord } = useDoc(poolRef);

  const formatDate = (value: any, pattern = 'dd MMM yyyy, hh:mm:ss a') => {
    if (!value) return "—";
    try {
      const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
      return isNaN(date.getTime()) ? "—" : format(date, pattern);
    } catch (e) {
      return "—";
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to your clipboard.` });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading payment...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <Card className="bg-[#0b141a] border-2 border-dashed border-border/30 p-12 text-center flex flex-col items-center gap-5 rounded-3xl">
          <div className="h-16 w-16 rounded-full bg-[#162129] flex items-center justify-center">
            <Ban className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">Payment Not Found</h3>
            <p className="text-sm text-muted-foreground">
              No payment session with this ID exists on your account.
            </p>
          </div>
          <Button asChild variant="outline" className="border-border/20 font-bold">
            <Link href="/dashboard/transactions"><ArrowLeft className="h-4 w-4 mr-2" /> Back to History</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isVerified = session.status === 'verified';
  const amount = Number(session.amount || 0);

  const expiresDate = (() => {
    if (!session.expiresAt) return null;
    try {
      const d = typeof session.expiresAt.toDate === 'function' ? session.expiresAt.toDate() : new Date(session.expiresAt);
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      return null;
    }
  })();
  const isExpired = !isVerified && !!expiresDate && expiresDate.getTime() < Date.now();

  // ------------------------------------------------------------------
  // The JSON views
  // ------------------------------------------------------------------

  // Exactly the body AntiPay POSTs to the merchant's webhook on verification
  // (see antipay-verify /api/v1/verify and /api/pending-review/complete).
  const webhookPayload = {
    status: isVerified ? 'verified' : (session.status ?? 'pending'),
    trxId: session.trxId ?? null,
    amount,
    sessionId: session.sessionId ?? session.id,
    val_id: session.val_id ?? null
  };

  // Exactly what /api/v1/verify returns to the caller.
  const apiResponse = isVerified
    ? { status: 'verified', trxId: session.trxId ?? null, amount }
    : {
        status: false,
        message: isExpired ? 'Session expired' : 'This session has not been verified yet'
      };

  const rawSession = toPlain(session);

  const jsonForTab: Record<string, any> = {
    webhook: webhookPayload,
    api: apiResponse,
    raw: rawSession
  };

  const jsonText = JSON.stringify(jsonForTab[activeTab] ?? {}, null, 2);

  const copyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast({
      title: "JSON Copied!",
      description: `${JSON_TABS.find((t) => t.key === activeTab)?.label} copied to your clipboard.`
    });
  };

  const Row = ({ icon: Icon, label, value, mono, accent }: any) => (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2 shrink-0 pt-0.5">
        {Icon && <Icon className="h-3 w-3 text-primary/70" />} {label}
      </span>
      <span className={`text-xs text-right break-all ${mono ? 'font-mono' : ''} ${accent ? 'font-black text-white' : 'font-bold text-slate-300'}`}>
        {value ?? "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Button asChild variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
            <Link href="/dashboard/transactions"><ArrowLeft className="h-3 w-3 mr-1.5" /> Back to History</Link>
          </Button>
          <h1 className="text-2xl font-headline font-bold text-foreground">Payment Details</h1>
          <button
            onClick={() => copy(String(session.sessionId ?? session.id), 'Session ID')}
            className="text-xs text-muted-foreground font-mono hover:text-primary flex items-center gap-1.5 break-all text-left"
          >
            {session.sessionId ?? session.id} <Copy className="h-3 w-3 shrink-0" />
          </button>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] uppercase font-black px-3 py-1.5 ${STATUS_STYLES[isExpired ? 'expired' : session.status] || 'border-border/30 text-muted-foreground'}`}
        >
          {isVerified && <CheckCircle2 className="h-3 w-3 mr-1.5" />}
          {!isVerified && !isExpired && <Hourglass className="h-3 w-3 mr-1.5" />}
          {isExpired && <XCircle className="h-3 w-3 mr-1.5" />}
          {isExpired ? 'expired' : session.status}
        </Badge>
      </div>

      {review && review.status !== 'rejected' && (
        <Card className="bg-amber-500/5 border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldQuestion className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-400">Manual Review Raised</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The customer could not verify automatically and submitted this payment for your approval
                {review.status ? <> — currently <span className="font-mono font-bold text-slate-200">{review.status}</span></> : null}.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold shrink-0">
            <Link href={`/dashboard/pending-payments/${sessionId}`}>Open Review</Link>
          </Button>
        </Card>
      )}

      {isExpired && (
        <Card className="bg-rose-500/5 border-rose-500/30 p-4 rounded-2xl flex items-start gap-3">
          <Timer className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This session expired on <span className="font-bold text-slate-200">{formatDate(session.expiresAt)}</span> without
            being paid. The payment link no longer works — the customer has to start a new checkout.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <Card className="bg-[#0b141a] border-border/40 shadow-2xl overflow-hidden rounded-2xl">
            <div className={`h-1.5 ${isVerified ? 'bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#16a34a]' : isExpired ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500' : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500'}`} />
            <CardHeader className="bg-[#162129] p-6 border-b border-border/10">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Transaction ID
                  </CardDescription>
                  <CardTitle className="text-3xl font-black text-white font-mono break-all">
                    {session.trxId || "Not paid yet"}
                  </CardTitle>
                  {session.method && (
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[9px] font-black uppercase mt-2">
                      {session.method}
                    </Badge>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</p>
                  <p className="text-3xl font-black text-[#16a34a]">৳{amount.toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-border/10">
              <Row icon={Hash} label="Transaction ID" value={session.trxId} mono accent />
              <Row icon={Database} label="Internal Ref (val_id)" value={session.val_id} mono accent />
              <Row icon={Smartphone} label="Sender Number" value={session.sender} mono />
              <Row icon={CircleDollarSign} label="Method / Provider" value={(session.method || "—").toString().toUpperCase()} />
              <Row icon={Wallet} label="Receiver Number" value={session.receiverNumber} mono />
              <Row
                icon={Activity}
                label="Verified Via"
                value={session.verifiedVia === 'manual_review' ? 'MANUAL REVIEW' : isVerified ? 'AUTOMATIC GATEWAY' : "—"}
              />
            </CardContent>
          </Card>

          {/* Session */}
          <Card className="bg-[#0b141a] border-border/40 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-border/10">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-200">Session Record</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-1">
                Everything your backend sent to the gateway when this payment was created.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-border/10">
              <Row icon={Fingerprint} label="Session ID" value={session.sessionId ?? session.id} mono />
              <Row icon={Fingerprint} label="API Key" value={session.apiKey} mono />
              <Row icon={CircleDollarSign} label="Session Amount" value={`৳${amount.toFixed(2)}`} accent />
              <Row icon={CheckCircle2} label="Status" value={(session.status || "—").toString().toUpperCase()} />
              <Row icon={Ban} label="Link Consumed" value={session.isUsed === true ? 'YES' : session.isUsed === false ? 'NO' : "—"} />
              <div className="flex items-start justify-between gap-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2 shrink-0 pt-0.5">
                  <Webhook className="h-3 w-3 text-primary/70" /> Webhook URL
                </span>
                {session.webhook_url ? (
                  <button
                    onClick={() => copy(session.webhook_url, 'Webhook URL')}
                    className="text-xs font-mono font-bold text-primary text-right break-all hover:underline flex items-start gap-1.5"
                  >
                    {session.webhook_url} <Copy className="h-3 w-3 shrink-0 mt-0.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground/50">Not set</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ---------------- Details Response JSON ---------------- */}
          <Card className="bg-[#0b141a] border-border/40 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-border/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
                    <Braces className="h-4 w-4 text-primary" /> Details Response JSON
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground mt-1">
                    The exact JSON bodies for this payment — built from the stored session, not a captured HTTP log.
                  </CardDescription>
                </div>
                <Button
                  onClick={copyJson}
                  size="sm"
                  className={`shrink-0 font-bold h-9 ${copied ? 'bg-[#16a34a] hover:bg-[#16a34a]' : 'bg-[#162129] hover:bg-[#1d2b35] border border-border/20'}`}
                >
                  {copied ? <><Check className="h-3.5 w-3.5 mr-1.5" /> Copied</> : <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy JSON</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {JSON_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-[#162129] text-muted-foreground border border-border/10 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                {activeTab === 'webhook' && "The body AntiPay POSTs to your webhook URL when this payment verifies. Content-Type: application/json."}
                {activeTab === 'api' && "The body /api/v1/verify returns to whoever calls it for this session."}
                {activeTab === 'raw' && "The complete stored session document, with every Firestore timestamp converted to ISO 8601."}
              </p>

              <div className="relative">
                <pre className="bg-[#05090c] border border-border/20 rounded-xl p-4 overflow-x-auto text-[11px] leading-relaxed font-mono text-slate-300 max-h-[420px]">
                  <code>{jsonText}</code>
                </pre>
                <button
                  onClick={copyJson}
                  title="Copy JSON"
                  className="absolute top-2.5 right-2.5 h-8 w-8 rounded-lg bg-[#162129]/90 border border-border/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#16a34a]" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Pool record */}
          {session.trxId && (
            <Card className="bg-[#0b141a] border-border/40 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="p-5 border-b border-border/10">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-200">Verification Pool Record</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground mt-1">
                  The raw money record in your pool that this payment was matched against.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {poolRecord ? (
                  <div className="divide-y divide-border/10">
                    <Row icon={Hash} label="TrxID" value={poolRecord.trxId ?? poolRecord.id} mono accent />
                    <Row icon={CircleDollarSign} label="Amount" value={poolRecord.amount != null ? `৳${Number(poolRecord.amount).toFixed(2)}` : "—"} accent />
                    <Row icon={Smartphone} label="Sender" value={poolRecord.sender} mono />
                    <Row icon={Wallet} label="Source" value={(poolRecord.source || "—").toString().toUpperCase()} />
                    <Row icon={CheckCircle2} label="Status" value={(poolRecord.status || "—").toString().toUpperCase()} />
                    <Row icon={Clock} label="Recorded At" value={formatDate(poolRecord.createdAt)} />
                    <Row
                      icon={Activity}
                      label="Origin"
                      value={poolRecord.createdVia === 'manual_review' ? 'CREATED BY MANUAL APPROVAL' : 'SYNCED / MANUAL ENTRY'}
                    />
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    No record with this TrxID exists in your pool. It may have been entered only on the checkout page, or the
                    matching record was never synced.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card className="bg-[#0b141a] border-border/40 p-6 shadow-2xl rounded-2xl space-y-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-200">Timeline</p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <Clock className="h-3 w-3 text-primary" />
                  </div>
                  <div className="w-px flex-1 bg-border/20 my-1" />
                </div>
                <div className="pb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Created</p>
                  <p className="text-[11px] font-bold text-slate-200 mt-0.5">{formatDate(session.createdAt)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${isExpired ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#162129] border-border/20'}`}>
                    <Timer className={`h-3 w-3 ${isExpired ? 'text-rose-400' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="w-px flex-1 bg-border/20 my-1" />
                </div>
                <div className="pb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Expires</p>
                  <p className="text-[11px] font-bold text-slate-200 mt-0.5">{formatDate(session.expiresAt)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${isVerified ? 'bg-[#16a34a]/10 border-[#16a34a]/30' : 'bg-[#162129] border-border/20'}`}>
                    <CheckCircle2 className={`h-3 w-3 ${isVerified ? 'text-[#16a34a]' : 'text-muted-foreground/40'}`} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Verified</p>
                  <p className={`text-[11px] font-bold mt-0.5 ${isVerified ? 'text-[#16a34a]' : 'text-muted-foreground/50'}`}>
                    {isVerified ? formatDate(session.verifiedAt) : 'Not verified'}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/10" />

            <div className="space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Webhook</p>
              {!session.webhook_url ? (
                <p className="text-[11px] font-bold text-muted-foreground/60 flex items-center gap-2">
                  <Ban className="h-3 w-3" /> No webhook configured
                </p>
              ) : review?.webhookDelivered === true ? (
                <p className="text-[11px] font-bold text-[#16a34a] flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" /> Delivered
                </p>
              ) : review?.webhookDelivered === false ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 shrink-0" /> Delivery failed
                  </p>
                  {review?.webhookError && (
                    <p className="text-[10px] text-rose-300/80 leading-relaxed break-all">{review.webhookError}</p>
                  )}
                </div>
              ) : isVerified ? (
                <p className="text-[11px] font-bold text-[#16a34a] flex items-center gap-2">
                  <Webhook className="h-3 w-3" /> Sent on verification
                </p>
              ) : (
                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                  <Webhook className="h-3 w-3" /> Not called yet
                </p>
              )}
            </div>
          </Card>

          {store && (
            <Card className="bg-gradient-to-br from-[#162129] to-[#0b141a] border-border/20 p-5 rounded-2xl space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Brand</p>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Store size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-100 truncate">{store.name || "Unnamed brand"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {store.status || "unknown"}
                  </p>
                </div>
              </div>
              {store.websiteUrl && (
                <a
                  href={String(store.websiteUrl).startsWith('http') ? store.websiteUrl : `https://${store.websiteUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 break-all"
                >
                  <Globe className="h-3 w-3 shrink-0" /> {store.websiteUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
