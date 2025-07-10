export interface ResponseInterface<T> {
  status: 'success' | 'error';
  isSuccessful: boolean;
  message: string;
  data: T;
}

export interface BackendResponseInterface<T> {
  data: T;
  message: string;
  statusCode: number;
}
