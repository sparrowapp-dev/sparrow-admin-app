import type { ColumnDef } from '@tanstack/svelte-table';
import type { SortingState } from '@tanstack/table-core';

export interface TableProps {
  columns: ColumnDef<any, any>[];
  fetchData: (options: TableFetchOptions) => Promise<TableFetchResponse>;
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

export interface TableFetchResponse {
  data: any[];
  totalItems: number;
  pageCount?: number;
}
