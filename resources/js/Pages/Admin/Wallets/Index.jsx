import React, {useState} from 'react';
import Layout from "@/Layouts/admin/layout.jsx";
import {Head, router} from '@inertiajs/react';
import {Button} from '@/Components/UI/button';
import {Input} from '@/Components/UI/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import {Label} from '@/Components/UI/label';
import {Textarea} from '@/Components/UI/textarea';
import {Avatar, AvatarFallback, AvatarImage} from '@/Components/UI/avatar';
import {toast} from 'sonner';
import {
    Search,
    Plus,
    Minus,
    Trash2,
} from 'lucide-react';
import Pagination from "@/Components/UI/pagination.jsx";

const StatCard = ({title, value, color = "default"}) => {
    const colorClasses = {
        default: "text-foreground",
        green: "text-emerald-500",
        blue: "text-blue-500",
        amber: "text-amber-500",
    };

    return (
        <div className="p-5 rounded-xl border border-border/50 bg-white dark:bg-[#111113]">
            <div className="text-3xl font-semibold mb-1">
                <span className={colorClasses[color]}>{value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
        </div>
    );
};

const Index = ({wallets, currencies, stats, filters}) => {
    const [search, setSearch] = useState(filters.search || '');
    const [currencyId, setCurrencyId] = useState(filters.currency_id || 'all');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [adjustType, setAdjustType] = useState('add');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    const handleSearch = () => {
        const params = {search};
        if (currencyId !== 'all') params.currency_id = currencyId;

        router.get('/admin/wallets', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setCurrencyId('all');
        router.get('/admin/wallets', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openAdjustModal = (wallet, type) => {
        setSelectedWallet(wallet);
        setAdjustType(type);
        setAmount('');
        setNotes('');
        setShowAdjustModal(true);
    };

    const handleAdjustBalance = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        router.post(`/admin/wallets/${selectedWallet.id}/adjust-balance`, {
            amount: parseFloat(amount),
            type: adjustType,
            notes: notes
        }, {
            onSuccess: () => {
                toast.success('Balance adjusted successfully!');
                setShowAdjustModal(false);
            },
            onError: (errors) => {
                toast.error(errors.message || 'Failed to adjust balance');
            }
        });
    };

    const handleDelete = (wallet) => {
        if (wallet.balance > 0) {
            toast.error('Cannot delete wallet with balance');
            return;
        }

        if (confirm(`Are you sure you want to delete this wallet?`)) {
            router.delete(`/admin/wallets/${wallet.id}`, {
                onSuccess: () => {
                    toast.success('Wallet deleted successfully!');
                },
                onError: (errors) => {
                    toast.error(errors.message || 'Failed to delete wallet');
                }
            });
        }
    };

    const getUserInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <Layout pageTitle="User Wallets" pageSection="Users">
            <Head title="User Wallets"/>

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Wallets" value={stats.totalWallets} color="default"/>
                    <StatCard title="Total Balance" value={parseFloat(stats.totalBalance).toFixed(2)} color="green"/>
                    <StatCard title="Available Balance" value={parseFloat(stats.totalAvailable).toFixed(2)}
                              color="blue"/>
                    <StatCard title="Locked Balance" value={parseFloat(stats.totalLocked).toFixed(2)} color="amber"/>
                </div>

                <div className="p-5 rounded-xl border border-border/50 bg-white dark:bg-[#111113]">
                    <h3 className="text-base font-medium mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm text-muted-foreground">Search</Label>
                            <Input
                                placeholder="Search by user name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm text-muted-foreground">Currency</Label>
                            <Select value={currencyId} onValueChange={setCurrencyId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Currencies"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Currencies</SelectItem>
                                    {currencies.map((currency) => (
                                        <SelectItem key={currency.id} value={currency.id.toString()}>
                                            {currency.code} - {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={handleSearch} className="flex-1">
                                <Search className="w-4 h-4 mr-2"/>
                                Search
                            </Button>
                            <Button variant="outline" onClick={handleReset}>Reset</Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-white dark:bg-[#111113] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-right">Available</TableHead>
                                <TableHead className="text-right">Locked</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {wallets.data?.length > 0 ? (
                                wallets.data.map((wallet) => (
                                    <TableRow key={wallet.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={wallet.user.avatar}/>
                                                    <AvatarFallback>{getUserInitials(wallet.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm">{wallet.user.name}</div>
                                                    <div
                                                        className="text-xs text-muted-foreground">{wallet.user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {wallet.currency.icon && (
                                                    <img
                                                        src={wallet.currency.icon}
                                                        alt={wallet.currency.code}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-semibold text-sm">{wallet.currency.code}</div>
                                                    <div
                                                        className="text-xs text-muted-foreground">{wallet.currency.name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-bold text-base">
                                                {parseFloat(wallet.balance).toFixed(wallet.currency.decimal_places)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-semibold text-emerald-600">
                                                {parseFloat(wallet.available_balance).toFixed(wallet.currency.decimal_places)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-semibold text-amber-600">
                                                {parseFloat(wallet.locked_balance).toFixed(wallet.currency.decimal_places)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white"
                                                    onClick={() => openAdjustModal(wallet, 'add')}
                                                >
                                                    <Plus className="w-4 h-4 mr-1"/>
                                                    Add
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-8 px-3 bg-red-500 hover:bg-red-600 text-white"
                                                    onClick={() => openAdjustModal(wallet, 'subtract')}
                                                >
                                                    <Minus className="w-4 h-4 mr-1"/>
                                                    Subtract
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => handleDelete(wallet)}
                                                    disabled={wallet.balance > 0}
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        No wallets found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <Pagination
                        data={wallets}
                        onPageChange={(url) => router.get(url, {}, {
                            preserveState: true,
                            preserveScroll: true,
                        })}
                    />
                </div>

                <Dialog open={showAdjustModal} onOpenChange={setShowAdjustModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {adjustType === 'add' ? 'Add Balance' : 'Subtract Balance'}
                            </DialogTitle>
                        </DialogHeader>
                        {selectedWallet && (
                            <div className="space-y-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">User</Label>
                                    <p className="font-medium">{selectedWallet.user.name}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">Currency</Label>
                                    <p className="font-medium">{selectedWallet.currency.code} - {selectedWallet.currency.name}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">Current Balance</Label>
                                    <p className="font-bold text-lg">
                                        {parseFloat(selectedWallet.balance).toFixed(selectedWallet.currency.decimal_places)}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">Available Balance</Label>
                                    <p className="font-semibold text-emerald-600">
                                        {parseFloat(selectedWallet.available_balance).toFixed(selectedWallet.currency.decimal_places)}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Amount *</Label>
                                    <Input
                                        type="number"
                                        step="0.00000001"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes about this adjustment..."
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        onClick={handleAdjustBalance}
                                        className={`flex-1 ${adjustType === 'add' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                                    >
                                        {adjustType === 'add' ? 'Add Balance' : 'Subtract Balance'}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowAdjustModal(false)}>Cancel</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
};

export default Index;
