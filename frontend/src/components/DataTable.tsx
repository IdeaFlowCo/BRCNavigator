import React, { useMemo, useRef, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnSizingState,
    CellContext, // Import CellContext
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
    ArrowUp,
    ArrowDown,
    ChevronsUpDown,
    GripVertical,
    Heart, // Import Heart icon
} from "lucide-react";
import { useData } from "../context/DataContext";
import "./DataTable.css";
// import { Button } from "./ui/button"; // Remove Button import

const DataTable: React.FC = () => {
    const {
        headers,
        filteredRows,
        loading,
        favoriteIds, // Get favorites state
        addFavorite, // Get favorite actions
        removeFavorite,
        uidColumnIndex, // Get UID column index
    } = useData();
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

    // Function to estimate initial size based on header length
    const calculateInitialSize = (headerText: string, totalColumns: number = 10): number => {
        // Get viewport width to make calculations responsive
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const isMobile = viewportWidth <= 480; // Match CSS breakpoint!
        
        if (isMobile) {
            // On mobile, distribute viewport width among columns
            const actionsColumnWidth = 40; // Fixed width for actions column
            const availableWidth = viewportWidth - actionsColumnWidth - 20; // Minus actions and some padding
            const baseColumnWidth = Math.floor(availableWidth / totalColumns);
            
            // Give Description column more space, but not too much
            if (headerText === "Description") {
                return Math.min(baseColumnWidth * 2, 150);
            }
            
            // For other columns, use base width with slight adjustments
            const minWidth = 40;
            const maxWidth = 100;
            return Math.max(minWidth, Math.min(maxWidth, baseColumnWidth));
        } else {
            // Desktop calculation (original logic)
            const baseSize = 120;
            const charWidth = 8;
            const padding = 40;
            const estimatedWidth = headerText.length * charWidth + padding;
            const dynamicBase = Math.max(baseSize, estimatedWidth * 0.6);
            let calculatedSize = Math.max(50, Math.max(dynamicBase, estimatedWidth * 0.8));
            
            if (headerText === "Description") {
                calculatedSize *= 3;
            }
            
            return Math.min(500, calculatedSize);
        }
    };

    // Define the Actions column separately
    const actionsColumn: ColumnDef<string[]> = useMemo(
        () => {
            const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
            const isMobile = viewportWidth <= 480; // Match CSS breakpoint!
            const columnSize = isMobile ? 40 : 60;
            
            return {
            id: "actions",
            header: () => <Heart size={isMobile ? 20 : 24} />, // Smaller icon on mobile
            size: columnSize,
            minSize: columnSize,
            maxSize: columnSize,
            enableResizing: false,
            cell: ({ row }: CellContext<string[], unknown>) => {
                // Ensure uidColumnIndex is valid before proceeding
                if (
                    uidColumnIndex < 0 ||
                    uidColumnIndex >= row.original.length
                ) {
                    console.error("Invalid UID column index:", uidColumnIndex);
                    return null; // Or render an error indicator
                }
                const uid = row.original[uidColumnIndex];
                const isFavorited = favoriteIds.has(uid);

                // Correct event type for div onClick
                const handleFavoriteClick = (
                    e:
                        | React.MouseEvent<HTMLDivElement>
                        | React.KeyboardEvent<HTMLDivElement>
                ) => {
                    e.stopPropagation(); // Prevent row click events if any
                    if (isFavorited) {
                        removeFavorite(uid);
                    } else {
                        addFavorite(uid);
                    }
                };

                // Use a div wrapper instead of Button for custom styling
                return (
                    <div
                        onClick={handleFavoriteClick}
                        className={`favorite-icon-wrapper ${
                            isFavorited ? "favorited" : ""
                        }`}
                        role="button" // Add role for accessibility
                        aria-pressed={isFavorited} // Indicate state
                        aria-label={
                            isFavorited ? "Remove favorite" : "Add favorite"
                        }
                        tabIndex={0} // Make it focusable
                        // Correct event type for div onKeyDown
                        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                            // Allow activation with Enter/Space
                            if (e.key === "Enter" || e.key === " ") {
                                handleFavoriteClick(e); // No cast needed now
                            }
                        }}
                    >
                        <Heart size={isMobile ? 20 : 24} className="favorite-icon" />
                        {/* Smaller icon on mobile */}
                    </div>
                );
            },
        }},
        [favoriteIds, addFavorite, removeFavorite, uidColumnIndex]
    );

    const dataColumns = useMemo<ColumnDef<string[]>[]>(() => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const isMobile = viewportWidth <= 480; // Match CSS breakpoint!
        
        return headers.map((header, index) => ({
            id: String(index), // Keep original index as ID for data columns
            header: header,
            accessorFn: (row) => row[index], // Accessor remains the same
            size: calculateInitialSize(header, headers.length),
            minSize: isMobile ? 30 : 50,
            maxSize: isMobile ? 100 : 500,
            // enableResizing: true // Default is true, no need to explicitly set unless overriding
        }));
        // Filter out the UID column if it exists and we don't want to display it
        // .filter((_, index) => index !== uidColumnIndex); // Optional: Hide UID column
    }, [headers]); // uidColumnIndex is derived from headers, so not needed as dependency

    // Combine actions column and data columns
    const columns = useMemo<ColumnDef<string[]>[]>(
        () => [actionsColumn, ...dataColumns],
        [actionsColumn, dataColumns]
    );

    const table = useReactTable({
        data: filteredRows,
        columns,
        columnResizeMode: "onChange",
        state: {
            sorting,
            columnSizing,
        },
        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing, // Update state on resize
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // Default column definition (can be simpler now size is dynamic)
        defaultColumn: {
            minSize: 50,
            maxSize: 500,
        },
    });

    const { rows } = table.getRowModel(); // Use getRowModel() which respects sorting

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        estimateSize: () => 40,
        getScrollElement: () => tableContainerRef.current,
        measureElement: (element) => element.getBoundingClientRect().height,
        overscan: 5,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();

    if (loading) {
        return (
            <div className="loading-indicator">
                <div className="spinner"></div>
                finding results...
            </div>
        );
    }

    if (!loading && filteredRows.length === 0 && headers.length > 0) {
        return (
            <div className="message-indicator">
                No results found for your query.
            </div>
        );
    }

    if (headers.length === 0) {
        return (
            <div className="message-indicator">
                Load data using the options above.
            </div>
        );
    }

    return (
        <div ref={tableContainerRef} className="table-container">
            <table className="data-table">
                <thead className="table-header">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    style={{ width: header.getSize() }}
                                    // Add sticky class for the actions column header
                                    className={`table-header-cell ${
                                        header.id === "actions"
                                            ? "sticky-col"
                                            : ""
                                    }`}
                                    colSpan={header.colSpan}
                                >
                                    <div
                                        className={`header-content ${
                                            header.column.getCanSort()
                                                ? "cursor-pointer select-none"
                                                : ""
                                        }`} // Add cursor only if sortable
                                        onClick={
                                            header.column.getCanSort()
                                                ? header.column.getToggleSortingHandler()
                                                : undefined
                                        } // Only add onClick if sortable
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        <span className="sort-icon">
                                            {{
                                                asc: <ArrowUp size={16} />,
                                                desc: <ArrowDown size={16} />,
                                            }[
                                                header.column.getIsSorted() as string
                                            ] ??
                                                (header.column.getCanSort() ? (
                                                    <ChevronsUpDown size={16} />
                                                ) : null)}
                                        </span>
                                    </div>
                                    {/* Resize Handle */}
                                    <div
                                        onMouseDown={header.getResizeHandler()}
                                        onTouchStart={header.getResizeHandler()}
                                        className={`resizer ${
                                            header.column.getIsResizing()
                                                ? "isResizing"
                                                : ""
                                        }`}
                                    >
                                        {/* Only show resizer if resizing is enabled */}
                                        {header.column.getCanResize() && (
                                            <GripVertical size={18} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody
                    className="table-body"
                    style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                >
                    {virtualRows.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        const rowRef = rowVirtualizer.measureElement;
                        return (
                            <tr
                                key={row.id}
                                data-index={virtualRow.index}
                                ref={rowRef}
                                className={`table-row ${
                                    virtualRow.index % 2 ? "odd" : "even"
                                }`}
                                style={{
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        style={{ width: cell.column.getSize() }}
                                        // Add sticky class for the actions column cell
                                        className={`table-cell ${
                                            cell.column.id === "actions"
                                                ? "sticky-col"
                                                : ""
                                        }`}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
