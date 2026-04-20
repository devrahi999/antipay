
'use client';

import { useState } from 'react';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Copy, 
  Plus, 
  ExternalLink, 
  Key, 
  RefreshCcw, 
  Trash2, 
  Settings, 
  Loader2,
  Globe,
  Mail,
  Link as LinkIcon
} from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function ApiKeysPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  const keysQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'apiKeys'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: apiKeys, isLoading } = useCollection(keysQuery);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsCreating(true);

    const newKey = `ap_live_${Math.random().toString(36).substring(2, 15)}`;
    
    // Create Store and ApiKey (simplified for MVP - typically stores are separate)
    const storeData = {
      name: storeName,
      websiteUrl,
      supportEmail,
      successRedirectUrl: redirectUrl,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const keyData = {
      id: newKey,
      userId: user.uid,
      storeName: storeName, // Denormalized for easier listing
      isActive: true,
      createdAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'apiKeys'), keyData);
    
    // Reset form
    setStoreName('');
    setWebsiteUrl('');
    setSupportEmail('');
    setRedirectUrl('');
    setIsCreating(false);
    toast({ title: "API Key Generated", description: "Your new API key has been created successfully." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "API Key copied to clipboard." });
  };

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDocumentNonBlocking(doc(db, 'users', user.uid, 'apiKeys', id));
    toast({ title: "Revoked", description: "API Key has been revoked." });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">API Keys</h1>
          <p className="text-muted-foreground">Manage your store credentials and integration keys.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>Enter your store details to generate a unique integration key.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateKey} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input 
                  id="store-name" 
                  placeholder="My Gadget Shop" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="web-url">Website URL</Label>
                  <Input 
                    id="web-url" 
                    placeholder="https://myshop.com" 
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input 
                    id="support-email" 
                    type="email" 
                    placeholder="help@myshop.com" 
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect-url">Success Redirect URL</Label>
                <Input 
                  id="redirect-url" 
                  placeholder="https://myshop.com/payment/success" 
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate API Key"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <p className="text-center py-10 text-muted-foreground">Loading your keys...</p>
        ) : apiKeys && apiKeys.length > 0 ? (
          apiKeys.map((key) => (
            <Card key={key.id} className="shadow-sm border-none overflow-hidden">
              <div className="h-1 bg-primary w-full" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold text-xl uppercase">
                    {key.storeName?.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{key.storeName}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {key.id.substring(0, 10)}... <Key className="h-3 w-3" />
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="h-3 w-3 text-primary" /> API Secret Key
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-secondary p-2.5 rounded-lg text-sm font-mono flex justify-between items-center">
                      <span>{key.id}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(key.id)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Keep this key secret. Do not share it in public or client-side code.</p>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/30 border-t flex justify-between px-6 py-4">
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="bg-background">
                    <RefreshCcw className="mr-2 h-4 w-4" /> Roll Key
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(key.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Revoke Key
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-2xl border-2 border-dashed">
            <Key className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold">No API Keys Found</h3>
            <p className="text-muted-foreground">Generate your first API key to start verifying payments.</p>
          </div>
        )}
      </div>
    </div>
  )
}
