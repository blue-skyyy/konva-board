const isImageVaild = (url) => {
  return new Promise((resolve, reject) => {
    // 首先获取图片大小
    let img = new Image();
    // img.crossOrigin = "anonymous";
    img.setAttribute("crossOrigin", "Anonymous");
    img.src = url;
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        url: url,
        status: "ok"
      });
    };
    img.onerror = () => {
      // 不合法替换
      reject({
        status: "fail",
        url:
          "https://tpc.googlesyndication.com/simgad/12555138826870312117/downsize_200k_v1?w=400&h=209"
      });
    };
  });
};

const debounce = (fn, delay) => {
  let timer = null;
  return function() {
    let that = this;
    let args = arguments;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(that, args);
    }, delay);
  };
};

const composeCanvas = (width, height, c1, c2) => {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(c2, 0, 0, width, height);
  // 在下避免线条覆盖
  ctx.drawImage(c1, 0, 0, width, height);
  let url = canvas.toDataURL();
  canvas = null;
  return url;
};
export { isImageVaild, debounce, composeCanvas };
