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
        "产品精修，亚马逊主图风格，纯白背景，产品居中放大展示，主体占画面85%以上，专业摄影棚拍摄，高端商业摄影，超高清8K画质，真实材质还原，颜色精准还原，细节清晰锐利，边缘干净利落，去除灰尘瑕疵，去除划痕褶皱，增强产品立体感，优化高光与阴影，整体高级有质感，无水印，无文字，无图标，符合亚马逊主图规范，电商商业级精修效果。",
        "高级商业摄影质感，3D 软件渲染级精细度。",
        "背景改为纯白无缝背景，无杂色，边缘干净利落，方便后期抠图。",
        "光线采用柔和均匀布光，突出产品轮廓与材质细节，反光自然不刺眼。",
        "材质表现真实细腻，无噪点、无畸变、无眩光。",
        "整体画面高清锐利，色彩准确还原产品本身。",
        "严格保持原产品主体、形状、颜色、材质、角度、比例和边缘轮廓不变。",
        "只允许清理背景、增强清晰度、提亮、优化高光和真实质感。",
        "尽量无阴影或仅保留极弱自然接触阴影，不要大面积投影。",
        "绝对禁止添加任何文字、中文、英文、数字、标题、标签、logo、水印、图标、卖点文案、场景道具、包装、说明书或新物体。",
        "输出画面只能包含上传图中的原产品主体和纯白背景。",
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
    model: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-lite-260128",
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
