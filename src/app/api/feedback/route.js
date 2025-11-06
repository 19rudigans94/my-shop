/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Отправить обратную связь
 *     description: Отправляет сообщение обратной связи на email администратора
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Имя отправителя
 *                 example: Иван Иванов
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email отправителя
 *                 example: ivan@example.com
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Текст сообщения
 *                 example: Хочу узнать о наличии игры...
 *     responses:
 *       200:
 *         description: Сообщение успешно отправлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Сообщение успешно отправлено
 *       400:
 *         description: Некорректные данные
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Некорректный email
 *       405:
 *         description: Метод не поддерживается
 *       500:
 *         description: Ошибка сервера
 */
export { sendFeedback as POST } from "../controllers/feedbackController";
