
/**
 * @swagger
 * /api/paylink:
 *   post:
 *     summary: Создать платежную ссылку
 *     description: Создает платежную ссылку PayLink для оплаты заказа и сохраняет заказ в БД
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartData
 *             properties:
 *               cartData:
 *                 type: object
 *                 properties:
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         price:
 *                           type: number
 *                         quantity:
 *                           type: integer
 *                         category:
 *                           type: string
 *                         platform:
 *                           type: string
 *                         image:
 *                           type: string
 *                   totalPrice:
 *                     type: number
 *                   totalItems:
 *                     type: integer
 *                   contactData:
 *                     type: object
 *                     properties:
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *     responses:
 *       200:
 *         description: Платежная ссылка успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                       description: Уникальный идентификатор платежа
 *                     link:
 *                       type: string
 *                       description: Ссылка для оплаты
 *       500:
 *         description: Ошибка сервера
 */
export { createPayLink as POST } from "../controllers/payLinkController";
