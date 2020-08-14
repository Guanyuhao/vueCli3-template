<template>
  <div class="image-base" :class="drawState.isGraph ? 'crosshair' : ''">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.0"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:svgjs="http://svgjs.com/svgjs"
      id="canvas_text_content"
      :style="svgStyle"
    ></svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.0"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:svgjs="http://svgjs.com/svgjs"
      id="canvas_content"
      :style="svgStyle"
    >
      <line
        v-for="item in lineArr"
        :key="item.id"
        :x1="item.x1"
        :y1="item.y1"
        :x2="item.x2"
        :y2="item.y2"
        :stroke-width="item.strokeWidth"
        :id="item.id"
        stroke="#000000"
        class="canvas_crosshair"
        zOrder="9007199254740991"
      ></line>
      <rect
        v-for="(item, index) in labelArr"
        :key="item.id"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        :class="
          `canvas_shape ${
            labelActive === index
              ? 'canvas_shape_activated canvas_shape_draggable'
              : ''
          }`
        "
        :stroke-width="item.strokeWidth"
        shape-rendering="geometricprecision"
        color-rendering="optimizequality"
        :fill-opacity="labelActive === index ? `0.3` : item.fillOpacity"
        :fill="item.fill"
        :stroke="item.stroke"
        data-z-order="0"
        @mouseover="shapeHover(item, index)"
      ></rect>
      <!-- 圆 -->
      <g
        v-if="activeGroup"
        :id="activeGroup.id"
        :transform="activeGroup.transform"
        :fill="activeGroup.fill"
      >
        <rect
          v-if="activeGroup.rect"
          :id="activeGroup.rect.id"
          :width="activeGroup.rect.width"
          :height="activeGroup.rect.height"
          class="svg_select_boundingRect svg_select_points"
        ></rect>
        <circle
          v-for="(circle, index) in activeGroup.circleArr"
          :key="circle.id"
          :r="circle.r"
          :cy="circle.cy"
          :cx="circle.cx"
          :fill="circle.fill"
          :fill-opacity="circle.fillOpacity"
          :stroke-width="circle.strokeWidth"
          :class="
            `${circle.class} svg_select_points ${
              index === clrcleSelectActive ? 'svg_selected_points' : ''
            }`
          "
          :@mouserenter="clircleHover(circle, index)"
        ></circle>
      </g>
      <rect
        v-for="item in drawRect"
        :key="item.id"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        class="canvas_shape_drawing"
        :stroke-width="item.strokeWidth"
      ></rect>
    </svg>
    <canvas
      id="canvas_background"
      :style="{
        ...canvasStyle,
        filter: `brightness(1) contrast(1) saturate(1)`
      }"
    ></canvas>
    <canvas id="canvas_bitmap" :style="{ ...canvasStyle }"></canvas>
  </div>
</template>

