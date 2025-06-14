import { z } from 'zod';

export const CreateFolderFormSchema = z.object({
  folderName: z
    .string()
    .describe('Folder Name')
    .min(1, 'Folder name must be min of 1 character'),
  logo: z.any(),
});