import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import {Card, CardDescription, CardHeader, CardTitle, CardContent} from "@/Components/UI/card.jsx";

export default function FilterBar({ filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

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

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/validate/history', {}, { replace: true });
    };

    return (
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
    );
}
