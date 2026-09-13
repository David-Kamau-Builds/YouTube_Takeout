import { useState, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col">
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 flex justify-between items-center">
        <span>Showing <strong>{rows.length}</strong> records (virtualized)</span>
      </div>

      <div
        ref={tableContainerRef}
        className="overflow-auto max-h-[650px] relative"
      >
        <table className="w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 shadow-xs block">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex items-center border-b border-slate-200 dark:border-slate-800">
                {headerGroup.headers.map((header) => {
                  const style = getStyle(header.column.columnDef);
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-4 py-3 font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider select-none shrink-0 ${header.column.getCanSort() ? 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700' : ''
                        }`}
                      style={style}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="w-3.5 h-3.5 text-red-500 shrink-0" />,
                          desc: <ChevronDown className="w-3.5 h-3.5 text-red-500 shrink-0" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
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
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors flex items-center"
                >
                  {row.getVisibleCells().map((cell) => {
                    const style = getStyle(cell.column.columnDef);
                    return (
                      <td
                        key={cell.id}
                        className="px-4 py-2.5 text-slate-800 dark:text-slate-200 truncate shrink-0 min-w-0"
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
        </table>
      </div>
    </div>
  );
}
