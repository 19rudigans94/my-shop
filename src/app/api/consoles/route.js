/**
 * @swagger
 * /api/consoles:
 *   get:
 *     summary: Получить список всех консолей
 *     description: Возвращает массив всех консолей из базы данных
 *     tags: [Consoles]
 *     responses:
 *       200:
 *         description: Успешный ответ со списком консолей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Console'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/consoles:
 *   post:
 *     summary: Создать новую консоль
 *     description: Добавляет новую консоль в базу данных
 *     tags: [Consoles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Название консоли
 *               slug:
 *                 type: string
 *                 description: URL-friendly название
 *               description:
 *                 type: string
 *                 description: Описание консоли
 *               price:
 *                 type: number
 *                 description: Цена консоли
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив URL изображений
 *     responses:
 *       201:
 *         description: Консоль успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Console'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export {
  getAllConsoles as GET,
  createConsole as POST,
} from "../controllers/consoleController";
