'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Loader2,
  Copy,
  CheckCircle2,
  XCircle,
  Hourglass,
  Webhook,
  Store,
  Globe,
  Fingerprint,
  Hash,
  Smartphone,
  CircleDollarSign,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Ban,
  ExternalLink,
  Timer
} from "lucide-react"
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  processing: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
  completed: 'border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10',
  // The money side is settled but the merchant's server never acknowledged us.
  // It is deliberately NOT green — calling that "completed" hides a real problem.
  webhook_failed: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  rejected: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
};

const STATUS_LABELS: Record<string, string> = {
  webhook_failed: 'Merchant Not Notified',
};

export default function PendingPaymentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isCompleting, setIsCompleting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const reviewId = Array.isArray(id) ? id[0] : id;

  const reviewRef = useMemoFirebase(() => {
    if (!db || !reviewId) return null;
    return doc(db, 'pending_transactions', reviewId);
  }, [db, reviewId]);
  const { data: review, isLoading } = useDoc(reviewRef);

  // If the claimed TrxID already exists in the pool it may be a double-claim.
  const trxRef = useMemoFirebase(() => {
    if (!db || !review?.trxId) return null;
    return doc(db, 'transactions', String(review.trxId).trim().toUpperCase());
  }, [db, review?.trxId]);
  const { data: existingTrx } = useDoc(trxRef);

  const formatDate = (value: any) => {
    if (!value) return "—";
    try {
      const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
      return isNaN(date.getTime()) ? "—" : format(date, 'dd MMM yyyy, hh:mm a');
    } catch (e) {
      return "—";
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to your clipboard.` });
  };

  const handleComplete = async () => {
    if (!reviewId) return;
    setIsCompleting(true);
    try {
      // Server-side: the webhook lives on another origin and the URL is read
      // back from the stored document, not sent from here.
      const res = await fetch('/api/pending-review/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId: reviewId })
      });
      const result = await res.json();

      // The route settles the payment first and notifies second, so a failed
      // webhook comes back as `webhook_failed` — the payment IS settled, only
      // the notification did not land. Both are valid outcomes, not errors.
      if (!res.ok || (result.status !== 'completed' && result.status !== 'webhook_failed')) {
        throw new Error(result.message || 'Could not complete this payment');
      }

      if (result.webhookSkipped) {
        toast({
          title: "Payment Completed",
          description: "No webhook URL was set for this payment, so nothing was called."
        });
      } else if (result.webhookDelivered) {
        toast({ title: "Payment Completed", description: "Webhook notified successfully." });
      } else {
        toast({
          variant: "destructive",
          title: "Settled — Your Server Refused The Webhook",
          description: result.webhookError
            ? `${result.webhookError} The payment is settled on our side; fix your endpoint and hit Retry Webhook.`
            : "The payment is settled on our side but your endpoint never accepted the notification. You can retry it."
        });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReject = async () => {
    if (!db || !reviewId || !review) return;
    setIsRejecting(true);
    try {
      // Mark it rejected first so the record is never deleted silently...
      await updateDoc(doc(db, 'pending_transactions', reviewId), {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        reviewedBy: user?.uid || null
      });

      // ...release the checkout session so the customer can try again...
      if (review.userId && review.sessionId) {
        await updateDoc(doc(db, 'payment_sessions', review.userId, 'sessions', review.sessionId), {
          reviewStatus: 'rejected'
        }).catch((e) => console.error('Session release failed:', e));
      }

      // ...then drop it from the database, as requested.
      await deleteDoc(doc(db, 'pending_transactions', reviewId));

      toast({ title: "Request Rejected", description: "The review request has been removed." });
      router.push('/dashboard/pending-payments');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Reject Failed", description: error.message });
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading request...</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <Card className="bg-[#0b141a] border-2 border-dashed border-border/30 p-12 text-center flex flex-col items-center gap-5 rounded-3xl">
          <div className="h-16 w-16 rounded-full bg-[#162129] flex items-center justify-center">
            <Ban className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">Request Not Found</h3>
            <p className="text-sm text-muted-foreground">
              This review request no longer exists — it was either rejected or already settled.
            </p>
          </div>
          <Button asChild variant="outline" className="border-border/20 font-bold">
            <Link href="/dashboard/pending-payments"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Queue</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const isPending = review.status === 'pending';
  const isCompleted = review.status === 'completed';
  // `webhook_failed` is the new explicit state; the second clause keeps older
  // documents (written before that status existed) retryable too.
  const webhookRetryable =
    review.status === 'webhook_failed' || (isCompleted && review.webhookDelivered === false);
  const canAct = isPending || webhookRetryable;
  const busy = isCompleting || isRejecting;

  // Approving a review WRITES `transactions/{trxId}` itself, so after the first
  // attempt the document always exists — warning about it then would be warning
  // about our own write. Only flag it when the record belongs to a different
  // session, and only when it was actually consumed (`used`); a TrxID sitting in
  // the pool as `unused` is the normal, healthy case.
  const trxFromThisReview = !!existingTrx && existingTrx.sessionId === review.sessionId;
  const trxIsDuplicate = !!existingTrx && !trxFromThisReview && existingTrx.status === 'used';
  const trxAvailableInPool = !!existingTrx && !trxFromThisReview && existingTrx.status !== 'used';

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
            <Link href="/dashboard/pending-payments"><ArrowLeft className="h-3 w-3 mr-1.5" /> Back to Queue</Link>
          </Button>
          <h1 className="text-2xl font-headline font-bold text-foreground">Review Payment</h1>
          <p className="text-xs text-muted-foreground font-mono">{review.sessionId}</p>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] uppercase font-black px-3 py-1.5 ${STATUS_STYLES[review.status] || 'border-border/30 text-muted-foreground'}`}
        >
          {review.status === 'pending' && <Hourglass className="h-3 w-3 mr-1.5" />}
          {review.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1.5" />}
          {review.status === 'webhook_failed' && <AlertTriangle className="h-3 w-3 mr-1.5" />}
          {STATUS_LABELS[review.status] || review.status}
        </Badge>
      </div>

      {trxIsDuplicate && (
        <Card className="bg-rose-500/5 border-rose-500/30 p-4 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-rose-400">Duplicate TrxID Warning</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-mono font-bold text-slate-200">{review.trxId}</span> has already been consumed by another
              payment
              {existingTrx?.amount != null && <> for <span className="font-bold text-slate-200">৳{existingTrx.amount}</span></>}
              {existingTrx?.sessionId && <> (session <span className="font-mono text-slate-300">{existingTrx.sessionId}</span>)</>}.
              Check carefully before approving — the same ID may already have settled a different order.
            </p>
          </div>
        </Card>
      )}

      {trxAvailableInPool && (
        <Card className="bg-sky-500/5 border-sky-500/30 p-4 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-mono font-bold text-slate-200">{review.trxId}</span> exists in your transaction pool and is
            still <span className="font-mono font-bold text-slate-200">{existingTrx?.status}</span>
            {existingTrx?.amount != null && <> for <span className="font-bold text-slate-200">৳{existingTrx.amount}</span></>} —
            the money record is there and has not been spent, so this claim looks genuine.
          </p>
        </Card>
      )}

      {review.session?.amount != null && Number(review.amount) !== Number(review.session.amount) && (
        <Card className="bg-amber-500/5 border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The claimed amount does not match the original session amount. Verify before approving.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0b141a] border-border/40 shadow-2xl overflow-hidden rounded-2xl">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
            <CardHeader className="bg-[#162129] p-6 border-b border-border/10">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Customer's Claim
                  </CardDescription>
                  <CardTitle className="text-3xl font-black text-white font-mono">{review.trxId}</CardTitle>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</p>
                  <p className="text-2xl font-black text-[#16a34a]">৳{Number(review.amount || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-border/10">
              <Row icon={Hash} label="Claimed TrxID" value={review.trxId} mono accent />
              <Row icon={Smartphone} label="Sender Number" value={review.sender} mono accent />
              <Row icon={CircleDollarSign} label="Method / Source" value={(review.method || "—").toString().toUpperCase()} />
              <Row icon={Clock} label="Submitted At" value={formatDate(review.submittedAt)} />
              <Row icon={Timer} label="Failed Attempts" value={review.claim?.failedAttempts ?? 0} />
              <Row icon={AlertTriangle} label="Last Error" value={review.claim?.lastError} />
            </CardContent>
          </Card>

          <Card className="bg-[#0b141a] border-border/40 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-border/10">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-200">Payment Session</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground mt-1">
                Why this payment was created — exactly what your backend sent to the gateway.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-border/10">
              <Row icon={Fingerprint} label="Session / Invoice ID" value={review.sessionId} mono />
              <Row icon={Hash} label="val_id" value={review.val_id} mono accent />
              <Row icon={CircleDollarSign} label="Session Amount" value={`৳${Number(review.session?.amount ?? review.amount ?? 0).toFixed(2)}`} accent />
              <Row icon={Clock} label="Session Created" value={formatDate(review.session?.createdAt)} />
              <Row icon={Timer} label="Session Expired At" value={formatDate(review.session?.expiresAt)} />
              <Row icon={CheckCircle2} label="Session Status" value={(review.session?.status || "—").toString().toUpperCase()} />
              <div className="flex items-start justify-between gap-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2 shrink-0 pt-0.5">
                  <Webhook className="h-3 w-3 text-primary/70" /> Webhook URL
                </span>
                {review.webhook_url ? (
                  <button
                    onClick={() => copy(review.webhook_url, 'Webhook URL')}
                    className="text-xs font-mono font-bold text-primary text-right break-all hover:underline flex items-start gap-1.5"
                  >
                    {review.webhook_url} <Copy className="h-3 w-3 shrink-0 mt-0.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground/50">Not set</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0b141a] border-border/40 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-border/10">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-200">Origin & Ownership</CardTitle>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-border/10">
              <Row icon={Store} label="Brand" value={review.store?.name} accent />
              <Row icon={Globe} label="Website" value={review.store?.websiteUrl} mono />
              <Row icon={Fingerprint} label="API Key" value={review.apiKey} mono />
              <Row icon={Fingerprint} label="User ID" value={review.userId} mono />
              <Row icon={Smartphone} label="Customer Device" value={review.client?.userAgent} />
              <Row icon={Globe} label="Customer IP" value={review.client?.ip} mono />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0b141a] border-border/40 p-6 shadow-2xl rounded-2xl space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-200">Your Decision</p>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                {isPending
                  ? "Confirm the money actually reached your account before completing. Completing closes the payment first, then calls your webhook."
                  : webhookRetryable
                    ? "The payment is already settled — the session is closed and the TrxID is burned. Only the notification to your server failed, so retrying just sends the webhook again."
                    : "This request has already been settled."}
              </p>
            </div>

            {canAct ? (
              <div className="space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={busy}
                      className="w-full h-12 bg-[#16a34a] hover:bg-[#15803d] text-white font-black rounded-xl shadow-lg shadow-[#16a34a]/20"
                    >
                      {isCompleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      {webhookRetryable ? "Retry Webhook" : "Complete Payment"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#0b141a] border-border/20 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="text-[#16a34a] h-5 w-5" /> Complete This Payment?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        {review.webhook_url ? (
                          <>
                            AntiPay will close the session as verified for ৳{Number(review.amount || 0).toFixed(2)} first, then
                            call <span className="font-mono text-slate-200 break-all">{review.webhook_url}</span> to notify you.
                            Settling before notifying means your server sees a verified payment the moment the webhook arrives.
                          </>
                        ) : (
                          <>No webhook URL is set for this payment, so nothing will be called — the session will simply be closed as verified.</>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-secondary/10 hover:bg-secondary/20 border-none text-white">Not Yet</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold"
                        onClick={(e) => { e.preventDefault(); handleComplete(); }}
                        disabled={isCompleting}
                      >
                        Yes, Complete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Only an unsettled request can be rejected. Once the session is
                    closed and the TrxID burned, deleting the record would erase
                    the only trace of a payment that already went through. */}
                {isPending && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={busy}
                      variant="outline"
                      className="w-full h-11 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-bold rounded-xl"
                    >
                      {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      Reject Request
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#0b141a] border-border/20 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                        <XCircle className="text-rose-500 h-5 w-5" /> Reject This Request?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        The request will be marked rejected and then removed from the database. No webhook is called and the
                        customer can submit again with correct details.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-secondary/10 hover:bg-secondary/20 border-none text-white">Keep It</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
                        onClick={(e) => { e.preventDefault(); handleReject(); }}
                        disabled={isRejecting}
                      >
                        Yes, Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-[#162129] border border-border/10 p-4 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  Settled {formatDate(review.reviewedAt)}
                </span>
              </div>
            )}

            <Separator className="bg-border/10" />

            <div className="space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Webhook Delivery</p>
              {!review.webhook_url ? (
                <p className="text-[11px] font-bold text-muted-foreground/60 flex items-center gap-2">
                  <Ban className="h-3 w-3" /> No webhook configured
                </p>
              ) : review.webhookDelivered === true ? (
                <p className="text-[11px] font-bold text-[#16a34a] flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" /> Delivered successfully
                </p>
              ) : review.webhookDelivered === false ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 shrink-0" /> Delivery failed after 3 attempts
                  </p>
                  {review.webhookError && (
                    <p className="text-[10px] text-rose-300/80 leading-relaxed bg-rose-500/5 border border-rose-500/20 rounded-lg p-2.5 break-all">
                      {review.webhookError}
                    </p>
                  )}
                  {Array.isArray(review.webhookAttempts) && review.webhookAttempts.length > 0 && (
                    <ul className="space-y-1">
                      {review.webhookAttempts.map((a: any, i: number) => (
                        <li key={i} className="text-[10px] text-muted-foreground/80 leading-snug font-mono break-all">
                          #{a.attempt} → {a.status != null ? `HTTP ${a.status}` : 'no response'}
                          {a.error ? ` — ${a.error}` : a.body ? ` — ${String(a.body).slice(0, 120)}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                    Your endpoint must answer with a 2xx status. The payment itself is already settled — retrying only re-sends
                    the notification.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                  <Webhook className="h-3 w-3" /> Not called yet
                </p>
              )}
              {Array.isArray(review.warnings) && review.warnings.length > 0 && (
                <ul className="space-y-1 pt-1">
                  {review.warnings.map((w: string, i: number) => (
                    <li key={i} className="text-[10px] text-amber-400/80 leading-snug">• {w}</li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {review.store?.websiteUrl && (
            <Card className="bg-gradient-to-br from-[#162129] to-[#0b141a] border-border/20 p-5 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Merchant Site</p>
              <a
                href={review.store.websiteUrl.startsWith('http') ? review.store.websiteUrl : `https://${review.store.websiteUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 break-all"
              >
                {review.store.websiteUrl} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
