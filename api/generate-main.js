export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { product = "", sellingPoints = "", ratio = "1:1", imageType = "白底主图" } = req.body || {};

  if (!product.trim()) {
    return res.status(400).json({ error: "请先填写产品名称" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "服务器还没有配置 OPENAI_API_KEY" });
  }

  const sizeMap = {
    "1:1": "1024x1024",
    "4:3": "1536x1024",
    "16:9": "1536x1024"
  };

  const prompt = [
    "你是一名专业的亚马逊电商图片设计师。",
    `请生成一张「${imageType}」。`,
    `产品名称：${product}`,
    `核心卖点：${sellingPoints || "突出产品质感、清晰结构和购买理由"}`,
    `图片比例：${ratio}`,
    "画面要求：适合 Amazon Listing，商业摄影质感，构图干净，主体清晰，高级但真实。",
    "限制：不要出现品牌水印，不要出现乱码文字，不要夸张变形，不要生成侵权品牌标识。"
  ].join("\n");

  try {
    const aiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: sizeMap[ratio] || "1024x1024"
      })
    });

    const data = await aiRes.json();

    if (!aiRes.ok) {
      return res.status(aiRes.status).json({
        error: data.error?.message || "AI 图片生成失败"
      });
    }

    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      return res.status(500).json({ error: "AI 没有返回图片" });
    }

    return res.status(200).json({
      imageUrl: `data:image/png;base64,${b64}`
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "服务器请求 AI 失败"
    });
  }
}
