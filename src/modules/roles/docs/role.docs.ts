/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List all roles with permissions
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: List of roles and their permissions
 */

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role details with permissions
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Role details
 *       404:
 *         description: Role not found
 */

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: System permissions
 */

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: List all system permissions
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: List of all permissions
 */

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Application health checks
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check application and database health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health status with uptime and database check
 */
