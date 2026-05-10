/**
 * @swagger
 * tags:
 *   name: Company Earnings
 *   description: Company-level earnings management
 */

/**
 * @swagger
 * /company-earnings:
 *   post:
 *     summary: Save company earnings for a week
 *     tags: [Company Earnings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [week_start_date, week_end_date, total_company_earning]
 *             properties:
 *               week_start_date:
 *                 type: string
 *                 format: date
 *               week_end_date:
 *                 type: string
 *                 format: date
 *               total_company_earning:
 *                 type: number
 *     responses:
 *       201:
 *         description: Company earnings saved
 *       409:
 *         description: Earnings already exist for this week
 */

/**
 * @swagger
 * /company-earnings:
 *   get:
 *     summary: List company earnings (paginated)
 *     tags: [Company Earnings]
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
 *     responses:
 *       200:
 *         description: Paginated company earnings
 */

/**
 * @swagger
 * /company-earnings/week:
 *   get:
 *     summary: Get current week company earnings
 *     tags: [Company Earnings]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Week company earnings
 */

/**
 * @swagger
 * /company-earnings/analytics:
 *   get:
 *     summary: Company earnings analytics
 *     tags: [Company Earnings]
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema:
 *           type: integer
 *           default: 8
 *     responses:
 *       200:
 *         description: Bar chart analytics data
 */
