
/**
 * @swagger
 * /api/protected/accessories:
 *   get:
 *     summary: Получить список аксессуаров (защищенный)
 *     description: Получает полный список аксессуаров из базы данных. Требует авторизации.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список аксессуаров успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Accessory'
 *       500:
 *         description: Ошибка сервера
 */
export { getAllAccessoriesProtected as GET, createAccessoryProtected as POST } from "../../controllers/accessoryController";

/**
 * @swagger
 * /api/protected/accessories:
 *   post:
 *     summary: Создать новый аксессуар (защищенный)
 *     description: Создает новый аксессуар в базе данных. Требует авторизации.
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
 *               - platform
 *               - price
 *               - description
 *               - image
 *               - stock
 *             properties:
 *               title:
 *                 type: string
 *               platform:
 *                 type: string
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
 *         description: Аксессуар успешно создан
 *       500:
 *         description: Ошибка сервера
 */
