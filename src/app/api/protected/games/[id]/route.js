/**
 * @swagger
 * /api/protected/games/{id}:
 *   get:
 *     summary: Получить игру по ID (защищенный)
 *     description: Получает детальную информацию об игре по её ID. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID игры
 *     responses:
 *       200:
 *         description: Игра успешно найдена
 *       404:
 *         description: Игра не найдена
 *       500:
 *         description: Ошибка сервера
 */
export {
  getGameByIdProtected as GET,
  updateGameProtected as PUT,
  deleteGameProtected as DELETE,
} from "../../../controllers/gameController";

/**
 * @swagger
 * /api/protected/games/{id}:
 *   put:
 *     summary: Обновить игру (защищенный)
 *     description: Обновляет существующую игру. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Игра успешно обновлена
 *       404:
 *         description: Игра не найдена
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /api/protected/games/{id}:
 *   delete:
 *     summary: Удалить игру (защищенный)
 *     description: Удаляет игру из базы данных. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Игра успешно удалена
 *       404:
 *         description: Игра не найдена
 *       500:
 *         description: Ошибка сервера
 */
