import fs from 'fs/promises';
import path from 'path';

export async function createDirectories() {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const outputDir = process.env.OUTPUT_DIR || './output';
  
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log('✓ Directories created');
}

export async function deleteFile(filePath: string) {
  try {
    await fs.unlink(filePath);
    console.log(`✓ File deleted: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
}

export async function cleanupOldFiles(directory: string, maxAgeHours: number = 24) {
  const files = await fs.readdir(directory);
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = await fs.stat(filePath);
    
    if (now - stats.mtimeMs > maxAge) {
      await deleteFile(filePath);
    }
  }
}
