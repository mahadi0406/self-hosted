import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export default function DataTable({
                                      title,
                                      description,
                                      columns,
                                      data,
                                      pagination,
                                      selectedItems = [],
                                      onToggleSelectItem,
                                      onToggleSelectAll,
                                      selectable = false,
                                      emptyState,
                                  }) {
    const hasData = data && data.length > 0;

    return (
        <Card>
            {(title || description) && (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted">
                        <tr>
                            {selectable && (
                                <th className="px-6 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === data?.length && data?.length > 0}
                                        onChange={onToggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                </th>
                            )}
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-3 ${column.headerClassName || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {hasData ? (
                            data.map((row, rowIndex) => (
                                <tr key={row.id || rowIndex} className="border-b hover:bg-muted/50">
                                    {selectable && (
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(row.id)}
                                                onChange={() => onToggleSelectItem(row.id)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                        </td>
                                    )}
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 ${column.cellClassName || ''}`}
                                        >
                                            {column.render
                                                ? column.render(row, rowIndex)
                                                : row[column.accessor]
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    className="px-6 py-12 text-center"
                                >
                                    {emptyState || (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <p className="font-medium">No data found</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {hasData && pagination && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{pagination.from}</span> to{' '}
                            <span className="font-medium">{pagination.to}</span> of{' '}
                            <span className="font-medium">{pagination.total}</span> results
                        </div>
                        <div className="flex gap-2">
                            {pagination.links?.map((link, index) => (
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
    );
}
