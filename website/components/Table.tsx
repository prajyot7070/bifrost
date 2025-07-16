
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyText?: string;
};

export function Table<T>({ data, columns, className, emptyText = "No data." }: TableProps<T>) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-md",
        className
      )}
    >
      <table className="min-w-full table-auto text-sm text-left text-zinc-300">
        <thead className="bg-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 whitespace-nowrap border-b border-zinc-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-zinc-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-zinc-800/40 transition-colors border-b border-zinc-800"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
