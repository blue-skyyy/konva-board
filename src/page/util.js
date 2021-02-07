import Konva from "konva";

const imageList = [
  // "http://lorempixel.com/400/400/fashion",
  "https://img.vipkidstatic.com/beeschool/server/20200827/235cd851-2a51-4745-b5a5-5c2451fb8e59.jpg", // 2400×1128
  "https://media.vipkidstatic.com/beeschool/default/20200728/dd480c03-1e7e-491f-a138-8f4382496fde.png", // 1405x1047

  "https://media.vipkidstatic.com/beeschool/default/20200728/ebd52306-1a83-4963-b205-e369508c37a4.jpeg",

  " https://img.vipkidstatic.com/beeschool/server/20200826/13bedc97-d47b-4fc3-9a34-20652a9c5061.png",
  "https://img.vipkidstatic.com/beeschool/server/20200825/4088c882-69ed-4f2a-b284-0241af83ce4c.png",
  "https://img.vipkidstatic.com/beeschool/server/20200825/eb627ba4-1238-44b6-8e90-57b35e3e7721.png",
  "https://img.vipkidstatic.com/beeschool/server/1598337872549/WechatIMG35.jpeg",
  "https://imgx.vipkidstatic.com/img/beeschool/server/20200804/b7f4ad3e-1131-4778-a6ad-cbbdef5c0218.jpg"

  // "http://b.hiphotos.baidu.com/image/pic/item/359b033b5bb5c9ea5c0e3c23d139b6003bf3b374.jpg", // 800×533
  // "http://a.hiphotos.baidu.com/image/pic/item/8d5494eef01f3a292d2472199d25bc315d607c7c.jpg",
  // "http://g.hiphotos.baidu.com/image/pic/item/6d81800a19d8bc3e770bd00d868ba61ea9d345f2.jpg"
];

// const C_WIDTH = 1200;
// const C_HEIGHT = 700;

// 缩放后大小
const scaleWH = (imageW, imageH, maxWidth, maxHeight) => {
  // 用于设定图片的宽度和高度
  let tempWidth;
  let tempHeight;

  if (imageW > 0 && imageH > 0) {
    //原图片宽高比例 大于 指定的宽高比例，这就说明了原图片的宽度必然 > 高度
    if (imageW / imageH >= maxWidth / maxHeight) {
      if (imageW > maxWidth) {
        tempWidth = maxWidth;
        // 按原图片的比例进行缩放
        tempHeight = (imageH * maxWidth) / imageW;
      } else {
        // 按原图片的大小进行缩放
        tempWidth = imageW;
        tempHeight = imageH;
      }
    } else {
      // 原图片的高度必然 > 宽度
      if (imageH > maxHeight) {
        tempHeight = maxHeight;
        // 按原图片的比例进行缩放
        tempWidth = (imageW * maxHeight) / imageH;
      } else {
        // 按原图片的大小进行缩放
        tempWidth = imageW;
        tempHeight = imageH;
      }
    }
    return {
      width: parseInt(tempWidth),
      height: parseInt(tempHeight)
    };
  }
};

// 获取背景图片xy偏移量
const getBgImgXYOffset = (width, height, C_WIDTH, C_HEIGHT) => {
  if (width) {
    return C_WIDTH > width ? Math.floor(C_WIDTH - width) / 2 : 0;
  }
  if (height) {
    return C_HEIGHT > height ? Math.floor(C_HEIGHT - height) / 2 : 0;
  }
};

// 旋转中心点
const rotatePoint = ({ x, y }, rad) => {
  const rcos = Math.cos(rad);
  const rsin = Math.sin(rad);
  return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
};

const rotateAroundCenter = (node, rotation) => {
  const topLeft = { x: -node.width() / 2, y: -node.height() / 2 };
  const current = rotatePoint(topLeft, Konva.getAngle(node.rotation()));
  const rotated = rotatePoint(topLeft, Konva.getAngle(rotation));
  const dx = rotated.x - current.x,
    dy = rotated.y - current.y;
  node.rotation(rotation);
  node.x(node.x() + dx);
  node.y(node.y() + dy);
};

// 防抖
const debounce = (fn, delay) => {
  let timer = null;
  return function() {
    // let that = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

export { scaleWH, imageList, getBgImgXYOffset, rotateAroundCenter, debounce };
