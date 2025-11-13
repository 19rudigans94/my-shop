
/**
 * @swagger
 * /api/protected/consoles:
 *   get:
 *     summary: Получить список консолей (защищенный)
 *     description: Получает полный список консолей из базы данных. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список консолей успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 consoles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Console'
 *       500:
 *         description: Ошибка сервера
 */
/**
 * @swagger
 * /api/protected/consoles:
 *   post:
 *     summary: Создать новую консоль (защищенный)
 *     description: Создает новую консоль в базе данных. Требует авторизации.
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
 *               - state
 *               - price
 *               - description
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               state:
 *                 type: string
 *                 enum: [new, used]
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Консоль успешно создана
 *       500:
 *         description: Ошибка сервера
 */
export { getAllConsolesProtected as GET, createConsoleProtected as POST } from "../../controllers/consoleController";
