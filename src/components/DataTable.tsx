"use client";

import React, { Fragment } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  Row,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  isLoading?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  renderSubComponent,
  getRowCanExpand,
  isLoading,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
  });

  return (
    <div className="w-full overflow-hidden bg-slate-card border border-white/5 rounded-2xl shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-navy/50 border-b border-white/10">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-4 text-[10px] font-black uppercase text-gold tracking-widest"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/5">
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <tr 
                  className={`group transition-all hover:bg-white/[0.03] cursor-pointer ${
                    row.getIsExpanded() ? 'bg-white/[0.05]' : ''
                  }`}
                  onClick={() => row.getCanExpand() && row.toggleExpanded()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && renderSubComponent && (
                  <tr>
                    <td colSpan={row.getVisibleCells().length}>
                      <div className="bg-navy/40 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                        {renderSubComponent({ row })}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && !isLoading && (
        <div className="py-12 text-center text-slate-500 text-sm">
          Nenhum dado encontrado.
        </div>
      )}
    </div>
  );
}
