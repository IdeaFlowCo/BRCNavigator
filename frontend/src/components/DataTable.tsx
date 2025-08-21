import React, { useMemo, useRef, useState, useCallback } from "react";
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

        // Simple mobile detection - just check viewport width
    const isMobileDevice = (): boolean => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth <= 768;
    };

        // Simple column sizing - use CSS for mobile, dynamic sizing for desktop
    const calculateInitialSize = useCallback((headerText: string, _totalColumns: number = 10): number => {
        const isMobile = isMobileDevice();

        if (isMobile) {
            // On mobile, use minimum readable width - CSS will handle the rest
            return headerText === "Description" ? 120 : 100;
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
    }, []); // Empty dependency array since it only depends on window properties

    // Define the Actions column separately
    const actionsColumn: ColumnDef<string[]> = useMemo(
        () => {
            const isMobile = isMobileDevice(); // Use reliable mobile detection
            const columnSize = isMobile ? 60 : 60; // Same size, CSS will handle mobile positioning

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
        const isMobile = isMobileDevice(); // Use reliable mobile detection

        return headers.map((header, index) => ({
            id: String(index), // Keep original index as ID for data columns
            header: header,
            accessorFn: (row) => row[index], // Accessor remains the same
            size: calculateInitialSize(header, headers.length),
            minSize: isMobile ? 100 : 50, // Use 100px min width on mobile for readability
            maxSize: isMobile ? 200 : 500, // Reasonable max width on mobile
            // enableResizing: true // Default is true, no need to explicitly set unless overriding
        }));
        // Filter out the UID column if it exists and we don't want to display it
        // .filter((_, index) => index !== uidColumnIndex); // Optional: Hide UID column
    }, [headers, calculateInitialSize]); // Include calculateInitialSize dependency

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
            {/* Sticky header for mobile - positioned outside virtualized area */}
            {isMobileDevice() && (
                <div className="sticky-header-wrapper">
                    <table className="data-table sticky-header-table">
                        <thead className="table-header sticky-header">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            style={{ width: header.getSize() }}
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
                                                }`}
                                                onClick={
                                                    header.column.getCanSort()
                                                        ? header.column.getToggleSortingHandler()
                                                        : undefined
                                                }
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
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                    </table>
                </div>
            )}

            {/* Main table with virtualization */}
            <table className="data-table">
                {/* Desktop header - only show on desktop */}
                {!isMobileDevice() && (
                    <thead className="table-header">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        style={{ width: header.getSize() }}
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
                                            }`}
                                            onClick={
                                                header.column.getCanSort()
                                                    ? header.column.getToggleSortingHandler()
                                                    : undefined
                                            }
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
                                        <div
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className={`resizer ${
                                                header.column.getIsResizing()
                                                    ? "isResizing"
                                                    : ""
                                            }`}
                                        >
                                            {header.column.getCanResize() && (
                                                <GripVertical size={18} />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                )}

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
