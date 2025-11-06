/**
 * @swagger
 * /api/accessories:
 *   get:
 *     summary: Получить список аксессуаров с пагинацией
 *     description: Возвращает список аксессуаров с поддержкой пагинации и фильтрации
 *     tags: [Accessories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Количество элементов на странице
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Фильтр по платформе
 *     responses:
 *       200:
 *         description: Успешный ответ со списком аксессуаров
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
/**
 * @swagger
 * /api/accessories:
 *   post:
 *     summary: Создать новый аксессуар
 *     description: Добавляет новый аксессуар в базу данных с автоматической генерацией slug
 *     tags: [Accessories]
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
 *                 description: Название аксессуара
 *               platform:
 *                 type: string
 *                 description: Платформа (например, PS5, Xbox)
 *               price:
 *                 type: number
 *                 description: Цена аксессуара
 *               description:
 *                 type: string
 *                 description: Описание аксессуара
 *               image:
 *                 type: string
 *                 description: URL изображения
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *     responses:
 *       201:
 *         description: Аксессуар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessory:
 *                   $ref: '#/components/schemas/Accessory'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 */
export {
  getAccessoriesWithPagination as GET,
  createAccessory as POST,
} from "../controllers/accessoryController";
