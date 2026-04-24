'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDocs, query, collectionGroup, where, updateDoc, serverTimestamp, limit } from 'firebase/firestore';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from '@/firebase';

export default function PublicPaymentPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const db = useFirestore();
  
  const [session, setSession] = useState<any>(null);
  const [sessionPath, setSessionPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function fetchSession() {
      if (!db || !sessionId) return;
      try {
        // Querying collection group 'sessions' to find the document by its ID
        const q = query(collectionGroup(db, 'sessions'), limit(100));
        const querySnapshot = await getDocs(q);
        
        // Find the specific document that matches the sessionId
        const docSnap = querySnapshot.docs.find(d => d.id === sessionId);
        
        if (docSnap) {
          setSession(docSnap.data());
          setSessionPath(docSnap.ref.path);
        }
      } catch (e) {
        console.error("Error fetching session:", e);
      }
      setLoading(false);
    }
    fetchSession();
  }, [db, sessionId]);

  const handleVerify = async () => {
    if (!trxId || !db || !sessionPath) return;
    setVerifying(true);
    
    try {
      await updateDoc(doc(db, sessionPath), {
        trxId: trxId,
        status: 'verified',
        verifiedAt: serverTimestamp(),
        isUsed: true
      });
      setStatus('success');
      
      if (session?.redirectSuccessUrl) {
        setTimeout(() => {
          window.location.href = session.redirectSuccessUrl;
        }, 2000);
      }
    } catch (e) {
      setStatus('error');
    }
    setVerifying(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-body"><Loader2 className="animate-spin text-primary" /></div>;

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 p-4 font-body">
      <Card className="max-w-md w-full text-center p-8">
        <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold">Session Expired or Invalid</h1>
        <p className="text-muted-foreground mt-2">Please contact the merchant for a new payment link.</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/10 flex items-center justify-center p-4 font-body">
      <div className="max-w-md w-full space-y-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
            <ShieldCheck size={24} />
          </div>
          <span className="text-2xl font-headline font-bold tracking-tight text-primary">AntiPay</span>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center">
            <div className="h-16 w-16 bg-secondary rounded-2xl mx-auto flex items-center justify-center text-primary font-bold text-2xl mb-4">
              {session.storeName?.charAt(0) || "S"}
            </div>
            <CardTitle>{session.storeName || "Merchant Payment"}</CardTitle>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground mt-2">
              ৳{session.amount}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === 'success' ? (
              <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold">Payment Verified!</h3>
                <p className="text-sm text-muted-foreground">Redirecting you back to {session.storeName}...</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-secondary/50 rounded-xl border space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <Badge className="bg-primary uppercase">{session.method}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Send Money to:</span>
                    <span className="font-mono font-bold">{session.receiverNumber || "017XXXXXXXX"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className="h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</div>
                    Enter Transaction ID (TrxID)
                  </div>
                  <Input 
                    placeholder="e.g. 8J9A1X7K" 
                    className="h-12 uppercase text-center font-mono tracking-widest text-lg"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  />
                  {status === 'error' && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle size={12} /> Verification failed. Please check your TrxID.
                    </p>
                  )}
                </div>

                <Button 
                  className="w-full h-12 text-lg shadow-lg shadow-primary/20" 
                  onClick={handleVerify}
                  disabled={verifying || !trxId}
                >
                  {verifying ? <Loader2 className="animate-spin mr-2" /> : "Verify Payment"}
                </Button>
              </>
            )}
          </CardContent>
          <CardFooter className="bg-secondary/20 flex justify-center py-4 border-t">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Lock size={10} /> Secure checkout powered by AntiPay
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}