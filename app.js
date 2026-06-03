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
const toolReference = document.querySelector("#toolReference");
const toolReferenceName = document.querySelector("#toolReferenceName");
const toolGenerateStatus = document.querySelector("#toolGenerateStatus");
const toolGeneratedImage = document.querySelector("#toolGeneratedImage");
const toolDownload = document.querySelector("#toolDownload");
const amazonProduct = document.querySelector("#amazonProduct");
const amazonPoints = document.querySelector("#amazonPoints");
const amazonStatus = document.querySelector("#amazonStatus");
const amazonReference = document.querySelector("#amazonReference");
const amazonReferencePreview = document.querySelector("#amazonReferencePreview");
const amazonReferenceTitle = document.querySelector("#amazonReferenceTitle");
const amazonReferenceHint = document.querySelector("#amazonReferenceHint");
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
let amazonReferenceImage = null;
let activeToolKey = "";
let toolReferenceImage = "";

const palettes = {
  "商业摄影": ["#eef5ff", "#5d7fc9", "#fff2e8", "#17315f"],
  "国潮插画": ["#fff3e8", "#ff8242", "#24488f", "#17315f"],
  "电影海报": ["#101827", "#24488f", "#ffb267", "#f7f1df"],
  "3D质感": ["#f5f8ff", "#395da5", "#ff9b5c", "#17315f"]
};

