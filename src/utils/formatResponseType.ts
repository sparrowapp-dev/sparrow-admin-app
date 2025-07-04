import { ResponseInterface } from '@/interface/HttpClient';

export const errorResponse = (error: string, data?: any): ResponseInterface<any> => {
  return {
    status: 'error',
    isSuccessful: false,
    message: error,
    data,
  };
};

export const successResponse = (data: any): ResponseInterface<any> => {
  return {
    status: 'success',
    isSuccessful: true,
    message: '',
    data,
  };
};
