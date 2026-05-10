/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload & management
 */

/**
 * @swagger
 * /uploads/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file provided
 */

/**
 * @swagger
 * /uploads/multiple:
 *   post:
 *     summary: Upload multiple files (max 5)
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: No files provided
 */

/**
 * @swagger
 * /uploads/{id}:
 *   delete:
 *     summary: Delete an uploaded file
 *     tags: [Uploads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File deleted
 *       404:
 *         description: File not found
 */
