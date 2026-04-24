
'use client';

import { useState, useRef } from 'react';
import { collection, query, serverTimestamp, doc, setDoc, updateDoc, where, limit, writeBatch, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Edit2,
  AlertTriangle,
  Lock,
  Globe,
  Settings,
  Mail,
  Phone,
  MessageCircle,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
  X
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { uploadLogoAction } from '@/app/actions/upload';
import Link from 'next/link';

export default function BrandsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  
  // Deletion State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    logoUrl: '',
    supportEmail: '',
    supportPhone: '',
    whatsappNumber: '',
    supportPageLink: '',
    redirectSuccessUrl: '',
    redirectCancelUrl: ''
  });

  // Fetch active plan to check limits
  const planRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'user_plans', user.uid);
  }, [db, user?.uid]);
  const { data: activePlan } = useDoc(planRef);

  const brandsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'stores'), 
      where('userId', '==', user.uid),
      limit(100)
    );
  }, [db, user?.uid]);

  const { data: brands, isLoading } = useCollection(brandsQuery);

  const canAddBrand = activePlan && (brands ? brands.length < activePlan.maxApiKeys : true);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please select an image file." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ variant: "destructive", title: "File Too Large", description: "Image size should be less than 5MB." });
      return;
    }

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const secureUrl = await uploadLogoAction(uploadData);
      setFormData(prev => ({ ...prev, logoUrl: secureUrl }));
      
      toast({ title: "Logo Uploaded", description: "Image has been processed successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message || "Could not upload image." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    if (!isEditMode && !canAddBrand) {
      toast({ variant: "destructive", title: "Limit Reached", description: "Your current plan does not allow more brands." });
      return;
    }

    setIsSubmitting(true);

    try {
      const batch = writeBatch(db);

      if (isEditMode && selectedBrand) {
        const docRef = doc(db, 'stores', selectedBrand.id);
        batch.update(docRef, {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
        toast({ title: "Brand Updated", description: "The store details have been successfully updated." });
      } else {
        const randomPart1 = Math.random().toString(36).substring(2, 15);
        const randomPart2 = Math.random().toString(36).substring(2, 15);
        const storeId = `anti_pay_${randomPart1}${randomPart2}`.substring(0, 30);
        
        const docRef = doc(db, 'stores', storeId);
        
        const brandData = {
          ...formData,
          id: storeId,
          apiKey: storeId,
          userId: user.uid,
          status: 'active',
          isActive: true,
          connected_devices_count: 0,
          methods: [
            { bkash: { isActive: true, number: "" } },
            { nagad: { isActive: true, number: "" } },
            { rocket: { isActive: true, number: "" } }
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        batch.set(docRef, brandData);
        
        // Update counter in user_plans
        const userPlanRef = doc(db, 'user_plans', user.uid);
        batch.update(userPlanRef, { created_brands_count: increment(1), updatedAt: serverTimestamp() });

        await batch.commit();
        toast({ title: "Brand Created", description: "Your new AntiPay brand and API key are ready." });
      }
      
      resetForm();
      setIsDialogOpen(false);
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
      name: '', websiteUrl: '', logoUrl: '', supportEmail: '', supportPhone: '', whatsappNumber: '', supportPageLink: '', redirectSuccessUrl: '', redirectCancelUrl: ''
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
      supportPageLink: brand.supportPageLink || '',
      redirectSuccessUrl: brand.redirectSuccessUrl || '',
      redirectCancelUrl: brand.redirectCancelUrl || ''
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleViewClick = (brand: any) => {
    setSelectedBrand(brand);
    setIsViewOpen(true);
  };

  const confirmDelete = (id: string) => {
    setBrandToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!user || !db || !brandToDelete) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'stores', brandToDelete));
      
      // Decrement counter
      const userPlanRef = doc(db, 'user_plans', user.uid);
      batch.update(userPlanRef, { created_brands_count: increment(-1), updatedAt: serverTimestamp() });

      await batch.commit();
      toast({ title: "Deleted", description: "Brand has been successfully removed." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsDeleteDialogOpen(false);
      setBrandToDelete(null);
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
        
        {!activePlan ? (
          <Button asChild className="ios-btn bg-amber-500 hover:bg-amber-600 font-bold">
            <Link href="/dashboard/plans"><Lock className="mr-2 h-4 w-4" /> Buy Plan to Add Brand</Link>
          </Button>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) resetForm(); setIsDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button disabled={!canAddBrand} className="ios-btn bg-[#16a34a] hover:bg-[#15803d] text-white font-bold shadow-lg shadow-[#16a34a]/20 border-none">
                <Plus className="mr-2 h-4 w-4" /> {canAddBrand ? 'Add New Brand' : 'Limit Reached'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-[#0b141a] border-border/20 text-foreground p-0 overflow-hidden shadow-2xl">
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
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        Brand Identity
                      </h3>
                      
                      {/* Logo Upload Section */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-100">Store Logo</Label>
                        <div className="flex items-center gap-4">
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-20 w-20 rounded-2xl bg-[#162129] border-2 border-dashed border-border/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#16a34a]/40 hover:bg-[#162129]/80 transition-all relative overflow-hidden group"
                          >
                            {formData.logoUrl ? (
                              <>
                                <img src={formData.logoUrl} alt="Preview" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Upload className="h-5 w-5 text-white" />
                                </div>
                              </>
                            ) : isUploading ? (
                              <Loader2 className="h-6 w-6 animate-spin text-[#16a34a]" />
                            ) : (
                              <>
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                <span className="text-[8px] font-bold text-muted-foreground mt-1">UPLOAD</span>
                              </>
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                             <p className="text-[10px] text-muted-foreground leading-tight">Recommended size: 500x500px. Max size: 5MB.</p>
                             <input 
                              type="file" 
                              ref={fileInputRef} 
                              onChange={handleFileChange} 
                              className="hidden" 
                              accept="image/*" 
                             />
                             <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-[10px] border-border/10 bg-[#162129]"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                             >
                               {isUploading ? "Uploading..." : "Choose Image"}
                             </Button>
                             {formData.logoUrl && (
                               <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-[10px] text-destructive hover:bg-destructive/10"
                                onClick={() => setFormData(p => ({ ...prev, logoUrl: '' }))}
                               >
                                 Remove
                               </Button>
                             )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-100">Brand Name <span className="text-destructive">*</span></Label>
                          <Input placeholder="e.g., My Gadget Shop" className="bg-[#162129] border-border/20 h-10 text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-100">Website URL <span className="text-destructive">*</span></Label>
                          <Input placeholder="https://myshop.com" className="bg-[#162129] border-border/20 h-10 text-white" value={formData.websiteUrl} onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})} required />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h3 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        Endpoint Configuration
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-100">Redirect Success URL <span className="text-destructive">*</span></Label>
                          <Input placeholder="https://myshop.com/payment/success" className="bg-[#162129] border-border/20 h-10 text-white" value={formData.redirectSuccessUrl} onChange={(e) => setFormData({...formData, redirectSuccessUrl: e.target.value})} required />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-100">Redirect Cancel URL <span className="text-destructive">*</span></Label>
                          <Input placeholder="https://myshop.com/payment/cancel" className="bg-[#162129] border-border/20 h-10 text-white" value={formData.redirectCancelUrl} onChange={(e) => setFormData({...formData, redirectCancelUrl: e.target.value})} required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      Merchant Contact
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-100">Support Email</Label>
                        <Input type="email" placeholder="help@myshop.com" className="bg-[#162129] border-border/20 h-10 text-white" value={formData.supportEmail} onChange={(e) => setFormData({...formData, supportEmail: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-100">Support Phone</Label>
                        <Input placeholder="+880 17XXXXXXXX" className="bg-[#162129] border-border/20 h-10 text-white" value={formData.supportPhone} onChange={(e) => setFormData({...formData, supportPhone: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-100">WhatsApp Number</Label>
                        <Input placeholder="+880 1XXXXXXXXX" className="bg-[#162129] border-border/20 h-10 text-white" value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-100">Support Page Link</Label>
                        <Input placeholder="https://myshop.com/contact" className="bg-[#162129] border-border/20 h-10 text-white" value={formData.supportPageLink} onChange={(e) => setFormData({...formData, supportPageLink: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border/10">
                  <Button type="button" variant="ghost" className="bg-[#162129] hover:bg-[#1c2a35] text-muted-foreground px-8 border border-border/10 rounded-xl" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="ios-btn bg-[#16a34a] hover:bg-[#15803d] text-white px-8 font-bold rounded-xl" disabled={isSubmitting || isUploading}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} 
                    {isEditMode ? 'Update Brand' : 'Save Brand'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scanning Network...</p>
          </div>
        ) : brands && brands.length > 0 ? (
          brands.map((brand) => (
            <Card key={brand.id} className="bg-[#0b141a] border-border/40 shadow-xl overflow-hidden flex flex-col group hover:border-primary/20 transition-all duration-300">
              <div className="h-1.5 bg-[#16a34a] w-full" />
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#162129] border border-border/10 flex items-center justify-center text-[#16a34a] font-bold text-xl uppercase shadow-inner overflow-hidden">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      brand.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-100 truncate">{brand.name}</CardTitle>
                      <Badge variant="outline" className={`text-[8px] uppercase px-2 py-0 h-5 font-black ${brand.isActive === false ? 'border-rose-500/30 text-rose-500 bg-rose-500/10' : 'border-[#16a34a]/30 text-[#16a34a] bg-[#16a34a]/10'}`}>
                        {brand.isActive === false ? 'Inactive' : 'Active'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{brand.websiteUrl}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 pt-0 space-y-4 flex-1">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Lock className="h-3 w-3" /> AntiPay Identity Key
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#162129] p-3 rounded-xl text-[10px] font-mono text-[#16a34a] flex justify-between items-center border border-border/5">
                      <span className="truncate">{brand.apiKey}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => copyToClipboard(brand.apiKey)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-border/5 bg-[#162129]/20 grid grid-cols-2 gap-3 mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full h-10 font-bold border-border/20 text-xs gap-2 rounded-xl hover:bg-primary/5 hover:text-primary"
                  onClick={() => handleViewClick(brand)}
                >
                  <Eye className="h-4 w-4" /> View
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-10 font-bold border-border/20 text-xs gap-2 rounded-xl hover:bg-[#16a34a]/10 hover:text-[#16a34a]"
                  onClick={() => handleEditClick(brand)}
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-[#0b141a] rounded-[2.5rem] border-2 border-dashed border-border/10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 bg-[#162129] rounded-full flex items-center justify-center mb-2">
                <Tags className="h-8 w-8 text-muted-foreground/20" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">No Brands Configured</h3>
              <p className="text-xs text-muted-foreground max-w-xs">Create your first brand identity to generate an API key and start collecting payments.</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="mt-6 bg-[#16a34a] hover:bg-[#15803d] rounded-xl font-bold px-8"
              >
                Create My First Brand
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Brand Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] bg-[#0b141a] border-border/20 text-foreground p-0 shadow-2xl overflow-hidden rounded-[2rem]">
          {selectedBrand && (
            <>
              <DialogHeader className="p-8 bg-gradient-to-br from-[#162129] to-[#0b141a] border-b border-border/10">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-[#0b141a] flex items-center justify-center text-[#16a34a] font-bold text-3xl border border-border/10 uppercase shadow-2xl overflow-hidden">
                      {selectedBrand.logoUrl ? (
                         <img src={selectedBrand.logoUrl} alt="" className="h-full w-full object-cover" />
                      ) : selectedBrand.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <DialogTitle className="text-2xl font-headline font-black text-white">{selectedBrand.name}</DialogTitle>
                        <Badge className="bg-[#16a34a]/20 text-[#16a34a] border-[#16a34a]/10 text-[9px] uppercase px-3">Live Instance</Badge>
                      </div>
                      <DialogDescription className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                        <LinkIcon className="h-3 w-3" /> {selectedBrand.websiteUrl}
                      </DialogDescription>
                    </div>
                </div>
              </DialogHeader>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-black">API Integration Key</Label>
                  <div className="bg-[#162129] p-4 rounded-2xl border border-border/10 flex items-center gap-4 group shadow-inner">
                    <code className="text-sm font-mono text-[#16a34a] truncate flex-1 font-bold">{selectedBrand.apiKey}</code>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-white" onClick={() => copyToClipboard(selectedBrand.apiKey)}>
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[#16a34a] tracking-widest flex items-center gap-2">
                       <Globe className="h-3 w-3" /> Dynamic Endpoints
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#162129]/30 rounded-2xl border border-border/5">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Success Redirect</p>
                        <p className="text-xs font-medium text-slate-200 truncate">{selectedBrand.redirectSuccessUrl || "—"}</p>
                      </div>
                      <div className="p-4 bg-[#162129]/30 rounded-2xl border border-border/5">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Cancel Redirect</p>
                        <p className="text-xs font-medium text-slate-200 truncate">{selectedBrand.redirectCancelUrl || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[#16a34a] tracking-widest flex items-center gap-2">
                       <Phone className="h-3 w-3" /> Merchant Support
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#162129]/30 rounded-2xl border border-border/5 flex items-center gap-3">
                        <Mail className="h-3.5 w-3.5 text-primary opacity-40" />
                        <div>
                           <p className="text-[9px] uppercase font-bold text-muted-foreground">Support Email</p>
                           <p className="text-xs font-medium text-slate-200">{selectedBrand.supportEmail || "—"}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-[#162129]/30 rounded-2xl border border-border/5 flex items-center gap-3">
                        <MessageCircle className="h-3.5 w-3.5 text-primary opacity-40" />
                        <div>
                           <p className="text-[9px] uppercase font-bold text-muted-foreground">WhatsApp</p>
                           <p className="text-xs font-medium text-slate-200">{selectedBrand.whatsappNumber || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-[#16a34a] tracking-widest flex items-center gap-2">
                     <Globe className="h-3 w-3" /> External Reference
                  </h4>
                  <a href={selectedBrand.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#162129]/30 rounded-2xl border border-border/5 group hover:bg-[#162129]/50 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                           <Globe size={18} />
                        </div>
                        <div>
                           <p className="text-[9px] uppercase font-bold text-muted-foreground">Visit Brand Website</p>
                           <p className="text-xs font-medium text-slate-200 truncate max-w-[250px]">{selectedBrand.websiteUrl}</p>
                        </div>
                     </div>
                     <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              </div>

              <div className="p-6 bg-[#162129]/50 border-t border-border/10 flex justify-end items-center px-8 gap-3">
                <Button variant="ghost" className="text-xs font-bold rounded-xl" onClick={() => setIsViewOpen(false)}>Close</Button>
                <Button className="ios-btn bg-[#16a34a] hover:bg-[#15803d] text-xs font-bold rounded-xl px-8" onClick={() => { setIsViewOpen(false); handleEditClick(selectedBrand); }}>
                  <Edit2 className="h-3.5 w-3.5 mr-2" /> Modify Configuration
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0b141a] border-border/20 text-white rounded-[2rem]">
          <AlertDialogHeader>
            <div className="h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 mx-auto md:mx-0">
               <AlertTriangle size={32} />
            </div>
            <AlertDialogTitle className="text-2xl font-black font-headline">Revoke Brand Identity?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed text-sm">
              This action is irreversible. The associated API key will stop working immediately across all your integrations and connected nodes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="bg-[#162129] hover:bg-[#1c2a35] border-none text-white rounded-xl h-11 px-6 font-bold">Retain Brand</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl h-11 px-8 shadow-lg shadow-rose-500/20" onClick={handleDelete}>
              Yes, Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
