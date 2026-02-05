import React from 'react';
import {Link, router} from "@inertiajs/react";
import {Avatar, AvatarFallback, AvatarImage} from "@/Components/UI/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/UI/dropdown-menu";
import {Menu, ChevronRight, User, Settings, LogOut, Moon, Plus} from "lucide-react";

const Topbar = ({
                    darkMode = false,
                    pageTitle = 'Overview',
                    pageSection = 'Dashboard',
                    onToggleSidebar,
                    onToggleDarkMode,
                    sidebarOpen = true,
                    isMobile = false,
                    currentUser = {
                        name: 'Admin User',
                        email: 'admin@example.com',
                        avatar: null
                    }
                }) => {
    const getUserInitials = () => {
        try {
            return (currentUser.name || 'User')
                .split(' ')
                .map(n => n.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 2);
        } catch {
            return 'U';
        }
    };

    const handleLogout = () => router.post('/logout');

    return (
        <header
            className="fixed top-0 right-0 h-16 z-40 bg-white dark:bg-[#0F0F10] border-b border-border/40 transition-all duration-300"
            style={{
                left: isMobile ? 0 : (sidebarOpen ? 260 : 72)
            }}
        >
            <div className="flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    >
                        <Menu className="w-5 h-5 text-foreground" strokeWidth={1.5}/>
                    </button>

                    <nav className="hidden sm:flex items-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{pageSection}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600"/>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{pageTitle}</span>
                    </nav>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onToggleDarkMode}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    >
                        <Moon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5}/>
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={currentUser.avatar}/>
                                    <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:block text-sm font-medium">
                                    {currentUser.name}
                                </span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>
                                <p className="text-sm font-medium">{currentUser.name}</p>
                                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/profile" className="flex items-center gap-2">
                                    <User className="w-4 h-4"/>
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/admin/settings" className="flex items-center gap-2">
                                    <Settings className="w-4 h-4"/>
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="w-4 h-4 mr-2"/>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
