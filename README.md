This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

// Здесь будет запрос к БД для получения данных игры по params.id
const gameData = {
id: params.id,
title: "God of War Ragnarök",
platform: "PS5",
price: 4499,
releaseDate: "9 ноября 2022",
developer: "Santa Monica Studio",
publisher: "Sony Interactive Entertainment",
genre: ["Экшен", "Приключения"],
description: `God of War Ragnarök — это продолжение истории Кратоса и Атрея в скандинавском мире. 
    После событий предыдущей части отец и сын должны предотвратить наступление Рагнарёка - 
    гибели богов и девяти миров. В пути их ждут эпические сражения с богами и монстрами 
    скандинавской мифологии, а также непростые решения, от которых зависит судьба всех девяти миров.`,
features: [
"Продолжение культовой серии God of War",
"Улучшенная боевая система",
"Исследование всех девяти миров",
"Поддержка особенностей DualSense",
"Графика нового поколения",
],
youtubeReview: "https://www.youtube.com/embed/EE-4GvjKcfs",
images: ["/games/gow-1.jpg", "/games/gow-2.jpg", "/games/gow-3.jpg"],
};