const toolDetails = {
  metal: {
    title: "金属精修",
    desc: "摄影级五金产品精修，保留原有凹凸文字和设计形态，清除指纹、灰尘、划痕、飞边毛刺，轻微抛光并还原拉丝、磨砂、镜面、哑光等金属工艺。",
    scene: "五金工具、厨具、小家电、数码外壳、金属配件。",
    upload: "建议上传主体清晰、反光不过曝的产品图，系统会尽量保持原图尺寸比例和产品外观形态。",
    cost: "每张约 12 能量点"
  },
  glass: {
    title: "玻璃精修",
    desc: "纯白背景、正视平视视角，精准还原玻璃真实通透质感，去除杂散光、杂乱折射、气泡、污渍、划痕和指纹。",
    scene: "玻璃杯、香水瓶、灯具、展示盒、透明包装。",
    upload: "建议上传产品边缘完整、透明结构清楚的图片，系统会尽量保持原产品外观和通透材质。",
    cost: "每张约 12 能量点"
  },
  plastic: {
    title: "塑料精修",
    desc: "修复塑料表面的划痕、压痕、毛边、色差和脏点，让颜色更均匀，边缘更干净。",
    scene: "玩具、宠物用品、收纳用品、日用品、小家电塑料件。",
    upload: "建议上传颜色准确、形状完整的产品图，方便保持真实结构。",
    cost: "每张约 10 能量点"
  },
  jewelry: {
    title: "珠宝精修",
    desc: "自动提升金属边缘、高光层次和宝石通透感，适合首饰、配饰和高客单价商品展示。",
    scene: "电商详情页、直播间封面、品牌宣传图。",
    upload: "建议上传清晰白底图或棚拍图，主体完整无遮挡。",
    cost: "每张约 12 能量点"
  },
  apparel: {
    title: "服装精修",
    desc: "同款重绘精修，参考上传服装生成更平整干净的电商平铺主图，保留颜色、款式、口袋、纽扣和面料纹理。",
    scene: "服装上新、跨境店铺、模特图、平铺图、详情页展示。",
    upload: "建议上传正面服装图或平铺图，系统会按同款重绘，生成平整无明显褶皱的 1600x1600 主图。",
    cost: "每张约 12 能量点"
  },
  leather: {
    title: "皮革精修",
    desc: "增强皮革纹理、油蜡感、缝线和轮廓层次，清理压痕、灰尘和轻微磨损。",
    scene: "包袋、鞋靴、皮带、钱包、皮革座椅和配饰。",
    upload: "建议上传纹理清楚、光线均匀的图片，避免过度反光。",
    cost: "每张约 12 能量点"
  },
  wood: {
    title: "木质精修",
    desc: "还原木纹、木色和漆面质感，清理灰尘、划痕和杂色，让产品更自然高级。",
    scene: "家具、餐具、木质收纳、家居摆件、手工艺品。",
    upload: "建议上传能看清木纹方向和产品边缘的图片。",
    cost: "每张约 10 能量点"
  },
  food: {
    title: "食品精修",
    desc: "提升食品色泽、新鲜度、油润感、层次和细节，但保持真实自然，不做夸张变形。",
    scene: "零食、烘焙、饮品、生鲜、餐饮菜单和详情页。",
    upload: "建议上传光线明亮、主体完整的食品图。",
    cost: "每张约 10 能量点"
  },
  cosmetics: {
    title: "美妆精修",
    desc: "优化瓶身反光、膏体质感、包装边缘、标签清晰度和品牌级商业摄影质感。",
    scene: "护肤品、彩妆、香水、洗护用品、美容仪器。",
    upload: "建议上传标签清晰、瓶身完整、反光不过曝的产品图。",
    cost: "每张约 12 能量点"
  },
  electronics: {
    title: "电子产品精修",
    desc: "强化屏幕、按键、接口、金属边框、塑料外壳和科技感光影，修复指纹灰尘。",
    scene: "耳机、音箱、键盘、手机配件、小家电、智能设备。",
    upload: "建议上传角度清晰、边缘完整的产品图。",
    cost: "每张约 12 能量点"
  },
  home: {
    title: "家具家居精修",
    desc: "修正结构比例、布料纹理、木纹、金属脚架和空间展示质感，提升详情页品质。",
    scene: "家具、灯具、收纳、床品、家居装饰。",
    upload: "建议上传产品完整、空间遮挡少的图片。",
    cost: "每张约 12 能量点"
  },
  mainRetouch: {
    title: "白底主图精修",
    desc: "纯白背景、主体居中放大、边缘干净、颜色准确，适合亚马逊和跨境电商主图规范。",
    scene: "亚马逊主图、独立站产品图、SKU 标准化、批量上新。",
    upload: "建议上传原产品主体完整、颜色准确的图片。",
    cost: "每张约 10 能量点"
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
  activeToolKey = toolKey;
  document.querySelector("#modalTitle").textContent = detail.title;
  document.querySelector("#modalDesc").textContent = detail.desc;
  document.querySelector("#modalScene").textContent = detail.scene;
  document.querySelector("#modalUpload").textContent = detail.upload;
  document.querySelector("#modalCost").textContent = detail.cost;
  toolGenerateStatus.textContent = "等待上传产品图";
  toolGeneratedImage.hidden = true;
  toolDownload.hidden = true;
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
toolReference.addEventListener("change", async () => {
  const file = toolReference.files?.[0];
  if (!file) return;

  modalAction.disabled = true;
  toolGenerateStatus.textContent = "正在优化上传图，请稍后";
  try {
    toolReferenceImage = await compressReferenceImage(file, 1024, 0.82);
    toolReferenceName.textContent = file.name;
    toolGenerateStatus.textContent = "产品图已上传，可以开始精修";
  } catch (error) {
    toolReferenceImage = "";
    toolGenerateStatus.textContent = "图片读取失败，请换一张图重试";
  } finally {
    modalAction.disabled = false;
  }
});

modalAction.addEventListener("click", async () => {
  const detail = toolDetails[activeToolKey];
  if (!detail) return;
  if (!toolReferenceImage) {
    toolGenerateStatus.textContent = "请先上传产品图";
    return;
  }

  modalAction.disabled = true;
  toolGenerateStatus.textContent = `正在生成「${detail.title}」...`;
  toolGeneratedImage.hidden = true;
  toolDownload.hidden = true;

  try {
    const response = await fetch("/api/generate-main", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: detail.title,
        sellingPoints: detail.desc,
        ratio,
        imageType: detail.title,
        referenceImage: toolReferenceImage,
      }),
    });
    const data = await response.json().catch(() => ({ error: `接口错误 ${response.status}` }));
    if (!response.ok || !data.imageUrl) {
      const detail = data.error || data.message || data.code || `接口错误 ${response.status}`;
      throw new Error(detail);
    }

    toolGeneratedImage.src = data.imageUrl;
    toolGeneratedImage.hidden = false;
    toolDownload.href = data.imageUrl;
    toolDownload.download = `${detail.title}.png`;
    toolDownload.hidden = false;
    toolGenerateStatus.textContent = `已生成「${detail.title}」`;
  } catch (error) {
    console.error("Tool retouch failed:", error);
    toolGenerateStatus.textContent = `精修失败：${error?.message || "请稍后重试"}`;
  } finally {
    modalAction.disabled = false;
  }
});
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

function compressReferenceImage(file, maxSize = 1600, quality = 0.95) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

