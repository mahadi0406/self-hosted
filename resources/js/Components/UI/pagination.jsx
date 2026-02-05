import React from 'react';
import {Button} from '@/Components/UI/button';
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from 'lucide-react';

export const Pagination = ({data, onPageChange, className = ''}) => {
    if (!data || data.last_page <= 1) {
        return null;
    }

    const handlePageChange = (url) => {
        if (url && onPageChange) {
            onPageChange(url);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const currentPage = data.current_page;
        const lastPage = data.last_page;
        const delta = 2;

        pages.push(1);

        let rangeStart = Math.max(2, currentPage - delta);
        let rangeEnd = Math.min(lastPage - 1, currentPage + delta);

        if (rangeStart > 2) {
            pages.push('...');
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        if (rangeEnd < lastPage - 1) {
            pages.push('...');
        }

        if (lastPage > 1) {
            pages.push(lastPage);
        }

        return pages;
    };

    return (
        <div className={`flex items-center justify-between px-5 py-4 border-t border-border/50 ${className}`}>
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{data.from || 0}</span> to{' '}
                <span className="font-medium">{data.to || 0}</span> of{' '}
                <span className="font-medium">{data.total}</span> results
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(data.first_page_url)}
                    disabled={!data.prev_page_url}
                    className="h-8 w-8"
                >
                    <ChevronsLeft className="h-4 w-4"/>
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(data.prev_page_url)}
                    disabled={!data.prev_page_url}
                    className="h-8 w-8"
                >
                    <ChevronLeft className="h-4 w-4"/>
                </Button>

                <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                                    ...
                                </span>
                            );
                        }

                        const isActive = page === data.current_page;
                        const pageUrl = `${data.path}?page=${page}`;

                        return (
                            <Button
                                key={page}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageUrl)}
                                className="h-8 min-w-[2rem] px-3"
                            >
                                {page}
                            </Button>
                        );
                    })}
                </div>

                <div className="sm:hidden text-sm font-medium px-3">
                    Page {data.current_page} of {data.last_page}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(data.next_page_url)}
                    disabled={!data.next_page_url}
                    className="h-8 w-8"
                >
                    <ChevronRight className="h-4 w-4"/>
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(data.last_page_url)}
                    disabled={!data.next_page_url}
                    className="h-8 w-8"
                >
                    <ChevronsRight className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
