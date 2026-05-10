/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Earnings analytics & rankings
 */

/**
 * @swagger
 * /analytics/overview:
 *   get:
 *     summary: Analytics overview (current vs previous week)
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Revenue comparison & change percentage
 */

/**
 * @swagger
 * /analytics/trend:
 *   get:
 *     summary: Earnings trend over weeks
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Weekly trend data for charts
 */

/**
 * @swagger
 * /analytics/driver-rankings:
 *   get:
 *     summary: Top drivers by earnings
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Ranked driver list
 */

/**
 * @swagger
 * /analytics/vehicle-stats:
 *   get:
 *     summary: Vehicle statistics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Vehicle status distribution
 */
