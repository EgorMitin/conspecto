import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export type UploadFileResult =
  | { success: true; url: string; error?: never }
  | { success: false; error: any; url?: never };

export async function uploadFile(file: File, path: string): Promise<UploadFileResult> {
  try {
    console.log('Uploading file:', file.name, 'to path:', path);

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { success: true, url };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error };
  }
}