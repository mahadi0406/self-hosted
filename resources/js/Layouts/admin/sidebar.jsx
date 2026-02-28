import React, {useState, useEffect, useRef} from 'react';
import {Link, usePage, router} from "@inertiajs/react";
import {cn} from "@/lib/utils";
import {ScrollArea} from "@/Components/UI/scroll-area";
import {Avatar, AvatarFallback} from "@/Components/UI/avatar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/Components/UI/collapsible";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/UI/tooltip";
import {
    Home,
    MessageSquare,
    Send,
    Users,
    List,
    FileText,
    Zap,
    Inbox,
    BarChart3,
    Settings,
    Sparkles,
    Radio,
    Bot,
    PhoneCall,
    History,
    PlusCircle,
    Contact,
    Tag, CheckCircle, FolderOpen,
    ChevronDown, LogOut, Shield,
    Mail, TrendingUp
} from 'lucide-react';

const Sidebar = ({
                     isOpen = true,
                     isMobile = false,
                     onCloseSidebar,
                     pendingDisputes = 0,
                     pendingPayouts = 0,
                 }) => {
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [floatingMenu, setFloatingMenu] = useState({show: false, style: {}, items: []});
    const floatingRef = useRef(null);
    const scrollViewportRef = useRef(null);
    const {url, props} = usePage();

    const appName = props.appName || 'Experts-Trade';
    const config = {
        brandName: appName,
        brandSuffix: '',
        shortName: appName.substring(0, 2).toUpperCase(),
        logoutRoute: '/logout'
    };

    const userInfo = props.auth?.user ? {
        name: props.auth.user.name,
        role: props.auth.user.role,
        initials: props.auth.user.initials
    } : null;

    const SCROLL_POSITION_KEY = 'sidebar-scroll-position';
    const menuGroups = [
        {
            label: 'Dashboard',
            items: [
                { title: 'Dashboard', icon: Home, route: '/admin/dashboard' },
            ]
        },
        {
            label: 'Connections',
            items: [
                {
                    title: 'Channels',
                    icon: Radio,
                    submenu: [
                        { title: 'All Channels',       route: '/admin/channels' },
                        { title: 'Add WhatsApp',        route: '/admin/channels/whatsapp/create' },
                        { title: 'Add Telegram',        route: '/admin/channels/telegram/create' },
                    ]
                },
                {
                    title: 'Contact Lists',
                    icon: List,
                    submenu: [
                        { title: 'All Lists',    route: '/admin/contact-lists' },
                        { title: 'Create List',  route: '/admin/contact-lists/create' },
                    ]
                },
                {
                    title: 'Contacts',
                    icon: Users,
                    submenu: [
                        { title: 'All Contacts',   route: '/admin/contacts' },
                        { title: 'Add Contact',    route: '/admin/contacts/create' },
                        { title: 'Import CSV',     route: '/admin/contacts/import' },
                    ]
                },
            ]
        },
        {
            label: 'Messaging',
            items: [
                {
                    title: 'Templates',
                    icon: FileText,
                    submenu: [
                        { title: 'All Templates',    route: '/admin/templates' },
                        { title: 'Create Template',  route: '/admin/templates/create' },
                    ]
                },
                {
                    title: 'Campaigns',
                    icon: Send,
                    submenu: [
                        { title: 'All Campaigns',    route: '/admin/campaigns' },
                        { title: 'Create Campaign',  route: '/admin/campaigns/create' },
                    ]
                },
                {
                    title: 'Drip Sequences',
                    icon: Zap,
                    submenu: [
                        { title: 'All Sequences',   route: '/admin/drip-sequences' },
                        { title: 'Create Sequence', route: '/admin/drip-sequences/create' },
                    ]
                },
                {
                    title: 'Inbox',
                    icon: Inbox,
                    route: '/admin/inbox',
                    badge: 'LIVE'
                },
            ]
        },
        {
            label: 'AI Features',
            items: [
                {
                    title: 'AI Message Writer',
                    icon: Sparkles,
                    route: '/admin/ai/message-writer',
                    badge: 'AI'
                },
                {
                    title: 'AI Campaign Planner',
                    icon: Bot,
                    route: '/admin/ai/campaign-planner',
                    badge: 'AI'
                },
            ]
        },
        {
            label: 'Analytics',
            items: [
                { title: 'Campaign Analytics', icon: BarChart3, route: '/admin/analytics/campaigns' },
                { title: 'AI Logs',            icon: History,   route: '/admin/analytics/ai-logs' },
            ]
        },
        {
            label: 'Settings',
            items: [
                { title: 'Settings', icon: Settings, route: '/admin/settings' },
            ]
        },
    ];

    const isActive = (route) => route && (url === route || url.startsWith(route + '/'));
    const hasActiveChild = (submenu) => submenu?.some(s => isActive(s.route));

    useEffect(() => {
        const findAndSetViewport = () => {
            const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                scrollViewportRef.current = viewport;
                const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
                if (savedPosition) {
                    viewport.scrollTop = parseInt(savedPosition, 10);
                }

                return true;
            }
            return false;
        };

        if (!findAndSetViewport()) {
            const timer = setTimeout(findAndSetViewport, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        const viewport = scrollViewportRef.current;
        if (!viewport) return;

        const handleScroll = () => {
            sessionStorage.setItem(SCROLL_POSITION_KEY, viewport.scrollTop.toString());
        };

        viewport.addEventListener('scroll', handleScroll, {passive: true});
        return () => viewport.removeEventListener('scroll', handleScroll);
    }, [scrollViewportRef.current]);

    useEffect(() => {
        const viewport = scrollViewportRef.current;
        if (!viewport) return;

        const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
        if (savedPosition) {
            viewport.scrollTop = parseInt(savedPosition, 10);
            const timer = setTimeout(() => {
                viewport.scrollTop = parseInt(savedPosition, 10);
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [url]);

    const handleMenuClick = (item, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (item.submenu) {
            if (!isOpen && !isMobile) {
                const rect = e.currentTarget.getBoundingClientRect();
                setFloatingMenu({
                    show: expandedMenu !== item.title,
                    title: item.title,
                    items: item.submenu,
                    style: {top: rect.top, left: rect.right + 12}
                });
                setExpandedMenu(expandedMenu === item.title ? null : item.title);
            } else {
                setExpandedMenu(expandedMenu === item.title ? null : item.title);
            }
        } else if (isMobile) {
            onCloseSidebar?.();
        }
    };

    const handleSubClick = () => {
        if (isMobile) onCloseSidebar?.();
        if (!isOpen) {
            setFloatingMenu({show: false, items: []});
            setExpandedMenu(null);
        }
    };

    const handleLinkClick = () => {
        if (isMobile) onCloseSidebar?.();
    };

    const handleLogout = () => {
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
        router.get(config.logoutRoute);
    };

    useEffect(() => {
        if (isOpen && !isMobile) {
            menuGroups.forEach(group => {
                const active = group.items.find(m => m.submenu && hasActiveChild(m.submenu));
                if (active && expandedMenu !== active.title) {
                    setExpandedMenu(active.title);
                }
            });
        }
    }, [url, isOpen, isMobile]);

    useEffect(() => {
        const handleClick = (e) => {
            if (floatingRef.current && !floatingRef.current.contains(e.target)) {
                setFloatingMenu({show: false, items: []});
            }
        };
        if (floatingMenu.show) document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [floatingMenu.show]);

    useEffect(() => {
        if (!isOpen || isMobile) {
            setExpandedMenu(null);
            setFloatingMenu({show: false, items: []});
        }
    }, [isOpen, isMobile]);

    const renderMenuItem = (item) => {
        const Icon = item.icon;
        const active = isActive(item.route);
        const childActive = hasActiveChild(item.submenu);
        const expanded = expandedMenu === item.title;

        if (item.submenu) {
            return (
                <Collapsible key={item.title} open={isOpen && expanded}>
                    <CollapsibleTrigger asChild>
                        <button
                            onClick={(e) => handleMenuClick(item, e)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                "hover:bg-muted",
                                (childActive || expanded) ? "bg-muted text-foreground" : "text-muted-foreground",
                                !isOpen && "justify-center px-2"
                            )}
                        >
                            {!isOpen && !isMobile ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="relative">
                                            <Icon className="w-5 h-5" strokeWidth={1.5}/>
                                            {item.badge && (
                                                <span
                                                    className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"/>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {item.title} {item.badge && `(${item.badge})`}
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <>
                                    <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5}/>
                                    <span className="flex-1 text-left">{item.title}</span>
                                    {item.badge && (
                                        <span
                                            className="px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded mr-1">
                                            {item.badge}
                                        </span>
                                    )}
                                    <ChevronDown className={cn(
                                        "w-4 h-4 transition-transform",
                                        expanded && "rotate-180"
                                    )}/>
                                </>
                            )}
                        </button>
                    </CollapsibleTrigger>
                    {isOpen && (
                        <CollapsibleContent className="mt-1 ml-7 space-y-1">
                            {item.submenu.map((sub) => (
                                <Link key={sub.route} href={sub.route} onClick={handleSubClick}>
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                        "hover:bg-muted",
                                        isActive(sub.route)
                                            ? "text-foreground font-medium"
                                            : "text-muted-foreground"
                                    )}>
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            isActive(sub.route) ? "bg-foreground" : "bg-muted-foreground/40"
                                        )}/>
                                        {sub.title}
                                    </div>
                                </Link>
                            ))}
                        </CollapsibleContent>
                    )}
                </Collapsible>
            );
        }

        return (
            <Link key={item.title} href={item.route} onClick={handleLinkClick}>
                <div className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    "hover:bg-muted",
                    active ? "bg-muted text-foreground" : "text-muted-foreground",
                    !isOpen && "justify-center px-2"
                )}>
                    {!isOpen && !isMobile ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative">
                                    <Icon className="w-5 h-5" strokeWidth={1.5}/>
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"/>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {item.title} {item.badge && `(${item.badge})`}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <>
                            <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5}/>
                            <span className="flex-1 text-left">{item.title}</span>
                            {item.badge && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded">
                                    {item.badge}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </Link>
        );
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside className={cn(
                "fixed top-0 left-0 h-full z-50 transition-all duration-300",
                "bg-white dark:bg-[#0F0F10] border-r border-border/40",
                "flex flex-col",
                isMobile
                    ? (isOpen ? "w-64 translate-x-0" : "-translate-x-full w-64")
                    : (isOpen ? "w-[260px]" : "w-[72px]")
            )}>
                <div className="h-16 flex items-center px-4 border-b border-border/40 shrink-0">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                            <span className="text-background text-sm font-bold">
                                {config.shortName.charAt(0)}
                            </span>
                        </div>
                        {(isOpen || isMobile) && (
                            <span className="text-lg font-semibold">
                                {config.brandName}<span className="text-primary">{config.brandSuffix}</span>
                            </span>
                        )}
                    </Link>
                </div>

                <ScrollArea className="flex-1 py-4">
                    <nav className="px-3 space-y-6">
                        {menuGroups.map((group) => (
                            <div key={group.label}>
                                {isOpen && (
                                    <div className="px-3 mb-2">
                                        <span
                                            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                            {group.label}
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {group.items.map(renderMenuItem)}
                                </div>
                            </div>
                        ))}
                    </nav>
                </ScrollArea>

                <div className="border-t border-border/40 p-3 shrink-0">
                    {isOpen && userInfo && (
                        <div className="flex items-center gap-3 px-2 py-2 mb-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-muted text-foreground font-medium">
                                    {userInfo.initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{userInfo.name}</p>
                                <p className="text-xs text-muted-foreground">{userInfo.role}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10",
                            !isOpen && "justify-center px-2"
                        )}
                    >
                        {!isOpen && !isMobile ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <LogOut className="w-5 h-5" strokeWidth={1.5}/>
                                </TooltipTrigger>
                                <TooltipContent side="right">Logout</TooltipContent>
                            </Tooltip>
                        ) : (
                            <>
                                <LogOut className="w-5 h-5" strokeWidth={1.5}/>
                                <span>Logout</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {floatingMenu.show && !isOpen && !isMobile && (
                <div
                    ref={floatingRef}
                    className="fixed bg-white dark:bg-[#0F0F10] border border-border/40 rounded-lg shadow-lg py-1 min-w-[160px] z-[60]"
                    style={floatingMenu.style}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="px-3 py-2 text-xs font-medium uppercase text-muted-foreground border-b border-border/40 mb-1">
                        {floatingMenu.title}
                    </div>
                    {floatingMenu.items?.map((sub) => (
                        <Link key={sub.route} href={sub.route} onClick={handleSubClick}>
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                                "hover:bg-muted",
                                isActive(sub.route) ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isActive(sub.route) ? "bg-foreground" : "bg-muted-foreground/40"
                                )}/>
                                {sub.title}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </TooltipProvider>
    );
};

export default Sidebar;
