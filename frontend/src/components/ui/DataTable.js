import React from 'react';
import { cn } from '../../utils/cn';

const tableHeaderStyles = 'text-table-header font-medium tracking-tight';
const tableCellStyles = 'text-table-cell font-normal';

/**
 * DataTable primitive for grid-based tables.
 * @param {Array<{ key: string, label?: string, ariaLabel?: string, headerClassName?: string, cellClassName?: string, render?: (row: any) => React.ReactNode }>} columns
 * @param {Array<any>} data
 * @param {(row: any, index: number) => string|number} [getRowKey]
 * @param {(row: any) => void} [onRowClick]
 * @param {string} [gridTemplateClass]
 * @param {boolean} [stickyHeader=true]
 */
function DataTable({
  columns = [],
  data = [],
  getRowKey,
  onRowClick,
  gridTemplateClass,
  stickyHeader = true,
  className,
  headerClassName,
  rowClassName,
}) {
  const RowComponent = onRowClick ? 'button' : 'div';

  return (
    <div className={cn('overflow-x-auto font-sans', className)} role="grid">
      <div className="min-w-full">
        <div
          role="row"
          className={cn(
            'grid gap-x-1.5 font-sans bg-background border-b border-border',
            stickyHeader && 'sticky top-0 z-sticky',
            gridTemplateClass,
            headerClassName
          )}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              role="columnheader"
              className={cn(
                tableHeaderStyles,
                'px-2 py-2 text-text-tertiary',
                column.headerClassName
              )}
              aria-label={column.ariaLabel || column.label || ''}
            >
              {column.label || null}
            </div>
          ))}
        </div>

        {data.map((row, index) => {
          const key = getRowKey ? getRowKey(row, index) : row?.id || row?._id || index;
          return (
            <RowComponent
              key={key}
              type={onRowClick ? 'button' : undefined}
              role="row"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'w-full grid gap-x-1.5 font-sans border-b border-border text-left',
                onRowClick && 'hover:bg-background-secondary/40 transition-colors',
                gridTemplateClass,
                rowClassName
              )}
            >
              {columns.map((column) => (
                <div
                  key={`${key}-${column.key}`}
                  role="gridcell"
                  className={cn(tableCellStyles, 'px-2 py-2', column.cellClassName)}
                >
                  {column.render ? column.render(row) : row?.[column.key]}
                </div>
              ))}
            </RowComponent>
          );
        })}
      </div>
    </div>
  );
}

export default DataTable;
