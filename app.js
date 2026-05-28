const canvas = document.querySelector("#artboard");
const ctx = canvas.getContext("2d");
const promptInput = document.querySelector("#prompt");
const styleButtons = [...document.querySelectorAll("[data-style]")];
const statusText = document.querySelector("#status");
const generateButton = document.querySelector("#generate");
const downloadButton = document.querySelector("#download");
const referenceInput = document.querySelector("#reference");
const ratioButtons = [...document.querySelectorAll("[data-ratio]")];
const modal = document.querySelector("#toolModal");
const modalClose = document.querySelector(".modal-close");
const modalAction = document.querySelector(".modal-action");
const amazonProduct = document.querySelector("#amazonProduct");
const amazonPoints = document.querySelector("#amazonPoints");
const amazonStatus = document.querySelector("#amazonStatus");
const generateAmazonSet = document.querySelector("#generateAmazonSet");
const suiteCards = [...document.querySelectorAll("[data-suite-card]")];
const imageGenerateButtons = [...document.querySelectorAll("[data-generate-image]")];
const amazonRatioButtons = [...document.querySelectorAll("[data-amazon-ratio]")];
const aplusProduct = document.querySelector("#aplusProduct");
const aplusBrand = document.querySelector("#aplusBrand");
const aplusStatus = document.querySelector("#aplusStatus");
const generateAplusSet = document.querySelector("#generateAplusSet");
const aplusCards = [...document.querySelectorAll("[data-aplus-card]")];

let ratio = "1:1";
let amazonRatio = "1:1";
let selectedStyle = "商业摄影";
let referenceImage = null;

const palettes = {
  "商业摄影": ["#eef5ff", "#5d7fc9", "#fff2e8", "#17315f"],
  "国潮插画": ["#fff3e8", "#ff8242", "#24488f", "#17315f"],
  "电影海报": ["#101827", "#24488f", "#ffb267", "#f7f1df"],
  "3D质感": ["#f5f8ff", "#395da5", "#ff9b5c", "#17315f"]
};

const toolDetails = {
  jewelry: {
    title: "珠宝精修",
    desc: "自动提升金属边缘、高光层次和宝石通透感，适合首饰、配饰和高客单价商品展示。",
    scene: "电商详情页、直播间封面、品牌宣传图。",
    upload: "建议上传清晰白底图或棚拍图，主体完整无遮挡。",
    cost: "每张约 12 能量点"
  },
  scene: {
    title: "产品换场景",
    desc: "把普通白底商品自然放入广告场景，补充光影、环境反射和视觉氛围。",
    scene: "电商主图、活动海报、社媒推广图。",
    upload: "建议上传主体清楚、边缘干净的产品图。",
    cost: "每张约 10 能量点"
  },
  model: {
    title: "服装模特图",
    desc: "根据服装图片生成不同模特、姿势和背景，减少拍摄成本。",
    scene: "服装上新、跨境店铺、穿搭内容。",
    upload: "建议上传正面服装图，纹理和版型越清晰效果越稳定。",
    cost: "每张约 15 能量点"
  },
  poster: {
    title: "海报背景",
    desc: "根据活动主题生成背景画面，可用于节日促销、新品发布和品牌专题。",
    scene: "营销海报、公众号封面、小红书配图。",
    upload: "可不上传图片，直接输入主题、颜色和构图要求。",
    cost: "每张约 8 能量点"
  },
  upscale: {
    title: "无损高清放大",
    desc: "修复低清、模糊和压缩痕迹，提高图片尺寸与细节观感。",
    scene: "老素材复用、详情页优化、印刷前处理。",
    upload: "建议上传 JPG 或 PNG，避免过度压缩的小图。",
    cost: "每张约 6 能量点"
  },
  cutout: {
    title: "批量抠图",
    desc: "自动识别商品主体并移除背景，输出透明底或纯色底图片。",
    scene: "SKU 批量处理、主图规范化、素材入库。",
    upload: "建议主体与背景有明显区分，可一次处理多张。",
    cost: "每张约 3 能量点"
  }
};

