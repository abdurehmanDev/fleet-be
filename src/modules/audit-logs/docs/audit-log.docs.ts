/**
 * @swagger
 * tags:
 *   name: Audit Logs
 *   description: Audit trail for all actions
 */

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: List audit logs (paginated)
 *     tags: [Audit Logs]
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
 *           default: 20
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: entity_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated audit log list

 * /audit-log/{id}:
 *   get:
 *     summary: Get audit log detail
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Audit log detail
 *       404:
 *         description: Audit log not found
 */
