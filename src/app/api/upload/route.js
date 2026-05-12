import { processUploadImage } from "@/utils/imageProcessor";

const ALLOWED_CATEGORIES = ["accessories", "consoles", "games"];

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "misc";

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Неверная категория изображения",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const alt = String(formData.get("alt") || "");

    if (!file || file.size === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Файл не передан" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const imageData = await processUploadImage(file, category, alt);

    return new Response(
      JSON.stringify({ success: true, image: imageData }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ошибка при загрузке изображения:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Ошибка загрузки изображения" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
