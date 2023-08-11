// import inpainter from "fabric-image-maker";
import inpainter from "./main";
// "dev": "vite",
const result = inpainter.createBaseCanvas({
  id: "app",
  width: 900,
  height: 700,
});

if (result !== null) {
  const imageInputElement = document.querySelector(
    "#imageInput"
  ) as HTMLInputElement;
  const canvasBtnElement = document.querySelector(
    "#canvasBtn"
  ) as HTMLButtonElement;

  if (canvasBtnElement !== null && imageInputElement !== null) {
    canvasBtnElement.addEventListener("click", function () {
      if (imageInputElement.files !== null) {
        const file = imageInputElement.files[0];
        const reader = new FileReader();
        const img = new Image() as HTMLImageElement;

        reader.readAsDataURL(file);
        reader.onload = (e) => {
          if (img !== null && e?.target !== null) {
            inpainter.addImageLayer(e.target.result as string);
          }
        };
      }
    });
  }

  const mergeBtnElement = document.querySelector(
    "#mergeBtn"
  ) as HTMLButtonElement;

  mergeBtnElement.addEventListener("click", function () {
    const mergedImageElement = document.querySelector(
      "#merged_image"
    ) as HTMLImageElement;
    const url = inpainter.canvasToDataUrl("image");
    mergedImageElement.src = url;
  });

  const bringToFrontBtnElement = document.querySelector(
    "#bringToFrontBtn"
  ) as HTMLButtonElement;

  bringToFrontBtnElement.addEventListener("click", function () {
    inpainter.bringToFront();
  });

  const bringForwardBtnElement = document.querySelector(
    "#bringForwardBtn"
  ) as HTMLButtonElement;

  bringForwardBtnElement.addEventListener("click", function () {
    inpainter.bringForward();
  });
}

const bringToBackBtnElement = document.querySelector(
  "#sendToBackBtn"
) as HTMLButtonElement;

bringToBackBtnElement.addEventListener("click", function () {
  inpainter.bringBack();
});

const sendBackwardBtnElement = document.querySelector(
  "#sendBackwardBtn"
) as HTMLButtonElement;

sendBackwardBtnElement.addEventListener("click", function () {
  inpainter.bringToBackward();
});

const getBlobBtnElement = document.querySelector(
  "#getBlobBtn"
) as HTMLButtonElement;

getBlobBtnElement.addEventListener("click", function () {
  inpainter.imageCanvasToBlob();
});

const maskingBtnElement = document.querySelector(
  "#maskingBtn"
) as HTMLButtonElement;

const maskingCanvasElement = document.querySelector(
  "#masking"
) as HTMLCanvasElement;

maskingBtnElement.addEventListener("click", function () {
  const response = inpainter.createMaskingCanvas({
    id: "masking",
    width: 900,
    height: 700,
  });
  if (response !== null) {
    if (maskingCanvasElement.parentElement) {
      if (maskingCanvasElement.parentElement.style.display === "block") {
        maskingCanvasElement.parentElement.style.display = "none";
      } else {
        maskingCanvasElement.parentElement.style.display = "block";
      }
    }
  }
});

const pixelInput = document.querySelector("#pixelInput") as HTMLInputElement;
pixelInput.addEventListener("change", function () {
  inpainter.controlDrawingBrushWidth(parseInt(pixelInput.value));
});

const mergeMaskingBtnElement = document.querySelector(
  "#mergeMaskingBtn"
) as HTMLButtonElement;

mergeMaskingBtnElement.addEventListener("click", function () {
  const mergedImageElement = document.querySelector(
    "#merged_masked_image"
  ) as HTMLImageElement;
  const url = inpainter.canvasToDataUrl("mask");
  mergedImageElement.src = url;
});
