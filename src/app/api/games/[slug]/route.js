/**
 * @swagger
 * /api/games/{slug}:
 *   get:
 *     summary: Получить игру по slug
 *     description: Возвращает детальную информацию об игре по её slug
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор игры
 *         example: the-last-of-us-part-2
 *     responses:
 *       200:
 *         description: Игра успешно найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 game:
 *                   $ref: '#/components/schemas/Game'
 *       404:
 *         description: Игра не найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Игра не найдена
 *       500:
 *         description: Ошибка сервера
 */
export { getGameBySlug as GET } from "../../controllers/gameController";
