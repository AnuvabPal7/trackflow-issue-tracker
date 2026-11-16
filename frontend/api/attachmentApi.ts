import { axiosClient } from './axiosClient';
import { Attachment } from '../types';

export const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';

export interface FileUploadPayload {
  name: string;
  size: string;
  url: string;
  type: 'image' | 'log' | 'doc';
  rawFile?: File;
}

export const attachmentApi = {
  uploadAttachment: async (
    issueId: string,
    fileInfo: FileUploadPayload,
    uploaderName: string
  ): Promise<Attachment> => {
    if (isMockMode) {
      return {
        id: `att-${Date.now()}`,
        name: fileInfo.name,
        size: fileInfo.size,
        url: fileInfo.url,
        type: fileInfo.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: uploaderName,
      };
    }

    const formData = new FormData();
    if (fileInfo.rawFile) {
      formData.append('file', fileInfo.rawFile, fileInfo.name);
    } else if (fileInfo.url.startsWith('data:')) {
      const res = await fetch(fileInfo.url);
      const blob = await res.blob();
      formData.append('file', blob, fileInfo.name);
    }

    const response = await axiosClient.post<Attachment>(`/issues/${issueId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAttachment: async (issueId: string, attachmentId: string): Promise<void> => {
    if (isMockMode) {
      return;
    }
    await axiosClient.delete(`/issues/${issueId}/attachments/${attachmentId}`);
  },
};

