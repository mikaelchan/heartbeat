import axios from 'axios';

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axios.post<UploadResult>('/api/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return data;
};
