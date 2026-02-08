import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';
import {
    Search, Download, Trash2, CheckCircle, XCircle,
    AlertCircle, Mail, Eye, Filter, Calendar
} from 'lucide-react';

export default function ValidationHistory({ validations, stats, filters }) {

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [selectedItems, setSelectedItems] = useState([]);

    // Handle search
    const handleSearch = () => {
        router.get('/admin/validate/history', {
            search: searchTerm,
            status: selectedStatus,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Clear filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/validate/history', {}, { replace: true });
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const variants = {
            valid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
            invalid: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
            risky: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
        };

        const icons = {
            valid: CheckCircle,
            invalid: XCircle,
            risky: AlertCircle,
        };

        const Icon = icons[status] || AlertCircle;

        return (
            <Badge className={variants[status]}>
                <Icon className="w-3 h-3 mr-1" />
                {status.toUpperCase()}
            </Badge>
        );
    };

    // Get score color
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Toggle select item
    const toggleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedItems.length === validations?.data?.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(validations?.data?.map(item => item.id) || []);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedItems.length} validation records?`)) {
            router.post('/admin/validate/bulk-delete', {
                ids: selectedItems
            }, {
                onSuccess: () => setSelectedItems([])
            });
        }
    };

    return (
        <Layout pageTitle="Validation History" pageSection="Email Validation">
            <Head title="Validation History" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Validated</p>
                                    <p className="text-2xl font-bold">{stats?.total || 0}</p>
                                </div>
                                <Mail className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Valid Emails</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats?.valid || 0}</p>
                                    <p className="text-xs text-muted-foreground">{stats?.valid_percentage || 0}%</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-emerald-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Invalid Emails</p>
                                    <p className="text-2xl font-bold text-red-600">{stats?.invalid || 0}</p>
                                    <p className="text-xs text-muted-foreground">{stats?.invalid_percentage || 0}%</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Risky Emails</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats?.risky || 0}</p>
                                    <p className="text-xs text-muted-foreground">{stats?.risky_percentage || 0}%</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Search & Filters
                        </CardTitle>
                        <CardDescription>
                            Filter validation records by email, status, or date range
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="search">Search Email</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        type="text"
                                        placeholder="Enter email address..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">All Status</option>
                                    <option value="valid">Valid</option>
                                    <option value="invalid">Invalid</option>
                                    <option value="risky">Risky</option>
                                </select>
                            </div>

                            {/* Date From */}
                            <div className="space-y-2">
                                <Label htmlFor="date_from">Date From</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <Button onClick={handleSearch}>
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>

                            {(searchTerm || selectedStatus || dateFrom) && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions Alert */}
                {selectedItems.length > 0 && (
                    <Alert>
                        <AlertTitle className="flex items-center justify-between">
                            <span>{selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected</span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.post('/admin/validate/export', { ids: selectedItems })}
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    Export
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </AlertTitle>
                    </Alert>
                )}

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Validation Records</CardTitle>
                        <CardDescription>
                            {validations?.total || 0} total records found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted">
                                <tr>
                                    <th className="px-6 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === validations?.data?.length}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                    </th>
                                    <th className="px-6 py-3">Email Address</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Score</th>
                                    <th className="px-6 py-3">Suggestion</th>
                                    <th className="px-6 py-3">List</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {validations?.data?.length > 0 ? (
                                    validations.data.map((validation) => (
                                        <tr key={validation.id} className="border-b hover:bg-muted/50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(validation.id)}
                                                    onChange={() => toggleSelectItem(validation.id)}
                                                    className="w-4 h-4 rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {validation.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(validation.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span className={`font-bold ${getScoreColor(validation.score)}`}>
                                                        {validation.score}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {validation.suggestion ? (
                                                    <span className="text-blue-600 text-xs">
                                                            {validation.suggestion}
                                                        </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {validation.list ? (
                                                    <Badge variant="secondary">
                                                        {validation.list.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(validation.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.get(`/admin/validate/${validation.id}`)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Delete this validation record?')) {
                                                                router.delete(`/admin/validate/${validation.id}`);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Mail className="h-12 w-12 mb-3 opacity-50" />
                                                <p className="font-medium">No validation records found</p>
                                                <p className="text-sm mt-1">
                                                    Try adjusting your filters or validate some emails
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {validations?.data?.length > 0 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing <span className="font-medium">{validations.from}</span> to{' '}
                                    <span className="font-medium">{validations.to}</span> of{' '}
                                    <span className="font-medium">{validations.total}</span> results
                                </div>
                                <div className="flex gap-2">
                                    {validations.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