const suiteTemplates = [
  {
    title: "白底主图",
    desc: "白底高清展示，主体占画面85%，适合亚马逊首图。"
  },
  {
    title: "核心卖点图",
    desc: "提炼3个核心卖点，用图标式信息展示购买理由。"
  },
  {
    title: "尺寸参数图",
    desc: "标注尺寸、重量、容量和关键规格，减少售前疑问。"
  },
  {
    title: "使用场景图",
    desc: "生成家庭、户外或办公场景，展示真实使用状态。"
  },
  {
    title: "细节特写图",
    desc: "放大材质、接口、工艺和结构，增强品质感。"
  },
  {
    title: "包装清单图",
    desc: "展示包装盒、配件和说明书，让用户清楚收到什么。"
  },
  {
    title: "对比优势图",
    desc: "对比普通产品，突出升级点、耐用性和性价比。"
  }
];

const aplusTemplates = [
  {
    title: "品牌故事横幅",
    desc: "用品牌视觉和一句话价值主张建立专业感。"
  },
  {
    title: "核心功能模块",
    desc: "拆解关键功能，让用户快速理解产品为什么好用。"
  },
  {
    title: "使用场景模块",
    desc: "结合生活化场景，展示产品带来的实际体验。"
  },
  {
    title: "材质工艺模块",
    desc: "突出材质、结构和细节，增强品质信任。"
  },
  {
    title: "安装使用说明",
    desc: "用步骤图降低理解成本，减少售前疑问。"
  },
  {
    title: "系列对比模块",
    desc: "展示型号差异、适用人群和选择建议。"
  },
  {
    title: "信任背书模块",
    desc: "展示认证、售后、包装和品牌承诺。"
  }
];

function fitCanvas() {
  const [w, h] = ratio.split(":").map(Number);
  const base = 900;
  canvas.width = base;
  canvas.height = Math.round(base * h / w);
}

function drawPlaceholder() {
  fitCanvas();
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#f7fbff");
  gradient.addColorStop(1, "#dce9ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(36, 72, 143, 0.13)";
  for (let x = 0; x < canvas.width; x += 45) ctx.fillRect(x, 0, 1, canvas.height);
  for (let y = 0; y < canvas.height; y += 45) ctx.fillRect(0, y, canvas.width, 1);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const chars = [...text];
  let line = "";
  chars.forEach((char, index) => {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = test;
    }
    if (index === chars.length - 1 && line) ctx.fillText(line, x, y);
  });
}

function drawGeneratedArt() {
  fitCanvas();
  const text = promptInput.value.trim() || "未来感香水瓶，水晶质感，商业摄影，高级蓝白背景";
  const [a, b, c, d] = palettes[selectedStyle];
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, a);
  bg.addColorStop(0.55, b);
  bg.addColorStop(1, c);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (referenceImage) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    const scale = Math.max(canvas.width / referenceImage.width, canvas.height / referenceImage.height);
    const width = referenceImage.width * scale;
    const height = referenceImage.height * scale;
    ctx.drawImage(referenceImage, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    ctx.restore();
  }

  ctx.fillStyle = "rgba(255,255,255,0.24)";
  for (let i = 0; i < 10; i += 1) {
    const size = 80 + i * 22;
    ctx.beginPath();
    ctx.arc((canvas.width * (i + 1)) / 11, canvas.height * (0.18 + (i % 4) * 0.19), size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height * 0.48);
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.shadowColor = "rgba(15, 40, 80, 0.28)";
  ctx.shadowBlur = 36;
  ctx.beginPath();
  ctx.roundRect(-170, -170, 340, 340, 42);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = d;
  ctx.font = "bold 42px Arial, Microsoft YaHei";
  ctx.textAlign = "center";
  ctx.fillText(styleInput.value, canvas.width / 2, canvas.height * 0.43);

  ctx.font = "24px Arial, Microsoft YaHei";
  ctx.fillStyle = "rgba(21, 32, 51, 0.78)";
  wrapText(text, canvas.width / 2, canvas.height * 0.53, Math.min(640, canvas.width * 0.74), 34);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillRect(0, canvas.height - 86, canvas.width, 86);
  ctx.fillStyle = "#17315f";
  ctx.font = "bold 28px Arial, Microsoft YaHei";
  ctx.fillText("乔亭AI作图工具生成预览", canvas.width / 2, canvas.height - 34);
}

