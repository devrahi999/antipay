import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, ExternalLink } from "lucide-react"

export default function TransactionsPage() {
  const transactions = [
    { id: "TX_83921", date: "2024-03-24 14:22", store: "MyGadget BD", method: "bKash", amount: "৳2,450.00", status: "Completed" },
    { id: "TX_83922", date: "2024-03-24 13:10", store: "FashionHub", method: "Nagad", amount: "৳4,800.00", status: "Completed" },
    { id: "TX_83923", date: "2024-03-24 12:45", store: "MyGadget BD", method: "Rocket", amount: "৳1,200.00", status: "Pending" },
    { id: "TX_83924", date: "2024-03-23 20:15", store: "Daily Needs", method: "bKash", amount: "৳550.00", status: "Failed" },
    { id: "TX_83925", date: "2024-03-23 18:30", store: "FashionHub", method: "Nagad", amount: "৳1,100.00", status: "Completed" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Monitor real-time payment activities across all stores.</p>
        </div>
        <Button variant="outline" className="bg-card">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="shadow-sm border-none">
        <CardHeader className="pb-3">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by Transaction ID, Store or Customer..." className="pl-10" />
            </div>
            <Button variant="secondary">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead>TX ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="cursor-pointer hover:bg-secondary/30">
                  <TableCell className="font-mono font-medium text-primary">{tx.id}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{tx.date}</TableCell>
                  <TableCell className="font-medium">{tx.store}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5 text-primary">
                      {tx.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{tx.amount}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        tx.status === "Completed" ? "bg-green-100 text-green-700" :
                        tx.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="View Details">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}