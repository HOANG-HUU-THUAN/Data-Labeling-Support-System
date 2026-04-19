import axios from './axios';

export interface StorageStatus {
  usedBytes: number;
  limitBytes: number;
  usedPercentage: number;
  usedFormatted: string;
  limitFormatted: string;
  maxFileSizeMB: number;
  maxStoragePerProjectGB: number;
  allowedFileTypes: string[];
  maxFilesPerUpload: number;
}

export const systemConfigApi = {
  getStorageStatus: async () => {
    const response = await axios.get<any>('/v1/system-configs/storage-status');
    return response.data.data as StorageStatus;
  },
  updateConfig: async (key: string, value: string) => {
    const response = await axios.put(`/v1/system-configs/update-config`, null, {
      params: { key, value }
    });
    return response.data;
  },
  // Keep updateStorageLimit for backward compatibility if needed, or remove it
  updateStorageLimit: async (limitGb: number) => {
    return systemConfigApi.updateConfig('MAX_STORAGE_GB', limitGb.toString());
  }
};
