// import inpainter from "fabric-image-maker";
import inpainter from "./main";
// "dev": "vite",
const result = inpainter.createBaseCanvas("app");

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
    const url = inpainter.canvasToDataUrl();
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

const getBlobBtnElement = document.querySelector(
  "#getBlobBtn"
) as HTMLButtonElement;

getBlobBtnElement.addEventListener("click", function () {
  const response = inpainter.imageCanvasToBlob();
  console.log(response);
});
