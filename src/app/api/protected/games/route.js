
/**
 * @swagger
 * /api/protected/games:
 *   get:
 *     summary: Получить список игр (защищенный)
 *     description: Получает полный список игр из базы данных. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список игр успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 games:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       500:
 *         description: Ошибка сервера
 */
export { getAllGamesProtected as GET, createGameProtected as POST } from "../../controllers/gameController";

/**
 * @swagger
 * /api/protected/games:
 *   post:
 *     summary: Создать новую игру (защищенный)
 *     description: Создает новую игру в базе данных и автоматически создает физические диски для всех платформ. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - platforms
 *               - description
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["PS5", "PS4", "PC"]
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Игра успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 game:
 *                   $ref: '#/components/schemas/Game'
 *                 physicalDisks:
 *                   type: array
 *       500:
 *         description: Ошибка сервера
 */
