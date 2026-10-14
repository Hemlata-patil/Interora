import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { AppError } from '../middleware/errorHandler';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_EXTRACTED_CHARACTERS = 15000;
const MIN_EXTRACTED_CHARACTERS = 30;

/**
 * Resolves the absolute directory path where uploaded resumes are stored,
 * supporting execution from either the workspace root or the backend directory.
 */
export function getResumesDirectory(): string {
  const candidates = [
    path.resolve(process.cwd(), 'uploads', 'resumes'),
    path.resolve(process.cwd(), 'backend', 'uploads', 'resumes'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  // Fall back to standard backend/uploads/resumes or create if missing
  const defaultDir = candidates[0];
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  return defaultDir;
}

/**
 * Validates and securely resolves a resume file path to prevent directory traversal.
 * Ensures the resolved target strictly resides inside the allowed resume storage folder.
 */
export function validateAndResolveResumePath(resumeUrlOrFilename: string): string {
  if (!resumeUrlOrFilename || typeof resumeUrlOrFilename !== 'string') {
    throw new AppError(400, 'Invalid resume file reference');
  }

  // Reject path traversal attempts immediately
  if (
    resumeUrlOrFilename.includes('..') ||
    resumeUrlOrFilename.includes('%2e%2e') ||
    resumeUrlOrFilename.includes('%2E%2E')
  ) {
    throw new AppError(400, 'Path traversal detected in resume file path');
  }

  // Extract base filename only to prevent directory escaping
  const baseFilename = path.basename(resumeUrlOrFilename);
  if (!baseFilename || baseFilename.trim() === '') {
    throw new AppError(400, 'Invalid resume filename provided');
  }

  const resumesDirectory = getResumesDirectory();
  const targetPath = path.resolve(resumesDirectory, baseFilename);

  // Strict boundary check: target must be within resumesDirectory
  if (!targetPath.startsWith(resumesDirectory)) {
    throw new AppError(400, 'Access denied: File location is outside the allowed resume storage');
  }

  if (!fs.existsSync(targetPath)) {
    throw new AppError(404, 'Uploaded resume file was not found on the server. Please re-upload your resume PDF.');
  }

  return targetPath;
}

/**
 * Extracts plain text from a verified PDF file with integrity and format checks.
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_PDF_SIZE_BYTES) {
    throw new AppError(400, 'Resume file size exceeds the 10MB limit');
  }

  const buffer = fs.readFileSync(filePath);

  // Validate PDF magic bytes header: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (buffer.length < 5 || buffer.toString('utf8', 0, 5) !== '%PDF-') {
    throw new AppError(400, 'Invalid file format: File header does not match a valid PDF document');
  }

  let extractedRaw = '';
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    extractedRaw = result?.text ?? '';
  } catch (err: any) {
    const message = err?.message || 'Failed to process PDF structure';
    throw new AppError(400, `Could not parse PDF document: ${message}`);
  }

  // Clean and normalize whitespace
  const cleanedText = extractedRaw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  // Scanned / Image-only PDF detection
  const alphanumericCount = (cleanedText.match(/[a-zA-Z0-9]/g) || []).length;
  if (alphanumericCount < MIN_EXTRACTED_CHARACTERS) {
    throw new AppError(
      400,
      'The uploaded resume contains no extractable text. Scanned or image-only PDFs are not supported. Please upload a standard text-based PDF resume.'
    );
  }

  // Budget truncation to avoid prompt injection or context window saturation
  if (cleanedText.length > MAX_EXTRACTED_CHARACTERS) {
    return cleanedText.substring(0, MAX_EXTRACTED_CHARACTERS);
  }

  return cleanedText;
}
