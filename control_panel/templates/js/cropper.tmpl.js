const normalizeImageDimensions = (originalDimensions) => {
  windowHeight = window.innerHeight;
  windowWidth = window.innerWidth;

  imgWidth = originalDimensions.w;
  imgHeight = originalDimensions.h;

  ratioH = (windowHeight / imgHeight) * .9;
  ratioW = windowWidth / imgWidth;

  minRatio = Math.min(ratioH, ratioW);

  correctedW = imgWidth * minRatio;
  correctedH = imgHeight * minRatio;

  const corrected = {
    h: correctedH,
    w: correctedW,
    ratio: minRatio
  };

  return corrected;
}

var rectStart = { x: -1, y: -1 };
var rectEnd = { x: 0, y: 0 };

var selectionMode = false;
var imageRatio = 1;

const updateFormDimensions = (x, y, w, h) => {

  const denormalizedX = Math.floor(x / imageRatio);
  const denormalizedY = Math.floor(y / imageRatio);
  const denormalizedW = Math.floor(w / imageRatio);
  const denormalizedH = Math.floor(h / imageRatio);

  document.getElementById('min-x').value = denormalizedX;
  document.getElementById('min-y').value = denormalizedY;
  document.getElementById('width').value = denormalizedW;
  document.getElementById('height').value = denormalizedH;
};

const canvasOnClick = (context) => (event, arg2) => {
  clickX = event.offsetX;
  clickY = event.offsetY;

  const canvas = document.getElementById('movement');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.style.zIndex   = 8;
  canvas.style.position = "absolute";
  canvas.style.border   = "1px solid";

  if (context === 'dragstart') {
    rectStart.x   = clickX;
    rectStart.y   = clickY;
    rectEnd.x     = clickX;
    rectEnd.y     = clickY;
    selectionMode = true;
  }

  if (
    selectionMode &&
    (context === 'dragend' || context === 'dragmove')
  ) {
    rectEnd.x = clickX;
    rectEnd.y = clickY;
  }

  if (context === 'dragend') {
    selectionMode = false;
  }

  startRect = rectStart;

  // update spans
  if (selectionMode) {
    const spanX = document.getElementById('selection-x');
    const spanY = document.getElementById('selection-y');
    const spanW = document.getElementById('selection-w');
    const spanH = document.getElementById('selection-h');

    const minX = Math.min(rectStart.x, clickX)
    spanX.innerHTML = minX;
    const width = Math.abs(clickX - rectStart.x);
    spanW.innerHTML = width;

    const minY = Math.min(rectStart.y, clickY);
    spanY.innerHTML = minY;
    const height = Math.abs(clickY - rectStart.y);
    spanH.innerHTML = height;

    updateFormDimensions(minX, minY, width, height);
  }

  ctx.beginPath();
  const rectWidth = rectEnd.x - startRect.x;
  const rectHeight = rectEnd.y - startRect.y;

  ctx.strokeStyle = 'white';
  ctx.setLineDash([5, 5]);
  ctx.rect(startRect.x, startRect.y, rectWidth, rectHeight);

  ctx.stroke();
}

function loadImage() {
  const displayCanvas = document.getElementById('display-canvas');
  const movementCanvas = document.getElementById('movement');
  const myContext = displayCanvas.getContext('2d');
  const img = new Image();
  img.src = 'data:image/png;base64,{{ encoded_file_content }}';

  img.onload = () => {
    imgHeight = img.naturalHeight;
    imgWidth = img.naturalWidth;

    const originalDimensions = {
      h: imgHeight,
      w: imgWidth
    };

    const normalized = normalizeImageDimensions(originalDimensions);

    imageRatio = normalized.ratio;

    displayCanvas.height = normalized.h;
    displayCanvas.width = normalized.w;
    movementCanvas.height = normalized.h;
    movementCanvas.width = normalized.w;
    movementCanvas.x = displayCanvas.x;
    movementCanvas.y = displayCanvas.y;

    movementCanvas.onclick = canvasOnClick('click');
    movementCanvas.onmousedown = canvasOnClick('dragstart');
    movementCanvas.onmouseup = canvasOnClick('dragend')
    movementCanvas.onmousemove = canvasOnClick('dragmove');

    myContext.drawImage(img,
      0, 0, imgWidth, imgHeight,
      0, 0, normalized.w, normalized.h);
  };
}

document.addEventListener('DOMContentLoaded', (event) => {
  //the event occurred
  loadImage();
});
