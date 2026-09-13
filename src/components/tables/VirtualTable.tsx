import { useState, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronUp, ChevronDown, SearchX } from 'lucide-react';

interface VirtualTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  estimateRowHeight?: number;
}

export function VirtualTable<TData>({
  data,
  columns,
  estimateRowHeight = 52,
}: VirtualTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'time', desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 15,
  });

  const getStyle = (colDef: ColumnDef<TData, any>) => {
    const meta = colDef.meta as { flex?: string } | undefined;
    if (meta?.flex) {
      return { flex: meta.flex, minWidth: '120px' };
    }
    if (colDef.size) {
      return { width: `${colDef.size}px`, flex: `0 0 ${colDef.size}px` };
    }
    return { flex: '1 1 0%', minWidth: '150px' };
  };

  return (
    <div className="bg-white dark:bg-[#14161a] border border-black/6 dark:border-white/8 rounded-2xl overflow-hidden shadow-xs flex flex-col">
      <div className="px-4 py-2.5 bg-neutral-50/80 dark:bg-white/3 border-b border-black/6 dark:border-white/8 text-xs font-medium text-neutral-500 dark:text-neutral-400 flex justify-between items-center">
        <span>
          Showing <strong className="tabular-nums text-neutral-800 dark:text-neutral-200">{rows.length.toLocaleString()}</strong> records (virtualized)
        </span>
      </div>

      <div
        ref={tableContainerRef}
        className="overflow-auto max-h-[650px] relative"
      >
        <table className="w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-neutral-100/95 dark:bg-[#191b21]/95 backdrop-blur-xs shadow-2xs block">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex items-center border-b border-black/6 dark:border-white/8">
                {headerGroup.headers.map((header) => {
                  const style = getStyle(header.column.columnDef);
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-4 py-3 font-semibold text-xs text-neutral-600 dark:text-neutral-300 uppercase tracking-wider select-none shrink-0 ${
                        header.column.getCanSort() ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors' : ''
                      }`}
                      style={style}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />,
                          desc: <ChevronDown className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {rows.length === 0 ? (
            <tbody className="block">
              <tr>
                <td className="block py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <SearchX className="w-8 h-8 text-neutral-300 dark:text-neutral-600 stroke-[1.5]" />
                    <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200">
                      No matching records found
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Try adjusting your search terms or filter criteria
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
                display: 'block',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="hover:bg-neutral-50/80 dark:hover:bg-white/3 border-b border-black/4 dark:border-white/5 transition-colors flex items-center"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const style = getStyle(cell.column.columnDef);
                      return (
                        <td
                          key={cell.id}
                          className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200 truncate shrink-0 min-w-0"
                          style={style}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
