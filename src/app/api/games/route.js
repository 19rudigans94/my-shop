/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Получить список всех игр
 *     description: Возвращает массив всех игр из базы данных
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Успешный ответ со списком игр
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export {
  getAllGames as GET,
  createGame as POST,
} from "../controllers/gameController";
