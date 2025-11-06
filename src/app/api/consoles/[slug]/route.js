/**
 * @swagger
 * /api/consoles/{slug}:
 *   get:
 *     summary: Получить консоль по slug
 *     description: Возвращает детальную информацию о консоли по её slug
 *     tags: [Consoles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор консоли
 *         example: playstation-5
 *     responses:
 *       200:
 *         description: Консоль успешно найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 console:
 *                   $ref: '#/components/schemas/Console'
 *       400:
 *         description: Не указан slug
 *       404:
 *         description: Консоль не найдена
 *       500:
 *         description: Ошибка сервера
 */
export { getConsoleBySlug as GET } from "../../controllers/consoleController";
