import { fabric } from "fabric";

// "test": "echo \"Error: no test specified\" && exit 1",
// "dev": "vite",

const inpainter = (function () {
  let canvas = null as null | fabric.Canvas;
  let maskingCanvas = null as null | fabric.Canvas;
  let selectedObject = null as null | fabric.Image;
  return {
    createBaseCanvas({
      id,
      width,
      height,
    }: {
      id: string;
      width: number;
      height: number;
    }) {
      try {
        canvas = new fabric.Canvas(id, {
          backgroundColor: "green",
          preserveObjectStacking: true,
        });
        canvas.setWidth(width);
        canvas.setHeight(height);
        return canvas;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    addImageLayer(src: string) {
      (function () {
        fabric.Image.fromURL(src, function (oImg: fabric.Image) {
          if (canvas !== null) {
            oImg.set("left", 0).set("top", 0);
            oImg.on("selected", function () {
              selectedObject = oImg;
            });
            canvas.add(oImg);
          }
        });
      })();
    },
    bringForward() {
      if (selectedObject !== null && canvas !== null) {
        canvas.bringForward(selectedObject);
      }
    },
    bringToFront() {
      if (selectedObject !== null && canvas !== null) {
        canvas.bringToFront(selectedObject);
      }
    },
    bringBack() {
      if (selectedObject !== null && canvas !== null) {
        canvas.sendToBack(selectedObject);
      }
    },
    bringToBackward() {
      if (selectedObject !== null && canvas !== null) {
        canvas.sendBackwards(selectedObject);
      }
    },
    canvasToDataUrl(type: string) {
      if (type === "image") {
        if (canvas !== null) {
          const pngURL = canvas.toDataURL();
          return pngURL;
        } else {
          return "";
        }
      } else if (type === "mask") {
        if (maskingCanvas !== null) {
          const pngURL = maskingCanvas.toDataURL();
          return pngURL;
        } else {
          return "";
        }
      } else {
        return "";
      }
    },
    dataURItoBlob(dataURI: string) {
      var byteString = window.atob(dataURI.split(",")[1]);
      var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      var bb = new Blob([ab], { type: mimeString });
      return bb;
    },
    imageCanvasToBlob() {
      const dataURI = this.canvasToDataUrl("image");
      const blob = this.dataURItoBlob(dataURI);
      return blob;
    },
    createMaskingCanvas({
      id,
      width,
      height,
    }: {
      id: string;
      width: number;
      height: number;
    }) {
      if (maskingCanvas !== null) {
        return maskingCanvas;
      } else {
        try {
          maskingCanvas = new fabric.Canvas(id, {
            isDrawingMode: true,
          });
          maskingCanvas.setWidth(width);
          maskingCanvas.setHeight(height);
          return maskingCanvas;
        } catch (e) {
          console.error(e);
          return null;
        }
      }
    },
    controlDrawingBrushWidth(pixel: number) {
      if (maskingCanvas !== null) {
        maskingCanvas.freeDrawingBrush.width = pixel;
      }
    },
  };
})();

export default inpainter;

// - 빈 레이어를 만든다.
// - 이 때 UX 상으로는 빈레이어 생성이라기보다는 마스킹 모드 이런 버튼을 만들어야할듯
// - 그 버튼을 누르면 빈 레이어가 최상단에 오고, 아니면 잠시 display:none처리
// -

// 1) stage를 만든다.
// 2) 이미지를 업로드하면 새로운 레이어를 만든다.
// 3) 이미지를 업로드하면 새로운 레이어를 만든다,,, X N번
// 4) 최상단에는 마스킹 용 레이어가 있다(default)
// 5) 이 뒤에 canvas 크기는 고정인지 아니면 상대적으로 더큰 이미지가 기준이 되는지?

// 추가할 기능
// - 최상위 레이어에 캔버스를 올리면 이미지 수정이 안될텐데,, 일단 이거를 고려해서 캔버스 위에 다양한 브러쉬 형태로 그림 그리는(브러시 모양/사이즈/색상 조절 가능) 형태로 구현(지우개 기능 포함)
// - 모든 메서드에는 return 값이 임의로라도 있어야한다(비동기 처리인 것 같아서 여기에 대한 고려도 필요).
// - docx 만들기
// - testing code 작성 및 최종 테스트

// 궁금한 점
// - 그 때보니까 이미지를 크기를 조정하지 않고 일단 업로드 한다음에 수정할 수 있는 형태인 것 같던데, 그렇다고 하면 캔버스 크기를 고정시키고 시작해야하나?..
// - 이거 약간 피그마처럼 그렇게 돼야하는거 아닌가??..
//
// - 마스킹은 그림 그리는 정도로 처리하면 되는지?(brush 크기 조절 기능?)
// - 최종적으로 canvas의 이미지를 추출하고, masking layer도 이미지로 추출하면 되는지? 데이터 타입은 뭐로 주면 되는지? => 이미지 블랍으로 처리