function openModal(toolKey) {
  const detail = toolDetails[toolKey];
  if (!detail) return;
  document.querySelector("#modalTitle").textContent = detail.title;
  document.querySelector("#modalDesc").textContent = detail.desc;
  document.querySelector("#modalScene").textContent = detail.scene;
  document.querySelector("#modalUpload").textContent = detail.upload;
  document.querySelector("#modalCost").textContent = detail.cost;
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

ratioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ratioButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    ratio = button.dataset.ratio;
    drawPlaceholder();
  });
});

styleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    styleButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    selectedStyle = button.dataset.style;
  });
});

amazonRatioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    amazonRatioButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    amazonRatio = button.dataset.amazonRatio;
    amazonStatus.textContent = `已选择亚马逊主图比例：${amazonRatio}`;
  });
});

document.querySelectorAll("[data-tool]").forEach((card) => {
  card.addEventListener("click", () => openModal(card.dataset.tool));
});

modalClose.addEventListener("click", closeModal);
modalAction.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

referenceInput.addEventListener("change", () => {
  const file = referenceInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      referenceImage = image;
      statusText.textContent = "已载入参考图";
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

generateButton.addEventListener("click", () => {
  statusText.textContent = "生成中...";
  generateButton.disabled = true;
  setTimeout(() => {
    drawGeneratedArt();
    statusText.textContent = "已生成，可下载";
    generateButton.disabled = false;
  }, 520);
});

downloadButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "qiaoting-ai-art.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function handleAmazonMainGenerate() {
  generateSingleAmazonImage("白底主图", generateAmazonSet);
}

function generateSingleAmazonImage(imageType, triggerButton) {
  const product = amazonProduct.value.trim() || "示例产品";
  const points = amazonPoints.value.trim() || "高品质、耐用、适合日常使用";
  amazonStatus.textContent = `正在请求 AI 后端，生成「${imageType}」...`;
  triggerButton.disabled = true;

  fetch("/api/generate-main", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      product,
      points,
      ratio: amazonRatio,
      imageType
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("AI 后端暂未可用");
      }
      return response.json();
    })
    .then((data) => {
      const targetCard = document.querySelector(`[data-image-type="${imageType}"]`);
      const targetImage = targetCard.querySelector(".suite-product-image");
      if (data.image && targetImage) {
        targetImage.src = data.image;
      }
      targetCard.classList.add("generated");
      amazonStatus.textContent = `已生成「${product}」的「${imageType}」`;
    })
    .catch(() => {
      amazonStatus.textContent = `还没有接入 /api/generate-main，当前先标记「${imageType}」演示方案`;
      showAmazonDemoCard(imageType, product, points);
    })
    .finally(() => {
      triggerButton.disabled = false;
    });
}

window.handleAmazonMainGenerate = handleAmazonMainGenerate;

function showAmazonDemoCard(imageType, product, points) {
  const targetCard = document.querySelector(`[data-image-type="${imageType}"]`);
  const title = targetCard.querySelector("h3");
  const desc = targetCard.querySelector("p");
  title.textContent = `${imageType} · ${product}`;
  desc.textContent = `比例：${amazonRatio}。卖点：${points}`;
  targetCard.classList.add("generated");
}

imageGenerateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    generateSingleAmazonImage(button.dataset.generateImage, button);
  });
});

generateAplusSet.addEventListener("click", () => {
  const product = aplusProduct.value.trim() || "示例产品";
  const brand = aplusBrand.value.trim() || "高品质、简约设计、适合日常使用";
  aplusStatus.textContent = "正在生成亚马逊7张A+图方案...";
  generateAplusSet.disabled = true;

  setTimeout(() => {
    aplusCards.forEach((card, index) => {
      const title = card.querySelector("h3");
      const desc = card.querySelector("p");
      title.textContent = `${aplusTemplates[index].title} · ${product}`;
      desc.textContent = `${aplusTemplates[index].desc} 品牌定位：${brand}`;
      card.classList.add("generated");
    });
    aplusStatus.textContent = `已生成「${product}」的7张亚马逊A+图方案`;
    generateAplusSet.disabled = false;
  }, 650);
});

drawPlaceholder();
