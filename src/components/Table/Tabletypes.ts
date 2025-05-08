import type { ColumnDef } from '@tanstack/svelte-table';
import type { SortingState } from '@tanstack/table-core';

export interface TableProps<T> {
  columns: ColumnDef<T, any>[];
  fetchData: (options: TableFetchOptions) => Promise<TableFetchResponse<T>>;
  initialPageSize?: number;
  initialPageIndex?: number;
  initialSearchTerm?: string;
  isLoading?: boolean;
  customLoading?: boolean;
  loadingComponent?: any;
  emptyStateComponent?: any;
  rowClassName?: string;
  cellClassName?: string;
  headerClassName?: string;
  containerClassName?: string;
  showSearch?: boolean;
  showPagination?: boolean;
}

export interface TableFetchOptions {
  pagination: { pageIndex: number; pageSize: number };
  filters: { searchTerm: string };
  sorting: SortingState;
}

export interface TableFetchResponse<T> {
  data: T[];
  totalItems: number;
  pageCount: number;
}
