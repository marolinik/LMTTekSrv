import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { quoteService, Quote } from '@/services/quote.service';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Calendar, DollarSign, Package, ArrowLeft, User, Mail, Building2, Phone } from 'lucide-react';
import { format } from 'date-fns';

type QuoteStatus = 'ALL' | Quote['status'];

const statusColors: Record<Quote['status'], string> = {
  PENDING: 'bg-yellow-500',
  REVIEWED: 'bg-blue-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  COMPLETED: 'bg-purple-500',
};

export default function AdminQuotes() {
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('ALL');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [newStatus, setNewStatus] = useState<Quote['status'] | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch quotes
  const { data, isLoading, error } = useQuery<{ quotes: Quote[]; pagination: any }>({
    queryKey: ['admin-quotes', selectedStatus],
    queryFn: () => quoteService.getAll({
      status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      page: 1,
      limit: 100,
    }),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['quote-stats'],
    queryFn: quoteService.getStats,
  });

  const quotes = data?.quotes || [];

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: Quote['status']; notes?: string }) =>
      quoteService.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] });
      toast({
        title: 'Quote updated',
        description: 'The quote status has been updated successfully.',
      });
      setSelectedQuote(null);
      setNewStatus('');
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update quote',
        description: error.response?.data?.error || 'An error occurred.',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateStatus = () => {
    if (!selectedQuote || !newStatus) return;
    updateStatusMutation.mutate({
      id: selectedQuote.id,
      status: newStatus as Quote['status'],
      notes: adminNotes.trim() || undefined,
    });
  };

  const openQuoteDialog = (quote: Quote) => {
    setSelectedQuote(quote);
    setNewStatus(quote.status);
    setAdminNotes(quote.adminNotes || '');
  };

  // Filter counts
  const statusCounts = {
    ALL: quotes.length,
    PENDING: quotes.filter((q) => q.status === 'PENDING').length,
    REVIEWED: quotes.filter((q) => q.status === 'REVIEWED').length,
    APPROVED: quotes.filter((q) => q.status === 'APPROVED').length,
    REJECTED: quotes.filter((q) => q.status === 'REJECTED').length,
    COMPLETED: quotes.filter((q) => q.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Quote Management</h1>
          <p className="text-muted-foreground">
            Manage and track all customer quote requests
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Quotes</CardDescription>
                <CardTitle className="text-3xl">{stats.totalQuotes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{stats.pendingQuotes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.approvedQuotes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Rejected</CardDescription>
                <CardTitle className="text-3xl text-red-600">{stats.rejectedQuotes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Revenue</CardDescription>
                <CardTitle className="text-2xl text-primary">
                  ${(stats.totalRevenue / 1000).toFixed(0)}K
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Tabs for status filtering */}
        <Tabs value={selectedStatus} onValueChange={(val) => setSelectedStatus(val as QuoteStatus)}>
          <TabsList className="mb-6">
            <TabsTrigger value="ALL">All ({statusCounts.ALL})</TabsTrigger>
            <TabsTrigger value="PENDING">Pending ({statusCounts.PENDING})</TabsTrigger>
            <TabsTrigger value="REVIEWED">Reviewed ({statusCounts.REVIEWED})</TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({statusCounts.APPROVED})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({statusCounts.REJECTED})</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed ({statusCounts.COMPLETED})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-destructive">Failed to load quotes. Please try again.</p>
                </CardContent>
              </Card>
            ) : quotes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
                  <p className="text-muted-foreground">
                    {selectedStatus === 'ALL'
                      ? 'No quotes have been submitted yet.'
                      : `No ${selectedStatus.toLowerCase()} quotes found.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {quotes.map((quote) => (
                  <Card
                    key={quote.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openQuoteDialog(quote)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5" />
                            Quote #{quote.quoteNumber}
                          </CardTitle>
                          <div className="space-y-1">
                            {quote.user && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {quote.user.name}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {quote.user.email}
                                </div>
                                {quote.user.company && (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {quote.user.company}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(quote.createdAt), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                        <Badge className={statusColors[quote.status]}>
                          {quote.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {quote.configuration.gpu.quantity}x {quote.configuration.gpu.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            ${quote.totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {quote.items.length} items
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quote Management Dialog */}
        {selectedQuote && (
          <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Quote #{selectedQuote.quoteNumber}</span>
                  <Badge className={statusColors[selectedQuote.status]}>
                    {selectedQuote.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Submitted on {format(new Date(selectedQuote.createdAt), 'MMMM dd, yyyy HH:mm')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Information */}
                {selectedQuote.user && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedQuote.user.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedQuote.user.email}</p>
                      </div>
                      {selectedQuote.user.company && (
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{selectedQuote.user.company}</p>
                        </div>
                      )}
                      {selectedQuote.user.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedQuote.user.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Configuration Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Configuration</h3>
                  <div className="grid gap-2 text-sm">
                    {selectedQuote.items.map((item, index) => (
                      <div key={index} className="flex justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.spec}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${item.totalPrice.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x ${item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between p-4 bg-primary/10 rounded-lg mt-4 font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">${selectedQuote.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Client Notes */}
                {selectedQuote.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Customer Notes</h3>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                      {selectedQuote.notes}
                    </p>
                  </div>
                )}

                {/* Update Status */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Update Quote Status</h3>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REVIEWED">Reviewed</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Admin Notes</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Add notes for the customer..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedQuote(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Quote'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
