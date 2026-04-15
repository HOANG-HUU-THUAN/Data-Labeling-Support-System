import axiosInstance from './axios';
import type { ReviewResponse, ReviewRequest } from '../types/review';

export const submitReview = async (request: ReviewRequest): Promise<ReviewResponse> => {
  const response = await axiosInstance.post('/v1/reviews', request);
  return response.data.data;
};
