/**
 * @swagger
 * /api/accessories/{slug}:
 *   get:
 *     summary: Получить аксессуар по slug
 *     description: Возвращает детальную информацию об аксессуаре по его slug
 *     tags: [Accessories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly идентификатор аксессуара
 *         example: dualsense-controller
 *     responses:
 *       200:
 *         description: Аксессуар успешно найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessory:
 *                   $ref: '#/components/schemas/Accessory'
 *       404:
 *         description: Аксессуар не найден
 *       500:
 *         description: Ошибка сервера
 */
export { getAccessoryBySlug as GET } from "../../controllers/accessoryController";
