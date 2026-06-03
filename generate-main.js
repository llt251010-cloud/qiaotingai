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
  const isSizeParametersImage = String(imageType).includes("灏哄鍙傛暟鍥?);
  const isMetalRetouchImage = String(imageType).includes("閲戝睘绮句慨") || String(imageType).toLowerCase().includes("metal");
  const isGlassRetouchImage = String(imageType).includes("鐜荤拑绮句慨") || String(imageType).toLowerCase().includes("glass");
  const isApparelRetouchImage = String(imageType).includes("鏈嶈绮句慨") || String(imageType).toLowerCase().includes("apparel");

  if (!cleanProduct) {
    return res.status(400).json({ error: "璇峰厛濉啓浜у搧鍚嶇О銆? });
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

  const sizeParametersPrompt = [
    "浜氶┈閫婂昂瀵稿弬鏁板睍绀哄浘锛岀函鐧借儗鏅紝浜у搧灞呬腑鏀惧ぇ灞曠ず锛屼娇鐢ㄤ笓涓氬伐绋嬪昂瀵哥嚎鏍囨敞浜у搧闀垮害銆佸搴︺€侀珮搴︺€佹繁搴︺€?,
    "鍙充晶灞曠ず瀹归噺銆侀噸閲忋€佹潗璐ㄣ€佸寘瑁呮暟閲忕瓑鍏抽敭鍙傛暟銆?,
    "鏁翠綋閲囩敤娆х編楂樼鍝佺墝椋庢牸锛岀暀鐧藉厖瓒筹紝鏁版嵁娓呮櫚鏄撹锛岄珮绾х伆鐧介厤鑹诧紝绉戞妧鎰熸帓鐗堛€?,
    "浜у搧鐪熷疄姣斾緥灞曠ず锛岄珮娓呯簿淇川鎰燂紝绗﹀悎浜氶┈閫婅鎯呴〉璁捐瑙勮寖銆?,
    "濡傛灉鐢ㄦ埛娌℃湁鎻愪緵鐪熷疄灏哄銆佸閲忋€侀噸閲忋€佹潗璐ㄣ€佸寘瑁呮暟閲忥紝璇蜂娇鐢ㄦ竻鏅扮殑鍗犱綅鍙傛暟鎺掔増锛屼笉瑕佺敓鎴愪贡鐮佹枃瀛椼€?,
    `鍥剧墖绫诲瀷锛?{imageType}`,
    `浜у搧鍚嶇О锛?{cleanProduct}`,
    `鏍稿績鍗栫偣/鍙傛暟锛?{cleanPoints || "璇峰洿缁曚骇鍝佸昂瀵搞€佸閲忋€侀噸閲忋€佹潗璐ㄥ拰鍖呰鏁伴噺杩涜淇℃伅鍥捐璁?}`,
    `鐢诲箙姣斾緥锛?{ratio}`,
  ].join("\n");

  const metalRetouchPrompt = [
    "甯垜绮句慨浜旈噾浜у搧锛屾憚褰辩骇鍒紝C4D 娓叉煋绾ч珮娓呰川鎰燂紝绾櫧鑳屾櫙锛孯GB:255銆?,
    "缁濆绂佹鏂板浠讳綍鏂囧瓧銆佷腑鏂囥€佽嫳鏂囥€佹爣棰樸€佽鏄庢枃妗堛€佹爣绛俱€佹暟瀛椼€佸浘鏍囥€乴ogo銆佹按鍗般€佸墠鍚庡姣旀帓鐗堟垨瑁呴グ鍏冪礌銆?,
    "鍙繚鐣欎骇鍝佸疄鐗╄〃闈㈠師鏈凡缁忓瓨鍦ㄧ殑鍒诲瓧銆佸帇鍗板瓧銆佸嚫璧峰瓧鎴栧嚬闄峰瓧锛屼笉瑕佸嚟绌虹敓鎴愪换浣曟柊鏂囧瓧銆?,
    "淇濈暀浜у搧琛ㄩ潰鍘熸湁鍑瑰嚫鏂囧瓧锛屼弗鏍间繚鐣欏師鏈夎璁★紝涓嶆敼鍙樹骇鍝佸瑙傚舰鎬併€?,
    "娓呴櫎浜у搧琛ㄩ潰鎵€鏈夋寚绾广€佺伆灏樸€佸垝鐥曘€侀杈规瘺鍒猴紝淇缂洪櫡銆?,
    "瀵硅〃闈㈠仛杞诲井鎶涘厜澶勭悊锛岀簿鍑嗗睍鐜扮函閲戝睘鐨勬潗璐ㄧ壒鎬т笌琛ㄩ潰宸ヨ壓锛屽鎷変笣銆佺（鐮傘€侀暅闈€佸搼鍏夈€?,
    "寮卞寲榛戣壊鏆楅儴锛岄檷浣庨珮鍙嶅樊瀵规瘮搴︼紝鏌斿拰鐨勭敾闈㈣川鎰燂紝8K 瓒呮竻銆?,
    "淇濈暀鍘熷浘灏哄銆佹瀯鍥炬瘮渚嬪拰浜у搧涓讳綋浣嶇疆锛屼笉鎷変几銆佷笉鍙樺舰銆佷笉鏂板缁撴瀯銆?,
    "鍙厑璁告竻娲併€佷慨澶嶃€佹姏鍏夈€佹彁楂樻竻鏅板害鍜屼紭鍖栭噾灞炶川鎰燂紝涓嶅厑璁告敼鑹层€佹敼娆俱€佹敼閫犲瀷銆?,
    "鏈€缁堢敾闈㈠彧鑳藉寘鍚師浜у搧鏈綋鍜岀函鐧借儗鏅紝涓嶈鍋氭捣鎶ャ€佷笉瑕佸仛瀵规瘮鍥俱€佷笉瑕佸姞鎺掔増銆?,
    `鍥剧墖绫诲瀷锛?{imageType}`,
    `浜у搧鍚嶇О锛?{cleanProduct}`,
    `琛ュ厖瑕佹眰锛?{cleanPoints || "浜旈噾浜у搧閲戝睘鏉愯川绮句慨锛屼繚鎸佺湡瀹炰骇鍝佸瑙?}`,
    `鐢诲箙姣斾緥锛?{ratio}`,
  ].join("\n");

  const glassRetouchPrompt = [
    "涓婁紶涓€寮犲浘灏卞彲浠ョ簿淇紝浜у搧缃簬绾噣鐨勭函鐧借儗鏅笂銆?,
    "姝ｈ鍥撅紝骞宠瑙嗚锛?D 娓叉煋绾ч珮娓呰川鎰熴€?,
    "绮惧噯杩樺師浜у搧鐪熷疄閫氶€忚川鎰燂紝鍘婚櫎澶氫綑鏉傛暎鍏変笌鏉備贡鎶樺皠锛屽寮虹簿鑷存劅涓庨珮绾ф劅銆?,
    "灞曠幇鐜荤拑鏉愯川閫氶€忚川鎰燂紝鏅惰幑鍓旈€忋€佹俯娑﹀厜娉姐€佸共鍑€婢勬緢銆?,
    "娓呴櫎鐜荤拑琛ㄩ潰姘旀场銆佹薄娓嶃€佸垝鐥曘€佹寚绾逛笌鐟曠柕锛岃浜у搧閫氶€忔棤鐟曘€佸喘鏂版磥鍑€銆?,
    "鍏夌嚎鍧囧寑閫氶€忥紝鍏夊奖杩囨浮鑷劧鏌斿拰锛屾棤鏄庢樉鏉備贡闃村奖涓庢潅鍏夈€?,
    "涓ユ牸淇濈暀鍘熶骇鍝佸瑙傘€佺粨鏋勩€佹瘮渚嬨€侀鑹层€侀€忔槑搴﹀拰鏉愯川缁嗚妭锛屼笉鏀瑰彉浜у搧璁捐銆?,
    "缁濆绂佹鏂板浠讳綍鏂囧瓧銆佷腑鏂囥€佽嫳鏂囥€佹爣棰樸€佽鏄庢枃妗堛€佹爣绛俱€佹暟瀛椼€佸浘鏍囥€乴ogo銆佹按鍗般€佸墠鍚庡姣旀帓鐗堟垨瑁呴グ鍏冪礌銆?,
    "鏈€缁堢敾闈㈠彧鑳藉寘鍚師浜у搧鏈綋鍜岀函鐧借儗鏅紝涓嶈鍋氭捣鎶ャ€佷笉瑕佸仛瀵规瘮鍥俱€佷笉瑕佸姞鍦烘櫙閬撳叿銆?,
    `鍥剧墖绫诲瀷锛?{imageType}`,
    `浜у搧鍚嶇О锛?{cleanProduct}`,
    `琛ュ厖瑕佹眰锛?{cleanPoints || "鐜荤拑鏉愯川绮句慨锛屼繚鎸佺湡瀹炰骇鍝佸瑙傚拰閫氶€忚川鎰?}`,
    `鐢诲箙姣斾緥锛?{ratio}`,
  ].join("\n");

  const apparelRetouchPrompt = [
    "服装同款重绘精修。参考上传服装，重新生成一件同款平铺电商主图，纯白背景，正视平视图，输出 1600x1600 正方形图片。",
    "目标不是轻微修原图，而是根据原图服装重新生成更平整、更干净、更适合电商展示的同款服装图。",
    "必须尽量保留原服装的颜色、面料纹理、领口、袖口、纽扣、口袋、下摆、长度、款式特征和整体版型风格。",
    "衣身必须平整无明显褶皱，面料自然舒展，像熨烫后的商业平铺摄影效果。",
    "袖子自然伸展、自然下垂或轻微外展，不要卷袖，不要挽袖，不要折叠袖口，不要出现凌乱堆叠。",
    "去除线头、起球、污渍、脏点、压痕、凌乱褶皱和生硬阴影，保持布料真实纹理，不要磨成塑料感。",
    "画面干净高级，柔和均匀布光，细节清晰，边缘干净，符合电商主图标准。",
    "不要生成模特、衣架、人台、场景道具、文字、标签、logo、水印、前后对比排版或任何新物体。",
    "最终画面只能包含一件同款服装和纯白背景。",
    `图片类型：${imageType}`,
    `产品名称：${cleanProduct}`,
    `补充要求：${cleanPoints || "服装同款重绘精修，平整无褶皱，保留颜色款式和面料纹理"}`,
    "输出尺寸：1600x1600",
  ].join("\n");

  const prompt = isSizeParametersImage
    ? sizeParametersPrompt
    : isMetalRetouchImage
    ? metalRetouchPrompt
    : isGlassRetouchImage
    ? glassRetouchPrompt
    : isApparelRetouchImage
    ? apparelRetouchPrompt
    : hasReferenceImage
    ? [
        "浜у搧绮句慨锛屼簹椹€婁富鍥鹃鏍硷紝绾櫧鑳屾櫙锛屼骇鍝佸眳涓斁澶у睍绀猴紝涓讳綋鍗犵敾闈?5%浠ヤ笂锛屼笓涓氭憚褰辨鎷嶆憚锛岄珮绔晢涓氭憚褰憋紝瓒呴珮娓?K鐢昏川锛岀湡瀹炴潗璐ㄨ繕鍘燂紝棰滆壊绮惧噯杩樺師锛岀粏鑺傛竻鏅伴攼鍒╋紝杈圭紭骞插噣鍒╄惤锛屽幓闄ょ伆灏樼憰鐤碉紝鍘婚櫎鍒掔棔瑜剁毐锛屽寮轰骇鍝佺珛浣撴劅锛屼紭鍖栭珮鍏変笌闃村奖锛屾暣浣撻珮绾ф湁璐ㄦ劅锛屾棤姘村嵃锛屾棤鏂囧瓧锛屾棤鍥炬爣锛岀鍚堜簹椹€婁富鍥捐鑼冿紝鐢靛晢鍟嗕笟绾х簿淇晥鏋溿€?,
        "楂樼骇鍟嗕笟鎽勫奖璐ㄦ劅锛?D 杞欢娓叉煋绾х簿缁嗗害銆?,
        "鑳屾櫙鏀逛负绾櫧鏃犵紳鑳屾櫙锛屾棤鏉傝壊锛岃竟缂樺共鍑€鍒╄惤锛屾柟渚垮悗鏈熸姞鍥俱€?,
        "鍏夌嚎閲囩敤鏌斿拰鍧囧寑甯冨厜锛岀獊鍑轰骇鍝佽疆寤撲笌鏉愯川缁嗚妭锛屽弽鍏夎嚜鐒朵笉鍒虹溂銆?,
        "鏉愯川琛ㄧ幇鐪熷疄缁嗚吇锛屾棤鍣偣銆佹棤鐣稿彉銆佹棤鐪╁厜銆?,
        "鏁翠綋鐢婚潰楂樻竻閿愬埄锛岃壊褰╁噯纭繕鍘熶骇鍝佹湰韬€?,
        "涓ユ牸淇濇寔鍘熶骇鍝佷富浣撱€佸舰鐘躲€侀鑹层€佹潗璐ㄣ€佽搴︺€佹瘮渚嬪拰杈圭紭杞粨涓嶅彉銆?,
        "鍙厑璁告竻鐞嗚儗鏅€佸寮烘竻鏅板害銆佹彁浜€佷紭鍖栭珮鍏夊拰鐪熷疄璐ㄦ劅銆?,
        "灏介噺鏃犻槾褰辨垨浠呬繚鐣欐瀬寮辫嚜鐒舵帴瑙﹂槾褰憋紝涓嶈澶ч潰绉姇褰便€?,
        "缁濆绂佹娣诲姞浠讳綍鏂囧瓧銆佷腑鏂囥€佽嫳鏂囥€佹暟瀛椼€佹爣棰樸€佹爣绛俱€乴ogo銆佹按鍗般€佸浘鏍囥€佸崠鐐规枃妗堛€佸満鏅亾鍏枫€佸寘瑁呫€佽鏄庝功鎴栨柊鐗╀綋銆?,
        "杈撳嚭鐢婚潰鍙兘鍖呭惈涓婁紶鍥句腑鐨勫師浜у搧涓讳綋鍜岀函鐧借儗鏅€?,
      ].join("\n")
    : [
        "鐢熸垚涓€寮犱笓涓氫簹椹€婄數鍟嗕骇鍝佺櫧搴曚富鍥俱€?,
        `鍥剧墖绫诲瀷锛?{imageType}`,
        `浜у搧鍚嶇О锛?{cleanProduct}`,
        `鏍稿績鍗栫偣锛?{cleanPoints || "楂樺搧璐ㄣ€佺粨鏋勬竻鏅般€佺獊鍑鸿喘涔扮悊鐢?}`,
        `鐢诲箙姣斾緥锛?{ratio}`,
        "椋庢牸锛氱湡瀹炲晢涓氭憚褰憋紝绾櫧鑳屾櫙锛屼骇鍝佸眳涓紝骞插噣甯冨厜锛岀粏鑺傛竻鏅帮紝楂樼骇浣嗙湡瀹炪€?,
        "涓嶈鍝佺墝 logo锛屼笉瑕佹按鍗帮紝涓嶈涔辩爜鏂囧瓧锛屼笉瑕佷镜鏉冩爣璇嗭紝涓嶈澶稿紶鍙樺舰銆?,
      ].join("\n");

  const requestBody = {
    model: process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-lite-260128",
    prompt,
    size: isApparelRetouchImage ? "1600x1600" : (sizeMap[ratio] || "1024x1024"),
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



