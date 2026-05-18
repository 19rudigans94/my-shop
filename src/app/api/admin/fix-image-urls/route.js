import { ensureDbConnection } from "@/app/utils/dbConnection";
import Game from "@/models/Game";
import Console from "@/models/Console";
import Accessory from "@/models/Accessory";

const BUCKET = "goldgames-assets";
const BASE_HOST = `${BUCKET}.object.pscloud.io`;

// Заменяет битый URL (без бакета в пути) на правильный
function fixUrl(url) {
  if (!url || typeof url !== "string") return url;
  // Уже правильный URL — не трогаем
  if (url.includes(`/${BUCKET}/`)) return url;
  // Исправляем: object.pscloud.io/path → object.pscloud.io/goldgames-assets/path
  return url.replace(
    new RegExp(`(https?://${BASE_HOST.replace(".", "\\.")})/(?!${BUCKET}/)`),
    `$1/${BUCKET}/`
  );
}

function fixImagesArray(images) {
  if (!Array.isArray(images)) return images;
  return images.map((img) => ({
    ...img,
    url: fixUrl(img.url),
    thumbUrl: fixUrl(img.thumbUrl),
  }));
}

async function migrateModel(Model) {
  const docs = await Model.find({}).lean();
  let updated = 0;

  for (const doc of docs) {
    const newImages = fixImagesArray(doc.images);
    const newImage = fixUrl(doc.image);

    const imagesChanged = JSON.stringify(newImages) !== JSON.stringify(doc.images);
    const imageChanged = newImage !== doc.image;

    if (imagesChanged || imageChanged) {
      const patch = {};
      if (imagesChanged) patch.images = newImages;
      if (imageChanged) patch.image = newImage;
      await Model.updateOne({ _id: doc._id }, { $set: patch });
      updated++;
    }
  }

  return updated;
}

export async function POST() {
  try {
    await ensureDbConnection();

    const [games, consoles, accessories] = await Promise.all([
      migrateModel(Game),
      migrateModel(Console),
      migrateModel(Accessory),
    ]);

    return Response.json({
      success: true,
      updated: { games, consoles, accessories, total: games + consoles + accessories },
    });
  } catch (error) {
    console.error("fix-image-urls error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
