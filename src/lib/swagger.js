import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GoldGames API",
      version: "1.0.0",
      description: "API документация для интернет-магазина игр и аксессуаров",
      contact: {
        name: "API Support",
        email: "support@goldgames.kz",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://goldgames.kz",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Games",
        description: "Операции с играми",
      },
      {
        name: "Consoles",
        description: "Операции с консолями",
      },
      {
        name: "Accessories",
        description: "Операции с аксессуарами",
      },
      {
        name: "Admin",
        description: "Административные операции",
      },
      {
        name: "Orders",
        description: "Операции с заказами",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Введите JWT токен для авторизации",
        },
      },
      schemas: {
        Game: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Уникальный идентификатор игры",
            },
            title: {
              type: "string",
              description: "Название игры",
            },
            slug: {
              type: "string",
              description: "URL-friendly название",
            },
            description: {
              type: "string",
              description: "Описание игры",
            },
            price: {
              type: "number",
              description: "Цена игры",
            },
            category: {
              type: "string",
              description: "Категория игры",
            },
            images: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Массив URL изображений",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Дата создания",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Дата обновления",
            },
          },
        },
        Console: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Уникальный идентификатор консоли",
            },
            title: {
              type: "string",
              description: "Название консоли",
            },
            slug: {
              type: "string",
              description: "URL-friendly название",
            },
            description: {
              type: "string",
              description: "Описание консоли",
            },
            price: {
              type: "number",
              description: "Цена консоли",
            },
            images: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Массив URL изображений",
            },
          },
        },
        Accessory: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Уникальный идентификатор аксессуара",
            },
            title: {
              type: "string",
              description: "Название аксессуара",
            },
            slug: {
              type: "string",
              description: "URL-friendly название",
            },
            description: {
              type: "string",
              description: "Описание аксессуара",
            },
            price: {
              type: "number",
              description: "Цена аксессуара",
            },
            images: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Массив URL изображений",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Сообщение об ошибке",
            },
          },
        },
      },
    },
  },
  apis: ["./src/app/api/**/*.js"], // Путь к файлам с JSDoc комментариями
};

export const swaggerSpec = swaggerJsdoc(options);
