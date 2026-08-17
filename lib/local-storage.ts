import fs from 'fs';
import path from 'path';

export interface StoredData {
  uploadedResumes: any[];
  generatedResumes: any[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'resumes.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function ensureDataFile(): StoredData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: StoredData = { uploadedResumes: [], generatedResumes: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) as StoredData;
  } catch (err) {
    console.error('Error reading local JSON database:', err);
    return { uploadedResumes: [], generatedResumes: [] };
  }
}

function writeDataFile(data: StoredData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local JSON database:', err);
  }
}

export function saveUploadedPdfBuffer(id: string, buffer: Buffer) {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    console.error('Error saving local PDF buffer:', err);
  }
}

export function getUploadedPdfBuffer(id: string): Buffer | null {
  try {
    const filePath = path.join(UPLOADS_DIR, `${id}.pdf`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    return null;
  } catch (err) {
    console.error('Error reading local PDF buffer:', err);
    return null;
  }
}

export function getLocalResumes(userId?: string): StoredData {
  const data = ensureDataFile();
  if (!userId || userId === 'anonymous') {
    return data;
  }
  return {
    uploadedResumes: data.uploadedResumes.filter((r) => r.userId === userId || !r.userId || r.userId === 'anonymous'),
    generatedResumes: data.generatedResumes.filter((r) => r.userId === userId || !r.userId || r.userId === 'anonymous'),
  };
}

export function saveLocalUploadedResume(record: any) {
  const data = ensureDataFile();
  // Avoid duplicates
  const existingIdx = data.uploadedResumes.findIndex((r) => r.id === record.id);
  if (existingIdx !== -1) {
    data.uploadedResumes[existingIdx] = record;
  } else {
    data.uploadedResumes.unshift(record);
  }
  writeDataFile(data);
}

export function saveLocalGeneratedResume(record: any) {
  const data = ensureDataFile();
  const existingIdx = data.generatedResumes.findIndex((r) => r.id === record.id);
  if (existingIdx !== -1) {
    data.generatedResumes[existingIdx] = record;
  } else {
    data.generatedResumes.unshift(record);
  }
  writeDataFile(data);
}
