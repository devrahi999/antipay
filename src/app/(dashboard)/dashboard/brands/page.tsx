
'use client';

import { useState } from 'react';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Tags, 
  MoreHorizontal, 
  X,
  Upload,
  Save,
  Loader2
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function BrandsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    logoUrl: '',
    supportEmail: '',
    supportPhone: '',
    whatsappNumber: '',
    supportPageLink: ''
  });

  const brandsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'stores'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: brands, isLoading } = useCollection(brandsQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsSubmitting(true);

    const brandKey = `bk_${Math.random().toString(36).substring(2, 12)}`;
    
    const brandData = {
      ...formData,
      brandKey,
      userId: user.uid,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(db, 'users', user.uid, 'stores'), brandData);
    
    setFormData({
      name: '',
      websiteUrl: '',
      logoUrl: '',
      supportEmail: '',
      supportPhone: '',
      whatsappNumber: '',
      supportPageLink: ''
    });
    
    setIsSubmitting(false);
    setIsDialogOpen(false);
    toast({ title: "Brand Added", description: "Your new brand has been created successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Brands</h1>
          <p className="text-sm text-muted-foreground">Manage your AntiPay store identities and configurations.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold shadow-[0_0_15px_rgba(22,163,74,0.3)] border-none">
              <Plus className="mr-2 h-4 w-4" /> Add New Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-[#0b141a] border-border/20 text-foreground p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/10 bg-[#162129]">
              <div className="flex items-center gap-2 text-[#16a34a]">
                <Tags className="h-5 w-5" />
                <DialogTitle className="font-bold text-lg text-[#16a34a]">Add a New Brand</DialogTitle>
              </div>
              <DialogClose className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
            
            <DialogDescription className="sr-only">
              Fill out the form below to register a new brand for your AntiPay merchant account.
            </DialogDescription>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-[#16a34a] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandName" className="text-sm font-bold text-slate-100">Brand Name <span className="text-destructive">*</span></Label>
                      <Input 
                        id="brandName" 
                        placeholder="e.g., AntiPay Store" 
                        className="bg-[#162129] border-border/20 h-10 text-white placeholder:text-muted-foreground/50"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl" className="text-sm font-bold text-slate-100">Website URL <span className="text-destructive">*</span></Label>
                      <Input 
                        id="websiteUrl" 
                        placeholder="https://example.com" 
                        className="bg-[#162129] border-border/20 h-10 text-white placeholder:text-muted-foreground/50"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl" className="text-sm font-bold text-slate-100">Brand Logo URL</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="logoUrl" 
                          placeholder="Paste image URL" 
                          className="bg-[#162129] border-border/20 h-10 text-white flex-1 placeholder:text-muted-foreground/50"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                        />
                        <Button type="button" variant="secondary" className="bg-[#16a34a] hover:bg-[#15803d] text-white h-10 px-4">
                          <Upload className="h-4 w-4 mr-2" /> Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[#16a34a] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    Contact Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail" className="text-sm font-bold text-slate-100">Support Email</Label>
                      <Input 
                        id="supportEmail" 
                        type="email"
                        placeholder="support@example.com" 
                        className="bg-[#162129] border-border/20 h-10 text-white placeholder:text-muted-foreground/50"
                        value={formData.supportEmail}
                        onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportPhone" className="text-sm font-bold text-slate-100">Support Phone</Label>
                      <Input 
                        id="supportPhone" 
                        placeholder="+8801XXXXXXXXX" 
                        className="bg-[#162129] border-border/20 h-10 text-white placeholder:text-muted-foreground/50"
                        value={formData.supportPhone}
                        onChange={(e) => setFormData({...formData, supportPhone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-sm font-bold text-slate-100">WhatsApp Number</Label>
                      <Input 
                        id="whatsapp" 
                        placeholder="+8801XXXXXXXXX" 
                        className="bg-[#162129] border-border/20 h-10 text-white placeholder:text-muted-foreground/50"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportPage" className="text-sm font-bold text-slate-100">Support Page Link</Label>
                      <Input 
                        id="supportPage" 
                        placeholder="https://example.com/support" 
                        className="bg-[#162129] border-border/20 h-10 text-white placeholder:text-muted-foreground/50"
                        value={formData.supportPageLink}
                        onChange={(e) => setFormData({...formData, supportPageLink: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" className="bg-[#162129] hover:bg-[#1c2a35] text-muted-foreground px-8 border border-border/10">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="bg-[#16a34a] hover:bg-[#15803d] text-white px-8 font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Brand
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#0b141a] border-border/40 shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="w-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 pl-6">#</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Brand Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Brand Key/API Key</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">Loading brands...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : brands && brands.length > 0 ? (
                  brands.map((brand, index) => (
                    <TableRow key={brand.id} className="border-border/10 hover:bg-secondary/10 transition-colors">
                      <TableCell className="text-xs font-mono text-muted-foreground pl-6">{(index + 1).toString().padStart(2, '0')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[#162129] flex items-center justify-center text-[#16a34a] font-bold text-xs">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover rounded-lg" />
                            ) : brand.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium">{brand.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[#16a34a]">{brand.brandKey}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase border-[#16a34a]/20 text-[#16a34a] bg-[#16a34a]/5">
                          {brand.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#16a34a]/10 hover:text-[#16a34a]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-32">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mb-2">
                          <Tags className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">No Brands Found</p>
                        <p className="text-xs text-muted-foreground/60">Get started by adding a new brand for AntiPay.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
