'use client';

import { useState } from 'react';
import { collectionGroup, query, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Tags, ExternalLink, User } from "lucide-react"

export default function AdminBrandsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const brandsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collectionGroup(db, 'stores'), orderBy('createdAt', 'desc'), limit(100));
  }, [db]);

  const { data: brands, isLoading } = useCollection(brandsQuery);

  const filteredBrands = brands?.filter(brand => 
    brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    brand.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">System Brands</h1>
          <p className="text-muted-foreground text-sm">Monitor every brand created across the AntiPay ecosystem.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search all brands..." 
            className="pl-10 bg-[#162129] border-border/10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-[#162129] border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/10 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 pl-6">Brand / Merchant</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Website</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">API Key</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14">Created On</TableHead>
                <TableHead className="text-[10px] uppercase font-bold text-muted-foreground h-14 text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">Fetching brands across system...</TableCell>
                </TableRow>
              ) : filteredBrands && filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <TableRow key={brand.id} className="border-border/5 hover:bg-white/5 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#0b141a] flex items-center justify-center text-[#16a34a] font-bold border border-border/10 overflow-hidden">
                          {brand.logoUrl ? <img src={brand.logoUrl} className="h-full w-full object-cover" alt="" /> : brand.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{brand.name}</span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                            <User className="h-2 w-2" /> {brand.userId?.substring(0, 12)}...
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a href={brand.websiteUrl} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                        {brand.websiteUrl} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <code className="text-[9px] font-mono text-[#16a34a] bg-[#16a34a]/10 px-2 py-1 rounded">
                        {brand.apiKey?.substring(0, 15)}...
                      </code>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                       {brand.createdAt?.toDate ? brand.createdAt.toDate().toLocaleDateString() : "Just now"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Badge className="bg-[#16a34a]/20 text-[#16a34a] border-[#16a34a]/30 text-[9px] uppercase">
                        {brand.status || 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2">
                      <Tags className="h-10 w-10 opacity-20" />
                      <p>{searchTerm ? "No brands match your search." : "No brands found in system."}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
