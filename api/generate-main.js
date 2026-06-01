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
  } = req.body || {};

  const cleanProduct = String(product).trim();
  const cleanPoints = String(sellingPoints || points).trim();

  if (!cleanProduct) {
    return res.status(400).json({ error: "请先填写产品名称。" });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "DASHSCOPE_API_KEY is not configured on Vercel." });
  }

  const sizeMap = {
    "1:1": "1280*1280",
    "4:3": "1472*1104",
    "16:9": "1696*960",
  };

  const prompt = [
    "生成一张专业亚马逊电商产品图。",
    `图片类型：${imageType}`,
    `产品名称：${cleanProduct}`,
    `核心卖点：${cleanPoints || "高品质、结构清晰、突出购买理由"}`,
    `画幅比例：${ratio}`,
    "风格：真实商业摄影，干净布光，产品细节清晰，高级但真实。",
    "要求：不要品牌 logo，不要水印，不要乱码文字，不要夸张变形，不要侵权标识。",
  ].join("\n");

  try {
    const aiRes = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DASHSCOPE_IMAGE_MODEL || "wan2.6-t2i",
        input: {
          messages: [
            {
              role: "user",
              content: [{ text: prompt }],
            },
          ],
        },
        parameters: {
          size: sizeMap[ratio] || "1280*1280",
          n: 1,
        },
      }),
    });

    const data = await aiRes.json().catch(() => ({}));

    if (!aiRes.ok) {
      return res.status(aiRes.status).json({
        error: data.message || data.output?.message || "DashScope image generation failed.",
        code: data.code,
      });
    }

    const rawImageUrl =
      data.output?.choices?.[0]?.message?.content?.find((item) => item.image)?.image ||
      data.output?.results?.[0]?.url ||
      data.output?.results?.[0]?.image_url;

    if (!rawImageUrl) {
      return res.status(500).json({ error: "DashScope did not return an image.", details: data });
    }

    const imageRes = await fetch(rawImageUrl);
    if (!imageRes.ok) {
      return res.status(500).json({ error: "Failed to download DashScope image." });
    }

    const contentType = imageRes.headers.get("content-type") || "image/png";
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const imageUrl = `data:${contentType};base64,${imageBuffer.toString("base64")}`;

    return res.status(200).json({ imageUrl, provider: "dashscope" });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Server failed to request DashScope.",
    });
  }
}
