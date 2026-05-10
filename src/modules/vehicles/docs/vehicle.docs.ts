/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management endpoints
 */

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Add a new vehicle
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [number]
 *             properties:
 *               number:
 *                 type: string
 *                 example: MH-01-AB-1234
 *     responses:
 *       201:
 *         description: Vehicle created
 *       409:
 *         description: Vehicle number already exists
 */

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: List vehicles (paginated)
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, MAINTENANCE]
 *     responses:
 *       200:
 *         description: Paginated vehicle list
 */

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */

/**
 * @swagger
 * /vehicles/{id}:
 *   patch:
 *     summary: Update vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE]
 *     responses:
 *       200:
 *         description: Vehicle updated
 */

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Soft-delete a vehicle
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehicle deleted
 */

/**
 * @swagger
 * /vehicles/{id}/status:
 *   patch:
 *     summary: Update vehicle status
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE]
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /vehicles/search:
 *   get:
 *     summary: Search vehicles by number
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
