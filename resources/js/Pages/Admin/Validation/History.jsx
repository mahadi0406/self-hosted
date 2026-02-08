import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from "@/Layouts/admin/layout.jsx";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle } from '@/components/ui/alert';
import {
    Download, Trash2, CheckCircle, XCircle,
    AlertCircle, Mail, Eye,
} from 'lucide-react';
import StatsCards from "@/Components/Dashboard/StatsCards.jsx";
import FilterBar from "@/Components/Dashboard/FilterBar.jsx";
import DataTable from "@/Components/Dashboard/DataTable.jsx";

export default function ValidationHistory({ validations, stats, filters }) {
    const [selectedItems, setSelectedItems] = useState([]);

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

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const toggleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === validations?.data?.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(validations?.data?.map(item => item.id) || []);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedItems.length} validation records?`)) {
            router.post('/admin/validate/bulk-delete', {
                ids: selectedItems
            }, {
                onSuccess: () => setSelectedItems([])
            });
        }
    };

    // Define columns for the table
    const columns = [
        {
            header: 'Email Address',
            accessor: 'email',
            cellClassName: 'font-medium',
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => getStatusBadge(row.status),
        },
        {
            header: 'Score',
            accessor: 'score',
            render: (row) => (
                <span className={`font-bold ${getScoreColor(row.score)}`}>
                    {row.score}
                </span>
            ),
        },
        {
            header: 'Suggestion',
            accessor: 'suggestion',
            render: (row) => (
                row.suggestion ? (
                    <span className="text-blue-600 text-xs">
                        {row.suggestion}
                    </span>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
        },
        {
            header: 'List',
            accessor: 'list',
            render: (row) => (
                row.list ? (
                    <Badge variant="secondary">
                        {row.list.name}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
        },
        {
            header: 'Date',
            accessor: 'created_at',
            cellClassName: 'text-muted-foreground',
            render: (row) => new Date(row.created_at).toLocaleDateString(),
        },
        {
            header: 'Actions',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.get(`/admin/validate/${row.id}`)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (confirm('Delete this validation record?')) {
                                router.delete(`/admin/validate/${row.id}`);
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            ),
        },
    ];

    // Empty state component
    const emptyState = (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Mail className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">No validation records found</p>
            <p className="text-sm mt-1">
                Try adjusting your filters or validate some emails
            </p>
        </div>
    );

    return (
        <Layout pageTitle="Validation History" pageSection="Email Validation">
            <Head title="Validation History" />

            <div className="space-y-6">
                <StatsCards stats={stats} />

                <FilterBar filters={filters} />

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

                <DataTable
                    title="Validation Records"
                    description={`${validations?.total || 0} total records found`}
                    columns={columns}
                    data={validations?.data}
                    pagination={validations}
                    selectable={true}
                    selectedItems={selectedItems}
                    onToggleSelectItem={toggleSelectItem}
                    onToggleSelectAll={toggleSelectAll}
                    emptyState={emptyState}
                />
            </div>
        </Layout>
    );
}
