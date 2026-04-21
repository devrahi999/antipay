
'use client';

import { useState } from 'react';
import { collection, query, orderBy, serverTimestamp, doc, setDoc, deleteDoc, updateDoc, where } from 'firebase/firestore';
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
  Save,
  Loader2,
  Copy,
  ExternalLink,
  Eye,
  Trash2,
  Edit2
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function BrandsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

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

  // Query root 'stores' collection filtered by userId
  const brandsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'stores'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: brands, isLoading } = useCollection(brandsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsSubmitting(true);

    try {
      if (isEditMode && selectedBrand) {
        const docRef = doc(db, 'stores', selectedBrand.id);
        await updateDoc(docRef, {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Brand Updated", description: "The store details have been successfully updated." });
      } else {
        // Generate very long API Key (approx 40 chars total)
        const randomPart1 = Math.random().toString(36).substring(2, 15);
        const randomPart2 = Math.random().toString(36).substring(2, 15);
        const randomPart3 = Math.random().toString(36).substring(2, 15);
        const storeId = `anti_pay_${randomPart1}${randomPart2}${randomPart3}`.substring(0, 50);
        
        const docRef = doc(db, 'stores', storeId);
        
        const brandData = {
          ...formData,
          id: storeId,
          apiKey: storeId,
          userId: user.uid,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(docRef, brandData);
        toast({ title: "Brand Created", description: "Your new AntiPay brand and API key are ready." });
      }
      
      resetForm();
      setIsDialogOpen(false);
      setIsViewOpen(false);
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Action Failed", 
        description: error.message || "Could not save brand." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      websiteUrl: '',
      logoUrl: '',
      supportEmail: '',
      supportPhone: '',
      whatsappNumber: '',
      supportPageLink: ''
    });
    setIsEditMode(false);
    setSelectedBrand(null);
  };

  const handleEditClick = (brand: any) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      websiteUrl: brand.websiteUrl,
      logoUrl: brand.logoUrl || '',
      supportEmail: brand.supportEmail || '',
      supportPhone: brand.supportPhone || '',
      whatsappNumber: brand.whatsappNumber || '',
      supportPageLink: brand.supportPageLink || ''
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleViewClick = (brand: any) => {
    setSelectedBrand(brand);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user || !db || !confirm("Are you sure you want to delete this brand?")) return;
    try {
      await deleteDoc(doc(db, 'stores', id));
      toast({ title: "Deleted", description: "Brand has been successfully removed." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "API Key copied to your clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Brands & API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage your AntiPay store identities and integration credentials.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold shadow-[0_0_15px_rgba(22,163,74,0.3)] border-none">
              <Plus className="mr-2 h-4 w-4" /> Add New Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-[#0b141a] border-border/20 text-foreground p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b border-border/10 bg-[#162129]">
              <div className="flex items-center gap-2 text-[#16a34a]">
                <Tags className="h-5 w-5" />
                <DialogTitle className="font-bold text-lg text-[#16a34a]">
                  {isEditMode ? 'Edit Brand Details' : 'Register a New Brand'}
                </DialogTitle>
              </div>
              <DialogDescription className="text-[10px] text-muted-foreground">
                Provide your store information to generate a unique API key for integration.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-[#16a34a] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    Brand Identity
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-100">Brand Name <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="e.g., My Gadget Shop" 
                        className="bg-[#162129] border-border/20 h-10 text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-100">Website URL <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="https://myshop.com" 
                        className="bg-[#162129] border-border/20 h-10 text-white"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-100">Brand Logo URL</Label>
                      <Input 
                        placeholder="Paste image URL" 
                        className="bg-[#162129] border-border/20 h-10 text-white"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[#16a34a] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    Merchant Contact
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-100">Support Email</Label>
                      <Input 
                        type="email"
                        placeholder="help@myshop.com" 
                        className="bg-[#162129] border-border/20 h-10 text-white"
                        value={formData.supportEmail}
                        onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-100">Support Phone</Label>
                      <Input 
                        placeholder="+8801XXXXXXXXX" 
                        className="bg-[#162129] border-border/20 h-10 text-white"
                        value={formData.supportPhone}
                        onChange={(e) => setFormData({...formData, supportPhone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-100">WhatsApp Number</Label>
                      <Input 
                        placeholder="+8801XXXXXXXXX" 
                        className="bg-[#162129] border-border/20 h-10 text-white"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                <Button type="button" variant="ghost" className="bg-[#162129] hover:bg-[#1c2a35] text-muted-foreground px-8 border border-border/10" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#16a34a] hover:bg-[#15803d] text-white px-8 font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} 
                  {isEditMode ? 'Update Brand' : 'Save Brand'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#0b141a] border-border/40 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent bg-[#162129]/50">
                  <TableHead className="w-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 pl-6">#</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Brand Info</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">AntiPay API Key</TableHead>
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
                        <span className="text-xs">Fetching brands...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : brands && brands.length > 0 ? (
                  brands.map((brand, index) => (
                    <TableRow key={brand.id} className="border-border/10 hover:bg-primary/5 transition-colors group">
                      <TableCell className="text-xs font-mono text-muted-foreground pl-6">{(index + 1).toString().padStart(2, '0')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#162129] border border-border/10 flex items-center justify-center text-[#16a34a] font-bold text-sm shadow-inner overflow-hidden">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
                            ) : brand.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-100">{brand.name}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              {brand.websiteUrl} <ExternalLink className="h-2 w-2" />
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[280px]">
                          <code className="text-[10px] font-mono text-[#16a34a] bg-[#16a34a]/10 px-3 py-1.5 rounded border border-[#16a34a]/20 truncate">
                            {brand.apiKey}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
                            onClick={() => copyToClipboard(brand.apiKey)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10 font-bold px-3">
                          {brand.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/20">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#0b141a] border-border/20 text-slate-200">
                            <DropdownMenuItem className="text-xs cursor-pointer focus:bg-primary/10 focus:text-primary" onClick={() => handleViewClick(brand)}>
                              <Eye className="mr-2 h-3.5 w-3.5" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer focus:bg-primary/10 focus:text-primary" onClick={() => handleEditClick(brand)}>
                              <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Brand
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer focus:bg-primary/10 focus:text-primary" onClick={() => copyToClipboard(brand.apiKey)}>
                              <Copy className="mr-2 h-3.5 w-3.5" /> Copy API Key
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs cursor-pointer text-destructive focus:bg-destructive/10" onClick={() => handleDelete(brand.id)}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Brand
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-32">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2">
                          <Tags className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground">No Brands Found</p>
                        <p className="text-xs text-muted-foreground/60 max-w-xs leading-relaxed">
                          Click "Add New Brand" to generate your first AntiPay API key and start accepting payments.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Brand Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0b141a] border-border/20 text-foreground p-0">
          {selectedBrand && (
            <>
              <DialogHeader className="p-6 bg-[#162129] border-b border-border/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[#0b141a] flex items-center justify-center text-[#16a34a] font-bold text-xl border border-border/10 overflow-hidden">
                      {selectedBrand.logoUrl ? (
                        <img src={selectedBrand.logoUrl} alt={selectedBrand.name} className="h-full w-full object-cover" />
                      ) : selectedBrand.name.charAt(0)}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-white leading-tight">{selectedBrand.name}</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">{selectedBrand.websiteUrl}</DialogDescription>
                    </div>
                  </div>
                  <Badge className="bg-[#16a34a]/20 text-[#16a34a] border-[#16a34a]/30">Active</Badge>
                </div>
              </DialogHeader>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">AntiPay API Key</Label>
                  <div className="flex items-center gap-2 bg-[#162129] p-3 rounded-xl border border-border/10">
                    <code className="text-[10px] font-mono text-[#16a34a] truncate flex-1">{selectedBrand.apiKey}</code>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => copyToClipboard(selectedBrand.apiKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Support Email</p>
                    <p className="text-sm font-medium text-slate-100">{selectedBrand.supportEmail || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Support Phone</p>
                    <p className="text-sm font-medium text-slate-100">{selectedBrand.supportPhone || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">WhatsApp</p>
                    <p className="text-sm font-medium text-slate-100">{selectedBrand.whatsappNumber || "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Created On</p>
                    <p className="text-sm font-medium text-slate-100">
                      {selectedBrand.createdAt?.toDate ? selectedBrand.createdAt.toDate().toLocaleDateString() : "Just now"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-[#162129]/50 border-t border-border/10 flex justify-end gap-3">
                <Button variant="ghost" className="text-xs font-bold" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button className="bg-[#16a34a] hover:bg-[#15803d] text-xs font-bold px-6" onClick={() => { setIsViewOpen(false); handleEditClick(selectedBrand); }}>
                  <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Brand
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
