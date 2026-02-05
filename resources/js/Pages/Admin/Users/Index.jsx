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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import {Label} from '@/Components/UI/label';
import {Avatar, AvatarFallback, AvatarImage} from '@/Components/UI/avatar';
import {toast} from 'sonner';
import {
    Search,
    MoreVertical,
    Shield,
    Key,
    Trash2,
    LogIn,
    Wallet,
    Clock,
    CheckCircle,
    X
} from 'lucide-react';
import Pagination from "@/Components/UI/pagination.jsx";

const StatCard = ({title, value, color = "default"}) => {
    const colorClasses = {
        default: "text-foreground",
        green: "text-emerald-500",
        blue: "text-blue-500",
        purple: "text-purple-500",
    };

    return (
        <div className="p-5 rounded-xl border border-border/50 bg-white dark:bg-[#111113]">
            <div className="text-3xl font-semibold mb-1" style={{color: colorClasses[color]?.replace('text-', '')}}>
                <span className={colorClasses[color]}>{value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
        </div>
    );
};

const Index = ({users, stats, filters}) => {
    const [showLoginAsModal, setShowLoginAsModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newRole, setNewRole] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [showWalletsModal, setShowWalletsModal] = useState(false);
    const [userWallets, setUserWallets] = useState([]);

    const openWalletsModal = (user) => {
        setSelectedUser(user);
        router.get(`/admin/users/${user.id}/wallets`, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['wallets'],
            onSuccess: (page) => {
                setUserWallets(page.props.wallets || []);
                setShowWalletsModal(true);
            }
        });
    };

    const handleSearch = () => {
        const params = {search};
        if (role !== 'all') params.role = role;
        if (status !== 'all') params.status = status;

        router.get('/admin/users', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setRole('all');
        setStatus('all');
        router.get('/admin/users', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openStatusModal = (user) => {
        setSelectedUser(user);
        setNewStatus(user.status);
        setShowStatusModal(true);
    };

    const handleUpdateStatus = () => {
        router.patch(`/admin/users/${selectedUser.id}/status`, {
            status: newStatus
        }, {
            onSuccess: () => {
                toast.success('User status updated successfully!');
                setShowStatusModal(false);
            },
            onError: (errors) => {
                toast.error(errors.message || 'Failed to update status');
            }
        });
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleModal(true);
    };

    const handleUpdateRole = () => {
        router.patch(`/admin/users/${selectedUser.id}/role`, {
            role: newRole
        }, {
            onSuccess: () => {
                toast.success('User role updated successfully!');
                setShowRoleModal(false);
            },
            onError: (errors) => {
                toast.error(errors.message || 'Failed to update role');
            }
        });
    };

    const openLoginAsModal = (user) => {
        setSelectedUser(user);
        setShowLoginAsModal(true);
    };

    const handleLoginAs = () => {
        router.post(`/admin/users/${selectedUser.id}/login-as`, {}, {
            onSuccess: () => {
                toast.success(`Logged in as ${selectedUser.name}`);
                setShowLoginAsModal(false);
            },
            onError: (errors) => {
                toast.error(errors.message || 'Failed to login as user');
            }
        });
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setPassword('');
        setPasswordConfirmation('');
        setShowPasswordModal(true);
    };

    const handleResetPassword = () => {
        router.post(`/admin/users/${selectedUser.id}/reset-password`, {
            password,
            password_confirmation: passwordConfirmation
        }, {
            onSuccess: () => {
                toast.success('Password reset successfully!');
                setShowPasswordModal(false);
            },
            onError: (errors) => {
                toast.error(errors.message || 'Failed to reset password');
            }
        });
    };

    const getUserInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-emerald-500/10 text-emerald-600',
            pending: 'bg-amber-500/10 text-amber-600',
            suspended: 'bg-red-500/10 text-red-600',
            banned: 'bg-red-500/10 text-red-600'
        };
        return styles[status] || 'bg-muted text-muted-foreground';
    };

    const getRoleBadge = (role) => {
        const styles = {
            admin: 'bg-foreground text-background',
            moderator: 'bg-blue-500/10 text-blue-600',
            user: 'bg-muted text-foreground'
        };
        return styles[role] || 'bg-muted text-foreground';
    };

    return (
        <Layout pageTitle="All Users" pageSection="Users">
            <Head title="Users"/>

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Users" value={stats.totalUsers} color="default"/>
                    <StatCard title="Active Users" value={stats.activeUsers} color="green"/>
                    <StatCard title="Wallet Connected" value={stats.walletConnectedUsers} color="blue"/>
                    <StatCard title="Email Verified" value={stats.emailVerifiedUsers} color="purple"/>
                </div>

                <div className="p-5 rounded-xl border border-border/50 bg-white dark:bg-[#111113]">
                    <h3 className="text-base font-medium mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm text-muted-foreground">Search</Label>
                            <Input
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm text-muted-foreground">Role</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Roles"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="moderator">Moderator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm text-muted-foreground">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
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
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Wallet</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data?.length > 0 ? (
                                users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={user.avatar}/>
                                                    <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {user.uid || `ID: ${user.id}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{user.email}</span>
                                                {user.email_verified_at && (
                                                    <CheckCircle className="w-4 h-4 text-emerald-500"/>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadge(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openWalletsModal(user)}
                                                className="h-8"
                                            >
                                                <Wallet className="w-4 h-4 mr-2"/>
                                                View Wallets
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4"/>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                                                        <MoreVertical className="w-4 h-4 text-muted-foreground"/>
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openStatusModal(user)}>
                                                        <Shield className="w-4 h-4 mr-2"/>
                                                        Change Status
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openRoleModal(user)}>
                                                        <Shield className="w-4 h-4 mr-2"/>
                                                        Change Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openPasswordModal(user)}>
                                                        <Key className="w-4 h-4 mr-2"/>
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openLoginAsModal(user)}>
                                                        <LogIn className="w-4 h-4 mr-2"/>
                                                        Login As
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Pagination
                        data={users}
                        onPageChange={(url) => router.get(url, {}, {
                            preserveState: true,
                            preserveScroll: true,
                        })}
                    />
                </div>

                <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change User Status</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">User</Label>
                                <p className="font-medium">{selectedUser?.name}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">New Status</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="banned">Banned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleUpdateStatus} className="flex-1">Update</Button>
                                <Button variant="outline" onClick={() => setShowStatusModal(false)}>Cancel</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change User Role</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">User</Label>
                                <p className="font-medium">{selectedUser?.name}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">New Role</Label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleUpdateRole} className="flex-1">Update</Button>
                                <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">User</Label>
                                <p className="font-medium">{selectedUser?.name}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">New Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">Confirm Password</Label>
                                <Input
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleResetPassword} className="flex-1">Reset Password</Button>
                                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={showLoginAsModal} onOpenChange={setShowLoginAsModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Login As User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                                <LogIn className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        You are about to login as this user
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                        You will be logged in as this user and can access their account. Your admin session will be saved.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm text-muted-foreground">User Details</Label>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={selectedUser?.avatar}/>
                                        <AvatarFallback>
                                            {selectedUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{selectedUser?.name}</p>
                                        <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowLoginAsModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleLoginAs}
                                    className="flex-1"
                                >
                                    <LogIn className="w-4 h-4 mr-2"/>
                                    Login As User
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={showWalletsModal} onOpenChange={setShowWalletsModal}>
                <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="border-b pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-lg">User Wallets</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-0.5">{selectedUser?.name}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Total</div>
                                <div className="text-xl font-bold">{userWallets.length}</div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-3">
                        {userWallets.length > 0 ? (
                            <div className="rounded-xl border border-border/50 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[200px]">Currency</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                            <TableHead className="text-right">Available</TableHead>
                                            <TableHead className="text-right">Locked</TableHead>
                                            <TableHead className="text-center w-[180px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {userWallets.map((wallet) => (
                                            <TableRow key={wallet.id} className="hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {wallet.currency.icon ? (
                                                            <img
                                                                src={wallet.currency.icon}
                                                                alt={wallet.currency.code}
                                                                className="w-8 h-8 rounded-full ring-1 ring-border"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                                <Wallet className="w-4 h-4 text-white"/>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div
                                                                className="font-semibold text-sm">{wallet.currency.name}</div>
                                                            <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {wallet.currency.code}
                                                    </span>
                                                                <span
                                                                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                                        wallet.currency.type === 'crypto'
                                                                            ? 'bg-blue-500/10 text-blue-600'
                                                                            : 'bg-purple-500/10 text-purple-600'
                                                                    }`}>
                                                        {wallet.currency.type}
                                                    </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="font-bold text-base">
                                                        {parseFloat(wallet.balance).toFixed(wallet.currency.decimal_places)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {wallet.currency.symbol || wallet.currency.code}
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
                                                            className="h-7 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                                                            onClick={() => {
                                                                console.log('Add balance for wallet:', wallet.id);
                                                            }}
                                                        >
                                                            + Add
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="h-7 px-3 bg-red-500 hover:bg-red-600 text-white text-xs"
                                                            onClick={() => {
                                                                console.log('Subtract balance for wallet:', wallet.id);
                                                            }}
                                                        >
                                                            − Subtract
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div
                                    className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                    <Wallet className="w-8 h-8 text-muted-foreground"/>
                                </div>
                                <p className="text-muted-foreground font-medium">No wallets found</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-3 border-t">
                        <Button variant="outline" onClick={() => setShowWalletsModal(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default Index;
