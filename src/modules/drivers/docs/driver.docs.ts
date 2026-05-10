/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: Driver CRUD, search & analytics
 */

/**
 * @swagger
 * /drivers:
 *   post:
 *     summary: Create a new driver
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, mobile]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rajesh Kumar
 *               mobile:
 *                 type: string
 *                 example: "+919876543210"
 *     responses:
 *       201:
 *         description: Driver created
 *       409:
 *         description: Driver with mobile already exists
 */

/**
 * @swagger
 * /drivers:
 *   get:
 *     summary: List drivers (paginated, searchable)
 *     tags: [Drivers]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated driver list
 */

/**
 * @swagger
 * /drivers/{id}:
 *   get:
 *     summary: Get driver by ID
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Driver details
 *       404:
 *         description: Driver not found
 */

/**
 * @swagger
 * /drivers/{id}:
 *   patch:
 *     summary: Update driver
 *     tags: [Drivers]
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
 *             properties:
 *               name:
 *                 type: string
 *               mobile:
 *                 type: string
 *     responses:
 *       200:
 *         description: Driver updated
 *       404:
 *         description: Driver not found
 */

/**
 * @swagger
 * /drivers/{id}:
 *   delete:
 *     summary: Soft-delete a driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Driver deleted
 *       404:
 *         description: Driver not found
 */

/**
 * @swagger
 * /drivers/search:
 *   get:
 *     summary: Search drivers by name or mobile
 *     tags: [Drivers]
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

/**
 * @swagger
 * /drivers/{id}/analytics:
 *   get:
 *     summary: Get driver earnings analytics
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Driver analytics with trend data
 *       404:
 *         description: Driver not found
 */
