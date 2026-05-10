import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { singleUpload, multipleUpload } from '../../../middlewares/upload.middleware';
import { asyncHandler } from '../../../middlewares/error.middleware';
import { ApiResponse } from '../../../common/responses';
import { v2 as cloudinary } from 'cloudinary';
import db from '../../../config/db';
import { uploadedFiles } from '../../../db/schema';
import { z } from 'zod';
import { validateBody } from '../../../middlewares/validate.middleware';

const router = Router();
router.use(authMiddleware);

// POST /api/v1/uploads/single
router.post('/single', singleUpload('file'), asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json(ApiResponse.error('No file uploaded', 'NO_FILE'));

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `rangrej-fleet/${req.user!.userId}`, resource_type: 'auto' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(file.buffer);
  });

  const uploadData = result as any;

  const [fileRecord] = await db.insert(uploadedFiles).values({
    userId: req.user!.userId,
    url: uploadData.secure_url,
    publicId: uploadData.public_id,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: String(file.size),
    folder: `rangrej-fleet/${req.user!.userId}`,
  }).returning();

  res.status(201).json(ApiResponse.success('File uploaded', fileRecord));
}));

// POST /api/v1/uploads/multiple
router.post('/multiple', multipleUpload('files', 5), asyncHandler(async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) return res.status(400).json(ApiResponse.error('No files uploaded', 'NO_FILES'));

  const uploadResults = await Promise.all(
    files.map((file) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: `rangrej-fleet/${req.user!.userId}`, resource_type: 'auto' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(file.buffer);
      })
    )
  );

  const fileRecords = await Promise.all(
    (uploadResults as any[]).map((uploadData, i) =>
      db.insert(uploadedFiles).values({
        userId: req.user!.userId,
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
        originalName: files[i].originalname,
        mimeType: files[i].mimetype,
        size: String(files[i].size),
        folder: `rangrej-fleet/${req.user!.userId}`,
      }).returning()
    )
  );

  res.status(201).json(ApiResponse.success('Files uploaded', fileRecords.map((r) => r[0])));
}));

// DELETE /api/v1/uploads/:publicId
router.delete('/:publicId', asyncHandler(async (req, res) => {
  const publicId = decodeURIComponent(req.params.publicId);

  await cloudinary.uploader.destroy(publicId);

  res.json(ApiResponse.success('File deleted', null));
}));

export default router;