amazonReference?.addEventListener("change", async () => {
  const file = amazonReference.files[0];
  if (!file) return;

  generateAmazonSet.disabled = true;
  amazonStatus.textContent = "正在优化上传图，稍后即可生成";
  try {
    amazonReferenceImage = await compressReferenceImage(file);
    if (amazonReferencePreview) {
      amazonReferencePreview.src = amazonReferenceImage;
      amazonReferencePreview.hidden = false;
    }
    if (amazonReferenceTitle) {
      amazonReferenceTitle.textContent = file.name;
      amazonReferenceTitle.hidden = false;
    }
    if (amazonReferenceHint) {
      amazonReferenceHint.textContent = "点击更换";
      amazonReferenceHint.hidden = false;
    }
    amazonReference.closest(".upload-box")?.classList.add("has-preview");
    amazonStatus.textContent = "产品图已上传";
  } catch (error) {
    amazonStatus.textContent = "上传图优化失败，将使用原图生成";
  } finally {
    generateAmazonSet.disabled = false;
  }
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

const amazonOutputSizes = {
  "1:1": [1600, 1600],
  "4:3": [1600, 1200],
  "16:9": [1600, 900]
};

function resizeImageToOutputSize(imageUrl, selectedRatio) {
  const [targetWidth, targetHeight] = amazonOutputSizes[selectedRatio] || amazonOutputSizes["1:1"];

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const outputCanvas = document.createElement("canvas");
      const outputContext = outputCanvas.getContext("2d");
      outputCanvas.width = targetWidth;
      outputCanvas.height = targetHeight;
      outputContext.imageSmoothingEnabled = true;
      outputContext.imageSmoothingQuality = "high";
      outputContext.drawImage(image, 0, 0, targetWidth, targetHeight);
      resolve(outputCanvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Failed to resize generated image."));
    image.src = imageUrl;
  });
}

function buildImageFileName(product, imageType, selectedRatio) {
  const [targetWidth, targetHeight] = amazonOutputSizes[selectedRatio] || amazonOutputSizes["1:1"];
  const cleanName = `${product}-${imageType}`.replace(/[\\/:*?"<>|\s]+/g, "-").replace(/^-+|-+$/g, "");
  return `${cleanName || "amazon-image"}-${targetWidth}x${targetHeight}.png`;
}

function showDownloadButton(targetCard, imageUrl, fileName) {
  if (!targetCard) return;

  let downloadButton = targetCard.querySelector(".mini-download");
  if (!downloadButton) {
    downloadButton = document.createElement("button");
    downloadButton.className = "mini-download";
    downloadButton.type = "button";
    downloadButton.textContent = "下载图片";
    targetCard.appendChild(downloadButton);
  }

  downloadButton.disabled = false;
  downloadButton.title = "下载当前图片";
  downloadButton.onclick = () => {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = imageUrl;
    link.click();
  };
}

function setupPersistentDownloadButtons() {
  imageGenerateButtons.forEach((button) => {
    const targetCard = button.closest(".suite-card");
    if (!targetCard || targetCard.querySelector(".mini-download")) return;

    const downloadButton = document.createElement("button");
    downloadButton.className = "mini-download";
    downloadButton.type = "button";
    downloadButton.textContent = "下载图片";
    downloadButton.disabled = true;
    downloadButton.title = "生成后可下载";
    button.insertAdjacentElement("afterend", downloadButton);
  });
}

function generateSingleAmazonImage(imageType, triggerButton) {
  const product = amazonProduct.value.trim() || "示例产品";
  const points = amazonPoints.value.trim() || "高品质、耐用、适合日常使用";
  amazonStatus.textContent = amazonReferenceImage
    ? `正在精修上传图，生成「${imageType}」...`
    : `正在请求 AI 后端，生成「${imageType}」...`;
  triggerButton.disabled = true;

    fetch("/api/generate-main", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product,
        points,
        sellingPoints: points,
        ratio: amazonRatio,
        imageType,
        referenceImage: amazonReferenceImage
      })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || `AI 后端暂时不可用（${response.status}）`);
        }
        return data;
      })
      .then(async (data) => {
        const targetCard = document.querySelector(`[data-image-type="${imageType}"]`);
        const targetImage = targetCard?.querySelector(".suite-product-image");
        let imageUrl = data.imageUrl || data.image;
        if (!imageUrl) {
          throw new Error(data.error || "AI 没有返回图片，请稍后重试");
        }
        imageUrl = await resizeImageToOutputSize(imageUrl, amazonRatio);
        if (targetImage) {
          targetImage.src = imageUrl;
        }
        showDownloadButton(targetCard, imageUrl, buildImageFileName(product, imageType, amazonRatio));
        targetCard?.classList.add("generated");
        amazonStatus.textContent = `已生成「${product}」的「${imageType}」`;
      })
      .catch((error) => {
        amazonStatus.textContent = `生成失败：${error.message}`;
        console.error(error);
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

setupPersistentDownloadButtons();

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
