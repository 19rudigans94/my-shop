import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DigitalCopy from "@/models/DigitalCopy";
import Game from "@/models/Game";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameTitle = searchParams.get("title") || "detroit-become-human";
    const platform = searchParams.get("platform") || "PS5";

    await connectDB();

    console.log("🔍 Отладка поиска цифровых копий:", { gameTitle, platform });

    // 1. Показываем все игры в базе
    const allGames = await Game.find({}).select("_id title slug platforms");
    console.log("🎮 Все игры в базе:", allGames);

    // 2. Показываем все цифровые копии
    const allDigitalCopies = await DigitalCopy.find({}).populate(
      "gameId",
      "title slug"
    );
    console.log(
      "💾 Все цифровые копии:",
      allDigitalCopies.map((copy) => ({
        _id: copy._id,
        gameId: copy.gameId,
        gameTitle: copy.gameId?.title,
        platform: copy.platform,
        price: copy.price,
        credentialsCount: copy.credentials?.length || 0,
        activeCredentials:
          copy.credentials?.filter((cred) => cred.isActive).length || 0,
      }))
    );

    // 3. Пробуем найти игру по названию
    const gameByTitle = await Game.findOne({
      $or: [
        { title: gameTitle },
        {
          title: new RegExp(
            gameTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i"
          ),
        },
        { slug: gameTitle.toLowerCase().replace(/\s+/g, "-") },
      ],
    });

    console.log("🎯 Найдена игра по названию:", gameByTitle);

    // 4. Если игра найдена, ищем её цифровые копии
    let digitalCopiesForGame = [];
    if (gameByTitle) {
      digitalCopiesForGame = await DigitalCopy.find({
        gameId: gameByTitle._id,
        platform: platform,
        isActive: true,
      });

      console.log(
        "🔑 Цифровые копии для найденной игры:",
        digitalCopiesForGame.map((copy) => ({
          _id: copy._id,
          gameId: copy.gameId,
          platform: copy.platform,
          price: copy.price,
          credentialsCount: copy.credentials?.length || 0,
          activeCredentials:
            copy.credentials?.filter((cred) => cred.isActive).length || 0,
        }))
      );
    }

    // 5. Пробуем прямой поиск по платформе
    const digitalCopiesByPlatform = await DigitalCopy.find({
      platform: platform,
      isActive: true,
    }).populate("gameId", "title slug");

    console.log(
      "🎮 Все цифровые копии для платформы:",
      digitalCopiesByPlatform.map((copy) => ({
        _id: copy._id,
        gameTitle: copy.gameId?.title,
        gameSlug: copy.gameId?.slug,
        platform: copy.platform,
        price: copy.price,
        credentialsCount: copy.credentials?.length || 0,
      }))
    );

    return NextResponse.json({
      success: true,
      debug: {
        searchParams: { gameTitle, platform },
        allGamesCount: allGames.length,
        allDigitalCopiesCount: allDigitalCopies.length,
        gameFound: !!gameByTitle,
        gameFoundDetails: gameByTitle
          ? {
              _id: gameByTitle._id,
              title: gameByTitle.title,
              slug: gameByTitle.slug,
            }
          : null,
        digitalCopiesForGameCount: digitalCopiesForGame.length,
        digitalCopiesByPlatformCount: digitalCopiesByPlatform.length,
      },
      data: {
        allGames: allGames.slice(0, 5), // Первые 5 игр для примера
        allDigitalCopies: allDigitalCopies.map((copy) => ({
          _id: copy._id,
          gameTitle: copy.gameId?.title,
          platform: copy.platform,
          price: copy.price,
          credentialsCount: copy.credentials?.length || 0,
        })),
        gameByTitle,
        digitalCopiesForGame,
        digitalCopiesByPlatform: digitalCopiesByPlatform.map((copy) => ({
          _id: copy._id,
          gameTitle: copy.gameId?.title,
          platform: copy.platform,
          price: copy.price,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Ошибка отладки:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
