/**
 * @swagger
 * tags:
 *   name: Weekly Earnings
 *   description: Driver weekly earnings management
 */

/**
 * @swagger
 * /weekly-earnings:
 *   post:
 *     summary: Save weekly earnings for a driver
 *     tags: [Weekly Earnings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driver_id, week_start_date, week_end_date, weekly_earning, cash, tax, toll, rent]
 *             properties:
 *               driver_id:
 *                 type: string
 *                 format: uuid
 *               week_start_date:
 *                 type: string
 *                 format: date
 *               week_end_date:
 *                 type: string
 *                 format: date
 *               weekly_earning:
 *                 type: number
 *               cash:
 *                 type: number
 *               tax:
 *                 type: number
 *               toll:
 *                 type: number
 *               rent:
 *                 type: number
 *               uber_subscription:
 *                 type: number
 *               adjustment:
 *                 type: number
 *               other:
 *                 type: number
 *     responses:
 *       201:
 *         description: Weekly earnings saved
 *       409:
 *         description: Earnings already exist for this week
 */

/**
 * @swagger
 * /weekly-earnings/{id}:
 *   patch:
 *     summary: Update weekly earnings
 *     tags: [Weekly Earnings]
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
 *               weekly_earning:
 *                 type: number
 *               cash:
 *                 type: number
 *               tax:
 *                 type: number
 *               toll:
 *                 type: number
 *               rent:
 *                 type: number
 *     responses:
 *       200:
 *         description: Weekly earnings updated
 */

/**
 * @swagger
 * /weekly-earnings:
 *   get:
 *     summary: List weekly earnings (paginated)
 *     tags: [Weekly Earnings]
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
 *         name: week_start_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Paginated earnings list
 */

/**
 * @swagger
 * /weekly-earnings/driver/{driverId}:
 *   get:
 *     summary: Get earnings by driver
 *     tags: [Weekly Earnings]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Driver earnings list
 */

/**
 * @swagger
 * /weekly-earnings/week:
 *   get:
 *     summary: Get current week earnings
 *     tags: [Weekly Earnings]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Week earnings data
 */

/**
 * @swagger
 * /weekly-earnings/analytics:
 *   get:
 *     summary: Earnings trend analytics
 *     tags: [Weekly Earnings]
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema:
 *           type: integer
 *           default: 8
 *     responses:
 *       200:
 *         description: Earnings trend chart data
 */

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
