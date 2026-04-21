
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Search, 
  Filter as FilterIcon, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  MoreHorizontal
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function InvoicesPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage and track your customer billing invoices.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#0b141a] p-4 rounded-xl border border-border/20 shadow-lg">
        <Button className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold shadow-[0_0_15px_rgba(22,163,74,0.3)]">
          <Plus className="mr-2 h-4 w-4" /> Create Custom Invoice
        </Button>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, Email, Name, or A..." 
            className="pl-10 bg-[#162129] border-border/20 focus:ring-primary/20 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select>
          <SelectTrigger className="w-[140px] bg-[#162129] border-border/20 h-10">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="bkash">bKash</SelectItem>
            <SelectItem value="nagad">Nagad</SelectItem>
            <SelectItem value="rocket">Rocket</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[140px] bg-[#162129] border-border/20 h-10">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-[#0095ff] hover:bg-[#007acc] text-white font-bold shadow-[0_0_15px_rgba(0,149,255,0.3)] px-6">
          <FilterIcon className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Invoices Table */}
      <Card className="bg-[#0b141a] border-border/40 shadow-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="w-12">
                    <div className="h-4 w-4 rounded border border-border/40 bg-[#162129]" />
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Sender No</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Customer Email</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Method</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Txn ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14">Date</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 h-14 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-32">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2">
                        <FileText className="h-8 w-8 text-muted-foreground/20" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No invoices found matching current criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 py-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/20 hover:bg-primary/10">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/20 hover:bg-primary/10">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