<script>
import { throttle } from "@/utils/index"
export default {
  name: "imageBase",
  data() {
    return {
      svgStyle: {
        top: 0,
        left: 0,
        transform: "scale(1) rotate(0deg)"
      },
      canvasStyle: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        transform: "scale(1) rotate(0deg)"
      },
      imageUrl:
        "https://picb.zhimg.com/v2-8551e0c88b29401e3c440598cdcf2611_1440w.jpg?source=172ae18b",
      drawState: {
        isGraph: false, // 是否开启画图  lineArr
        shapDrawing: false, // 矩形是否绘制中
        weelScal: 1,
        isMove: true,
        wellStart: false
      },
      dragState: {
        canvasDrag: false,
        downXY: [],
        points: false
      },
      lineArr: [],
      drawRect: [],
      // 最终输出的标注
      labelArr: [],
      labelActive: -1,
      activeGroup: null,
      clrcleSelectActive: -1
    }
  },
  mounted() {
    this.canvasInit()
  },
  methods: {
    canvasInit() {
      let { offsetWidth, offsetHeight } = this.$el
      // 放大 svg 范围 并且居中
      let svgWidth = offsetWidth * 20
      let svgHeight = offsetHeight * 20
      this.svgStyle.width = `${svgWidth}px`
      this.svgStyle.height = `${svgHeight}px`
      this.svgStyle.left = `-${svgWidth / 2 - offsetWidth / 2}px`
      this.svgStyle.top = `-${svgHeight / 2 - offsetHeight / 2}px`
      // canvas
      let img = new Image()
      img.src = this.imageUrl
      let mycanvas = document.getElementById("canvas_background")
      let ctx = mycanvas.getContext("2d")
      img.onload = () => {
        mycanvas.width = img.width
        mycanvas.height = img.height
        ctx.drawImage(img, 0, 0)
        let scale = (offsetWidth / mycanvas.width).toFixed(5)
        // weel 状态初始化
        this.drawState.weelScal = Number(scale)
        this.svgStyle.transform = `scale(${scale}) rotate(0deg)`

        this.canvasStyle.transform = `scale(${scale}) rotate(0deg)`
        this.canvasStyle.left = `${offsetWidth / 2 - mycanvas.width / 2}px`
        this.canvasStyle.top = `${offsetHeight / 2 - mycanvas.height / 2}px`
        this.canvasStyle.width = `${mycanvas.width}px`
        this.canvasStyle.height = `${mycanvas.height}px`
      }
      // 画图
      this.drawGraph()
    },
    openMove() {
      this.drawState.isMove = true
      this.drawState.isGraph = false
      this.lineArr = []
      this.drawRect = []
    },
    openRect() {
      this.drawState.isMove = false
      this.drawState.isGraph = true
    },
    shapeHover(item, index) {
      if (index === this.labelActive) {
        return
      }
      this.labelActive = index

      this.creatRectGroup(item)
    },
    clircleHover(circle, index) {
      if (index === this.clrcleSelectActive) {
        return
      }
      this.clrcleSelectActive = index
    },
    creatRectGroup(graph) {
      let { width, height, x, y, fill } = graph
      let circleArr = []
      let circleBase = {
        r: 5,
        stroke: "black",
        fill: "inherit",
        fillOpacity: 1,
        strokeWidth: 1
      }
      circleArr.push({
        cx: 0,
        cy: 0,
        class: "svg_select_points_lt",
        ...circleBase
      })
      circleArr.push({
        cx: width,
        cy: 0,
        class: "svg_select_points_rt",
        ...circleBase
      })
      circleArr.push({
        cx: width,
        cy: height,
        class: "svg_select_points_rb",
        ...circleBase
      })
      circleArr.push({
        cx: 0,
        cy: height,
        class: "svg_select_points_lb",
        ...circleBase
      })
      circleArr.push({
        cx: width / 2,
        cy: 0,
        class: "svg_select_points_t",
        ...circleBase
      })
      circleArr.push({
        cx: width,
        cy: height / 2,
        class: "svg_select_points_r",
        ...circleBase
      })
      circleArr.push({
        cx: width / 2,
        cy: height,
        class: "svg_select_points_b",
        ...circleBase
      })
      circleArr.push({
        cx: 0,
        cy: height / 2,
        class: "svg_select_points_l",
        ...circleBase
      })
      this.activeGroup = {
        rect: {
          id: `SvgjsRect${this.rand()}`,
          width,
          height,
          x,
          y,
          fill
        },
        transform: `matrix(1,0,0,1,${x},${y})`,
        fill,
        id: `SvgjsG${this.rand()}`,
        circleArr
      }
    },
    zommFix(newVal, oldVal) {
      let drag = newVal > oldVal ? true : false
      let scale = this.drawState.weelScal.toFixed(5)
      this.canvasStyle.transform = `scale(${scale}) rotate(0deg)`
      this.svgStyle.transform = `scale(${scale}) rotate(0deg)`
      // 针对某一位位置 drag true 放大  false 缩小
      if (drag) {
        // this.svgStyle.left = `${Number.parseInt(this.svgStyle.left) /
        //   1.04}px`
        // this.svgStyle.top = `${Number.parseInt(this.svgStyle.top) /
        //   1.04}px`
      } else {
        // this.svgStyle.left = `${Number.parseInt(this.svgStyle.left) *
        //   1.04}px`
        // this.svgStyle.top = `${Number.parseInt(this.svgStyle.top) *
        //   1.04}px`
      }
      this.zoomFixStroke(drag)
    },
    zoomFixStroke(drag) {
      if (this.lineArr.length) {
        this.lineArr = this.lineArr.map(item => {
          drag
            ? (item.strokeWidth = item.strokeWidth / 1.2)
            : (item.strokeWidth = item.strokeWidth * 1.2)
          return item
        })
      }
    },
    drawGraph() {
      window.addEventListener("wheel", throttle(this.baseMouseWheel, 30))
      this.$el.addEventListener("mousemove", throttle(this.baseMouseMove, 30))
      this.$el.addEventListener("mousedown", this.baseMouseDown)
      this.$el.addEventListener("mouseover", this.baseMouseOver)
      this.$el.addEventListener("mouseout", this.baseMouseOut)

      this.$el.addEventListener("mouseup", this.baseMouseUp)
      this.$el.addEventListener("click", this.mouseClick)
    },
    baseMouseWheel(e) {
      let zommCount = e.deltaY * 0.01
      if (zommCount < 0) {
        this.drawState.weelScal = 1.2 * this.drawState.weelScal
      } else {
        this.drawState.weelScal = this.drawState.weelScal / 1.2
      }
      this.drawState.weelScal
      this.drawState.weelScal = Math.min(
        Math.max(0.1, this.drawState.weelScal),
        10
      )
    },
    createLine(x, y) {
      let { offsetWidth, offsetHeight } = this.$el
      let svgWidth = offsetWidth * 20
      let svgHeight = offsetHeight * 20
      if (this.lineArr.length) {
        let line1 = this.lineArr[0]
        let line2 = this.lineArr[1]
        line1.y1 = y
        line1.y2 = y
        line2.x1 = x
        line2.x2 = x
      } else {
        this.lineArr = [
          {
            x1: 0,
            y1: y,
            x2: svgWidth,
            y2: y,
            strokeWidth: 1,
            id: `SvgjsLine${this.rand(1000, 9999)}`
          },
          {
            x1: x,
            y1: 0,
            x2: x,
            y2: svgHeight,
            strokeWidth: 1,
            id: `SvgjsLine${this.rand(1000, 9999)}`
          }
        ]
      }
    },
    rand(min = 1000, max = 9999) {
      return Math.floor(Math.random() * (max - min)) + min
    },
    mouseClick(e) {
      if (this.drawState.isGraph) {
        if (!this.drawState.shapDrawing) {
          // 矩形点击开始绘制
          this.createRect(e.offsetX, e.offsetY)
          this.drawState.shapDrawing = true
        } else {
          // 矩形点击结束绘制
          this.drawState.shapDrawing = false
          let { width, height, x, y, strokeWidth } = this.drawRect[0]
          this.labelArr.push({
            width,
            height,
            x,
            y,
            strokeWidth,
            stroke: "rgb(256,96,55)",
            fill: "rgb(256,96,55)",
            type: "shap",
            fillOpacity: "0.03",
            id: `canvas_shape_${this.rand()}`
          })
          this.drawRect = []
          this.openMove()
        }
      }
    },
    baseMouseDown(e) {
      if (this.drawState.isMove) {
        let { target } = e
        if (target.classList.contains("svg_select_points")) {
          this.dragState.points = true
          this.dragState.id = target.id
          return
        }
        if (target.classList.contains("canvas_shape_draggable")) {
          this.dragState.shapeDrag = true
          this.dragState.id = target.id
          return
        }
        this.dragState.downXY = [e.offsetX, e.offsetY]
        this.dragState.canvasDrag = true
      }
    },
    closeDrag() {
      this.dragState.canvasDrag = false
      this.dragState.points = false
      this.dragState.shapeDrag = false
    },
    baseMouseUp() {
      this.closeDrag()
    },
    baseMouseOut() {
      // this.dragState.canvasDrag = false
    },
    baseMouseOver() {
      this.closeDrag()
    },
    baseMouseMove(e) {
      if (this.drawState.isGraph) {
        // move 事件 进入 画图状态
        this.createLine(e.offsetX, e.offsetY)
        if (this.drawState.shapDrawing) {
          this.createRect(e.offsetX, e.offsetY)
        }
      }
      if (this.drawState.isMove) {
        if (this.dragState.canvasDrag) {
          this.moveCanvasImag(e.offsetX, e.offsetY)
        }
      }
    },
    moveCanvasImag(x, y) {
      let distanceX = x - this.dragState.downXY[0]
      let distanceY = y - this.dragState.downXY[1]
      this.fixCanvasImage(distanceX, distanceY)
    },
    fixCanvasImage(distanceX, distanceY) {
      this.canvasStyle.left = `${Number.parseInt(this.canvasStyle.left) +
        distanceX}px`
      this.canvasStyle.top = `${Number.parseInt(this.canvasStyle.top) +
        distanceY}px`
      this.svgStyle.left = `${Number.parseInt(this.svgStyle.left) +
        distanceX}px`
      this.svgStyle.top = `${Number.parseInt(this.svgStyle.top) + distanceY}px`
    },
    createRect(x, y) {
      if (this.drawState.shapDrawing) {
        let currRect = this.drawRect[0]
        let w = Math.abs(currRect.clickX - x)
        let h = Math.abs(currRect.clickY - y)
        currRect.width = w
        currRect.height = h
        currRect.clickX > x ? (currRect.x = x) : (currRect.x = currRect.clickX)
        currRect.clickY > y ? (currRect.y = y) : (currRect.y = currRect.clickY)
      } else {
        this.drawRect = [
          {
            width: 0,
            height: 0,
            id: `SvgjsRect${this.rand()}`,
            strokeWidth: 1,
            x,
            y,
            clickX: x,
            clickY: y
          }
        ]
      }
    },
    createRectText() {},
    convertImageToCanvas(image) {
      // 创建canvas DOM元素，并设置其宽高和图片一样
      let canvas = document.createElement("canvas")
      canvas.width = image.width
      canvas.height = image.height
      // 坐标(0,0) 表示从此处开始绘制，相当于偏移。
      canvas.getContext("2d").drawImage(image, 0, 0)

      return canvas
    },
    convertCanvasToImage(canvas) {
      //新Image对象，可以理解为DOM
      let image = new Image()
      // canvas.toDataURL 返回的是一串Base64编码的URL，当然,浏览器自己肯定支持
      // 指定格式 PNG
      image.src = canvas.toDataURL("image/png")
      return image
    },
    createSvg(tag, attr) {
      if (!document.createElementNS) {
        return
      }
      let $svg = document.createElementNS("http://www.w3.org/2000/svg", tag)
      for (const key in attr) {
        if (attr.hasOwnProperty(key)) {
          const element = attr[key]
          switch (key) {
            case "xlink:href": //文本路径添加属性特有
              $svg.setAttributeNS("http://www.w3.org/1999/xlink", key, element)
              break
            default:
              $svg.setAttribute(key, attr[key])
          }
        }
      }
      return $svg
    }
  },
  watch: {
    "drawState.weelScal"(newVal, oldVal) {
      if (newVal && oldVal != 1) {
        this.zommFix(newVal, oldVal)
      }
    }
  }
}
</script>

<style lang="scss">
@import url(./base.scss);
.image-base {
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
  border: 1px solid red;
  box-sizing: border-box;
  &.crosshair {
    cursor: crosshair;
  }
}
</style>
