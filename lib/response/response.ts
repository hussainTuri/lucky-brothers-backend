import { Response } from '../../types';

export const response = () => {
  return {
    success: true,
    message: '',
    data: null,
  } as Response;
};
