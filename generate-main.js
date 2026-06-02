export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    product = "",
    sellingPoints = "",
    points = "",
    ratio = "1:1",
    imageType = "white background main image",
    referenceImage = "",
  } = req.body || {};

  const cleanProduct = String(product).trim();
  const cleanPoints = String(sellingPoints || points).trim();
  const hasReferenceImage = typeof referenceImage === "string" && referenceImage.startsWith("data:image/");

  if (!cleanProduct) {
    return res.status(400).json({ error: "请先填写产品名称。" });
  }

  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ARK_API_KEY is not configured on Vercel." });
  }

  const sizeMap = {
    "1:1": "1024x1024",
    "4:3": "1536x1024",
    "16:9": "1536x864",
  };

  const prompt = hasReferenceImage
    ? [
        "严格保持原产品主体、形状、颜色、材质、角度不变，只清理背景、增强清晰度、提亮、增加自然阴影，输出纯白底电商主图。",
        `产品名称：${cleanProduct}`,
        `图片类型：${imageType}`,
        `核心卖点：${cleanPoints || "高品质、结构清晰、适合电商展示"}`,
        "不要添加文字、logo、水印、标签、装饰物、场景道具或新的产品部件。",
      ].join("\n")
    : [
        "生成一张专业亚马逊电商产品白底主图。",
        `图片类型：${imageType}`,
        `产品名称：${cleanProduct}`,
        `核心卖点：${cleanPoints || "高品质、结构清晰、突出购买理由"}`,
        `画幅比例：${ratio}`,
        "风格：真实商业摄影，纯白背景，产品居中，干净布光，细节清晰，高级但真实。",
        "不要品牌 logo，不要水印，不要乱码文字，不要侵权标识，不要夸张变形。",
      ].join("\n");

  const requestBody = {
    model: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-260128",
    prompt,
    size: sizeMap[ratio] || "1024x1024",
    response_format: "b64_json",
    watermark: false,
  };

  if (hasReferenceImage) {
    requestBody.image = referenceImage;
  }

  try {
    const aiRes = await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await aiRes.json().catch(() => ({}));

    if (!aiRes.ok) {
      return res.status(aiRes.status).json({
        error: data.error?.message || data.message || "Seedream image generation failed.",
        code: data.error?.code || data.code,
      });
    }

    const image = data.data?.[0] || data.output?.results?.[0] || {};
    const imageUrl = image.b64_json
      ? `data:image/png;base64,${image.b64_json}`
      : image.url || image.image_url;

    if (!imageUrl) {
      return res.status(500).json({ error: "Seedream did not return an image.", details: data });
    }

    if (imageUrl.startsWith("data:image/")) {
      return res.status(200).json({ imageUrl, provider: "volcengine", model: requestBody.model });
    }

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return res.status(500).json({ error: "Failed to download Seedream image." });
    }

    const contentType = imageRes.headers.get("content-type") || "image/png";
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const base64ImageUrl = `data:${contentType};base64,${imageBuffer.toString("base64")}`;

    return res.status(200).json({ imageUrl: base64ImageUrl, provider: "volcengine", model: requestBody.model });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Server failed to request Seedream.",
    });
  }
}
