import { fabric } from "fabric";

const inpainter = (function () {
  let imageStackCanvas = null as null | fabric.Canvas;
  let drawingCanvas = {
    context: null as null | CanvasRenderingContext2D,
    canvas: null as null | HTMLCanvasElement,
    color: "#FFFFFF",
    strokeWidth: 15,
  };
  let selectedImage = null as null | fabric.Image;

  return {
    createDrawingCanvas(id: string) {
      let latestPoint = [0, 0];
      let drawing = false;
      const canvas = document.querySelector(id) as HTMLCanvasElement;
      if (canvas !== null) {
        const context = canvas.getContext("2d");

        if (context !== null) {
          drawingCanvas.context = context;
          drawingCanvas.canvas = canvas;
          const continueStroke = (newPoint: number[]) => {
            context.beginPath();
            context.moveTo(latestPoint[0], latestPoint[1]);
            context.strokeStyle = drawingCanvas.color;
            context.lineWidth = drawingCanvas.strokeWidth;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.lineTo(newPoint[0], newPoint[1]);
            context.stroke();

            latestPoint = newPoint;
          };

          // Event helpers

          const startStroke = (point: number[]) => {
            drawing = true;
            latestPoint = point;
          };

          // Event handlers

          const mouseMove = (evt: Event) => {
            if (!drawing) {
              return;
            }

            continueStroke([
              (<MouseEvent>evt).offsetX,
              (<MouseEvent>evt).offsetY,
            ]);
          };

          const mouseDown = (evt: MouseEvent) => {
            if (drawing) {
              return;
            }
            evt.preventDefault();
            canvas.addEventListener("mousemove", mouseMove, false);
            startStroke([evt.offsetX, evt.offsetY]);
          };

          const mouseEnter = (evt: MouseEvent) => {
            if (!drawing) {
              return;
            }
            mouseDown(evt);
          };

          const endStroke = (evt: MouseEvent) => {
            if (!drawing) {
              return;
            }
            drawing = false;
            if (evt.currentTarget !== null) {
              evt.currentTarget.removeEventListener(
                "mousemove",
                mouseMove,
                false
              );
            }
          };

          // event listeners
          canvas.addEventListener("mousedown", mouseDown, false);
          canvas.addEventListener("mouseup", endStroke, false);
          canvas.addEventListener("mouseout", endStroke, false);
          canvas.addEventListener("mouseenter", mouseEnter, false);

          return { canvas, context };
        } else {
          return { canvas: null, context: null };
        }
      }
      return { canvas: null, context: null };
    },
    setDrawingMode(mode: string) {
      if (drawingCanvas.context !== null) {
        drawingCanvas.context.globalCompositeOperation =
          mode === "brush" ? "source-over" : "destination-out";
      }
    },
    setStrokeWidth(width: number) {
      drawingCanvas.strokeWidth = width;
    },
    setBrushColor(color: string) {
      drawingCanvas.color = color;
    },
    createImageCanvas({
      id,
      width,
      height,
      backgroundColor,
    }: {
      id: string;
      width: number;
      height: number;
      backgroundColor: string;
    }) {
      try {
        imageStackCanvas = new fabric.Canvas(id, {
          backgroundColor: backgroundColor,
          preserveObjectStacking: true,
        });
        imageStackCanvas.setWidth(width);
        imageStackCanvas.setHeight(height);
        return imageStackCanvas;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    addImageLayer(src: string) {
      (function () {
        fabric.Image.fromURL(src, function (oImg: fabric.Image) {
          if (imageStackCanvas !== null) {
            oImg.set("left", 0).set("top", 0);
            oImg.on("selected", function () {
              selectedImage = oImg;
            });
            imageStackCanvas.add(oImg);
          }
        });
      })();
    },
    bringForward() {
      if (selectedImage !== null && imageStackCanvas !== null) {
        imageStackCanvas.bringForward(selectedImage);
      }
    },
    bringToFront() {
      if (selectedImage !== null && imageStackCanvas !== null) {
        imageStackCanvas.bringToFront(selectedImage);
      }
    },
    bringBack() {
      if (selectedImage !== null && imageStackCanvas !== null) {
        imageStackCanvas.sendToBack(selectedImage);
      }
    },
    bringToBackward() {
      if (selectedImage !== null && imageStackCanvas !== null) {
        imageStackCanvas.sendBackwards(selectedImage);
      }
    },
    deleteImage() {
      if (selectedImage !== null && imageStackCanvas !== null) {
        imageStackCanvas.remove(selectedImage);
      }
    },
    cloneCanvas(oldCanvas: HTMLCanvasElement) {
      const newCanvas = document.createElement("canvas");
      const context = newCanvas.getContext("2d");

      newCanvas.width = oldCanvas.width;
      newCanvas.height = oldCanvas.height;

      if (context !== null) {
        context.drawImage(oldCanvas, 0, 0);
      }

      return { canvas: newCanvas, context };
    },
    canvasToDataUrl(type: string) {
      if (type === "image") {
        if (imageStackCanvas !== null) {
          const pngURL = imageStackCanvas.toDataURL();
          return pngURL;
        } else {
          return "";
        }
      } else if (type === "mask") {
        if (drawingCanvas.canvas !== null && drawingCanvas.context !== null) {
          const { canvas, context } = this.cloneCanvas(drawingCanvas.canvas);
          if (context !== null) {
            context.globalCompositeOperation = "destination-over";
            context.fillStyle = "black";
            context.fillRect(
              0,
              0,
              drawingCanvas.canvas.width,
              drawingCanvas.canvas.height
            );
            const pngURL = canvas.toDataURL();
            return pngURL;
          } else {
            return "";
          }
        } else {
          return "";
        }
      } else {
        return "";
      }
    },
    dataURItoBlob(dataURI: string) {
      const byteString = window.atob(dataURI.split(",")[1]);
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const bb = new Blob([ab], { type: mimeString });
      return bb;
    },
    imageCanvasToBlob() {
      const dataURI = this.canvasToDataUrl("image");
      const blob = this.dataURItoBlob(dataURI);
      return blob;
    },
    drawingCanvasToBlob() {
      const dataURI = this.canvasToDataUrl("mask");
      const blob = this.dataURItoBlob(dataURI);
      return blob;
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

// 변수 발생 -> erase 기능이 없다.. ㅎ => Konva로 갈아타버리는 것도 괜찮을듯??
