<template>
  <div class="v-boderbase">
    <div class="svg-wrapper" v-loading="imgLoading">
      <svg
        id="imgSvg"
        :class="!dragSvg ? 'crosshair' : 'pointer'"
        v-if="baseImg"
        :width="baseImg.width"
        :height="baseImg.height"
        preserveAspectRatio="xMinYMin meet"
      >
        <image
          :xlink:href="baseImg.url"
          :width="baseImg.width"
          :height="baseImg.height"
          style="opacity: 0.8;"
        ></image>
        <g
          v-for="(item, index) in lableObj"
          style="opacity:1;"
          :key="index"
          :data-index="index"
          :class="[item.svgFont ? 'stopDraw' : '', 'group_' + index]"
        >
          <path
            :d="item.d"
            :fill="item.fill"
            :fill-opacity="item['fill-opacity']"
            stroke-width="2"
            :stroke="item.stroke"
            :data-index="index"
            :class="item.svgFont ? 'mouse--move' : ''"
          ></path>
          <g v-if="item.text" :data-index="index" class="stopDraw">
            <defs>
              <filter x="0" y="0" width="1" height="1" :id="'bg' + index">
                <feFlood :flood-color="item.stroke"></feFlood>
                <feComposite in="SourceGraphic"></feComposite>
              </filter>
            </defs>
            <text
              :filter="'url(#bg' + index + ')'"
              :x="item.text.x"
              :y="item.text.y"
              class="svgFont stopDraw"
              :data-index="index"
            >
              &nbsp;{{ item.text.txt }}&nbsp;
            </text>
          </g>
          <g
            v-show="item.svgFont && item.text.svgCloseStyle && false"
            :class="['svg-icon--close stopDraw', 'svgCloseStyle_' + index]"
            :data-index="index"
          >
            <svg
              class="icon stopDraw"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
            >
              <path
                :filter="'url(#bg' + index + ')'"
                d="M512 1024C228.072727 1024 0 795.927273 0 512S228.072727 0 512 0s512 228.072727 512 512-228.072727 512-512 512z m0-46.545455c256 0 465.454545-209.454545 465.454545-465.454545S768 46.545455 512 46.545455 46.545455 256 46.545455 512s209.454545 465.454545 465.454545 465.454545z m0-514.327272l148.945455-148.945455c13.963636-13.963636 34.909091-13.963636 48.872727 0 13.963636 13.963636 13.963636 34.909091 0 48.872727L560.872727 512l148.945455 148.945455c13.963636 13.963636 13.963636 34.909091 0 48.872727-13.963636 13.963636-34.909091 13.963636-48.872727 0L512 560.872727l-148.945455 148.945455c-13.963636 13.963636-34.909091 13.963636-48.872727 0-13.963636-13.963636-13.963636-34.909091 0-48.872727l148.945455-148.945455-148.945455-148.945455c-13.963636-13.963636-13.963636-34.909091 0-48.872727 13.963636-13.963636 34.909091-13.963636 48.872727 0l148.945455 148.945455z"
                fill="#ffffff"
                fill-opacity="0.75"
                :p-id="index"
                class="stopDraw svg-icon--close--path"
              ></path>
            </svg>
          </g>
          <g :data-index="index">
            <circle
              v-for="(c, j) in lableObj[index].circle"
              :cx="c.cx"
              :cy="c.cy"
              r="4"
              :fill="item.stroke"
              stroke="transparent"
              stroke-width="8"
              :class="[
                'circle_' + index + '_' + j,
                'drag',
                'Stretch',
                item.svgFont
                  ? 'mouse--move'
                  : j % 2 === 0
                  ? 'seResize'
                  : 'neResize',
                c.animation ? c.animation : ''
              ]"
              :circle-index="j"
              :data-index="index"
              :key="'circle_' + index + '_' + j"
            ></circle>
          </g>
        </g>
      </svg>
    </div>
    <!-- <img
      v-if="baseImg"
      id="cropTestImg"
      :src="baseImg.url"
      :width="baseImg.width"
      :height="baseImg.height"
    /> -->
  </div>
</template>
<script>
export default {
  props: {
    base: {
      type: Object,
      default: null
    },
    labelText: {
      type: String,
      default: "text"
    },
    colorIndex: {
      type: Number,
      default: 0
    }
  },
  components: {},
  data() {
    return {
      lableObj: [],
      isReactLabel: true,
      // colorConfig:['yellow','cyan','magenta','springgreen','tomato','deepskyblue','orange'],
      // colorConfig:['red'],
      colorConfig: ["#525DD7", "#97183E", "#A95508", "#22894B", "#086B91"],
      pathArr: [], // 存储PathArr
      labelTagArr: [],
      baseImg: {
        width: 0,
        height: 0,
        url: "#"
      },
      // 图形操作状态
      operateingState: false,
      zomm: 0,
      // colorArr: [
      //   { color: "#525DD7", background: "#EAEBFF" },
      //   { color: "#97183E", background: "#FAE7E7" },
      //   { color: "#A95508", background: "#FFEDC3" },
      //   { color: "#22894B", background: "#DFEEE7" },
      //   { color: "#086B91", background: "#DBEFF7" },
      // ],
      dragSvg: false,
      imgLoading: false
    }
  },
  created() {
    // 图形操作状态
    // 标注状态, 操作状态
  },
  mounted() {},
  destroyed() {
    this.removeSVGEvent()
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.baseEvent()
      })
    },
    getLabelObjArr() {
      return this.lableObj
    },
    getPathArr() {
      return this.pathArr
    },
    controlDragSvg(drag) {
      if (drag) {
        this.removeSVGEvent()
        this.dragSvgEvent()
      } else {
        this.reloadBaseEvent()
      }
      this.dragSvg = drag
    },
    setImg(obj) {
      if (!obj) {
        this.baseImg = null
        return
      }
      let newBaseImag = {}
      !this.baseImg ? (this.baseImg = {}) : null
      Object.assign(newBaseImag, obj)
      // console.log(newBaseImag.url,this.baseImg.url,newBaseImag.url !== this.baseImg.url)
      if (newBaseImag.url && newBaseImag.url !== this.baseImg.url) {
        // new image loading
        if (this.baseImg.url) {
          // 第一张 无loading
          this.imgLoading = true
        }
        this.baseImg.url = newBaseImag.url
      }
      let imgSvg = document.getElementById("imgSvg")
      let imageDom = imgSvg.getElementsByTagName("image")[0]
      imageDom.onload = () => {
        this.imgLoading = false
        this.baseImg.width = newBaseImag.width
        this.baseImg.height = newBaseImag.height
      }
      if (imgSvg && imgSvg.style.transform) {
        imgSvg.style.transform = null
      }
    },
    fixImgSize(w, h, fun) {
      this.baseImg.width = w
      this.baseImg.height = h
      if (this.lableObj.length > 0) {
        if (typeof fun === "function") {
          this.fixLabelObj(fun)
        }
      }
      this.$forceUpdate()
    },
    fixLabelObj(fun) {
      //Add 移动过的path全部进行fix
      let imgSvg = document.getElementById("imgSvg")
      // 兼容移动需要
      // this.pathArr = this.pathArr.map(path=>{
      //   return path.map(point=>{
      //     if(drag){
      //       return point*1.1
      //     }else{
      //       return point/1.1
      //     }
      //   })
      // })
      this.lableObj.forEach((item, index) => {
        if (item.transformPoint) {
          this.fixTranformPosition(item, index)
          let groupSvg = imgSvg.getElementsByClassName(`group_${index}`)[0]
          groupSvg.style.transform = `translate(${0}px, ${0}px)`
        }
        item.circle.forEach(circle => {
          circle.cx = fun(circle.cx)
          circle.cy = fun(circle.cy)
        })

        this.pathArr[index] = this.pathArr[index].map(point => {
          return fun(point)
        })
        item.d = this.polygon2path(this.pathArr[index])
        if (item.shape_type === "rectangle") {
          // scale text 位置便宜问题
          // console.log(this.pathArr[index].filter((point,index)=>(index%2===0)))
          item.text.x = Math.min(
            ...this.pathArr[index].filter((point, index) => index % 2 === 0)
          )
          item.text.y =
            Math.min(
              ...this.pathArr[index].filter((point, index) => index % 2 !== 0)
            ) - 6
        } else {
          item.text.x = fun(item.text.x)
          item.text.y = fun(item.text.y)
        }
      })
      // 阶级上次事件中 一些数据缓存值 重构针对该东西优化
      if (!this.dragSvg) {
        this.reloadBaseEvent()
      }
    },
    demoInit() {
      this.setImg({
        url:
          // "https://picb.zhimg.com/v2-8551e0c88b29401e3c440598cdcf2611_1440w.jpg?source=172ae18b",
          "http://192.168.1.200:8888/group1/M00/00/02/wKgByF82U6aAbJMrAE3_cMh1y8o109.png",
        width: 1311,
        height: 937
      })
      this.init()
    },
    openOperateingState(drag) {
      // 开启 图形标注状态
      this.operateingState = drag
      if (!drag) {
        // this.$forceUpdate()
      } else {
        this.isReactLabel = true
      }
    },
    setLabelObj(obj, pathArr) {
      this.lableObj = obj
      this.pathArr = pathArr
    },
    setTransform(isallowMoveIndex) {
      let imgSvg = document.getElementById("imgSvg")
      let groupSvg = imgSvg.getElementsByClassName(
        `group_${isallowMoveIndex}`
      )[0]
      groupSvg.style.transform = `translate(${0}px, ${0}px)`
    },
    // 矩形标注
    rectangularLabel() {
      this.isReactLabel = true
    },
    // 不规则标注
    irregularLabeling() {
      this.isReactLabel = false
    },
    reloadBaseEvent() {
      let imgSvg = document.getElementById("imgSvg")

      if (!imgSvg) {
        return
      }
      imgSvg.onmousedown = null
      imgSvg.onmouseup = null
      imgSvg.onmousemove = null
      imgSvg.onmouseleave = null
      imgSvg.onmouseenter = null
      imgSvg.onclick = null
      imgSvg.ondblclick = null
      this.baseEvent()
    },
    // base Event
    baseEvent() {
      let imgSvg = document.getElementById("imgSvg")
      // 事件状态
      let isDown = false
      let isClick = false
      // 控制折现反转转变 => 简言之 控制直线是否转弯
      let isPolyline = false
      // 是否继续矩形标注
      let isGoReactLable = true
      // 可以拖动
      let isallowMove = false
      let isallowMoveIndex = 0
      let t_down_x, t_down_y
      // mouse 坐标
      let m_move_x, m_move_y, m_down_x, m_down_y, m_click_x, m_click_y
      // 矩形 属性 width height 左上角 (X,Y)
      let rectX, rectY
      // 绘制状态
      let stopDraw = false // 禁止拖拽
      let Stretch = false // 拉伸功能
      let isDoubleAutoClose = false // 双击自动闭合不规则标签
      let isStretchIndex = 0 //当前拉伸图形的 index 值
      // 监控对象变更 控制dom操作
      /*
        1. 拉伸
          Stretch 拉伸状态
          StretchX 坐标 X
          StretchY 坐标 Y
          isCricleIndex 原点位置--index
        2. 拖动
          moveTransform 上一次移动位置的存储
          startReactDraw 矩形开始勾画
          stopMoveEvent 是否move
        3. base 功能支持
          reactArr 矩形点位存储
          pointArr 不规则图形点位存储
          --- ing
      */
      let pathProxy = new Proxy(
        {},
        {
          get(target, key, receiver) {
            return Reflect.get(target, key, receiver)
          },
          set(target, key, receiver) {
            // if(key == 'd'){
            //   target[key] && path.setAttribute('d',pathProxy.d)
            // }
            return Reflect.set(target, key, receiver)
          }
        }
      )
      // let downStart = true
      // let downClickDealy = this.$helper.debounce(()=>{

      // },500)
      // 鼠标事件顺序 down=>up=>click
      imgSvg.onmousedown = () => {
        m_down_x = event.offsetX
        m_down_y = event.offsetY
        let dom = event.target,
          classList = dom.classList

        if (classList.contains("stopDraw") && !classList.contains("svgFont")) {
          stopDraw = true
          return
        }
        stopDraw = false
        // click 选中不继续
        if (
          dom.getAttribute("data-index") &&
          (this.lableObj[dom.getAttribute("data-index")].svgFont ||
            classList.contains("svgFont"))
        ) {
          isallowMove = true
          // isallowMove = false
          t_down_x = event.offsetX
          t_down_y = event.offsetY
          isallowMoveIndex = dom.getAttribute("data-index")
          return
        }
        if (classList.contains("Stretch")) {
          // 拉伸
          pathProxy.Stretch = true
          isStretchIndex = dom.getAttribute("data-index")
          pathProxy.StretchX = dom.getAttribute("cx")
          pathProxy.StretchY = dom.getAttribute("cy")
          pathProxy.isCricleIndex = dom.getAttribute("circle-index")
          // console.log(this.pathArr[isStretchIndex],isCricleIndex,dom.getAttribute('cx'),dom.getAttribute('cy'))
          Stretch = true
          if (pathProxy.startIrregular) {
            Stretch = false
          }
          return
        }
        Stretch = false
        // !isClick
        // react 操作流程 需要点击2次 结束绘画
        // 第一次点击开始绘画
        // 第二次点击结束绘画
        // 事件喜欢2次 只发生一次
        if (this.isReactLabel) {
          if (isClick) {
            isDown = false
            // 2次点击
          } else {
            //
            isDown = true
            rectX = m_down_x
            rectY = m_down_y
            // if(this.lableObj.length >=5){
            //   console.log('最多允许标注5个')
            //   isGoReactLable = false;
            //   return
            // }
            // 图形挥着开始关闭 移动状态
            isallowMove = false
            pathProxy.moveTransform = null

            pathProxy.startReactDraw = true
            pathProxy.starReactTime = +new Date()
            pathProxy.reactFirstArr = [rectX, rectY]
            this.saveLabeObj({
              d: "",
              circle: [],
              shape_type: "rectangle"
            })
          }
        }
      }
      imgSvg.onmouseup = () => {
        if (isallowMove) {
          // 更改坐标
          // 解决二次拖拽问题
          if (pathProxy.moveTransform) {
            this.lableObj[isallowMoveIndex].transformPoint = [
              pathProxy.moveTransform.x,
              pathProxy.moveTransform.y
            ]
          }
          // 认定为 移动完成
        }
        if (Stretch) {
          Stretch = false
        }
        isallowMove = false
      }
      imgSvg.onmouseleave = () => {
        if (isallowMove) {
          isallowMove = false
          if (pathProxy.moveTransform) {
            this.lableObj[isallowMoveIndex].transformPoint = [
              pathProxy.moveTransform.x,
              pathProxy.moveTransform.y
            ]
          }
        }
        pathProxy.stopMoveEvent = true
      }
      imgSvg.onmouseenter = () => {
        pathProxy.stopMoveEvent = false
      }
      imgSvg.onmousemove = () => {
        if (pathProxy.stopMoveEvent) {
          return
        }
        m_move_x = event.offsetX
        m_move_y = event.offsetY

        if (isallowMove) {
          /*
              MouseEvent.movementX 是只读属性，
              它提供了当前事件和上一个mousemove事件之间鼠标在水平方向上的移动值。
              换句话说，这个值是这样计算的 :
              currentEvent.movementX = currentEvent.screenX - previousEvent.screenX.
            */
          //  console.log(t_down_x,t_down_y)
          let transformX = m_move_x - t_down_x
          let transformY = m_move_y - t_down_y
          this.$nextTick(() => {
            // console.log(imgSvg.getElementsByClassName(`group_${isallowMoveIndex}`)[0].style.transform)
            let groupSvg = imgSvg.getElementsByClassName(
              `group_${isallowMoveIndex}`
            )[0]
            let transformPoint = this.lableObj[isallowMoveIndex].transformPoint

            if (transformPoint) {
              transformX += transformPoint[0]
              transformY += transformPoint[1]
            }

            let cxArr = this.lableObj[isallowMoveIndex].circle.map(
              item => item.cx
            )
            let cyArr = this.lableObj[isallowMoveIndex].circle.map(
              item => item.cy
            )
            let MaxX = Math.max(...cxArr)
            let MinX = Math.min(...cxArr)
            let MaxY = Math.max(...cyArr)
            let MinY = Math.min(...cyArr)
            if (MinX + transformX <= 5) {
              return
            }
            if (MaxX + transformX >= this.baseImg.width) {
              return
            }
            if (MinY + transformY - 22 <= 5) {
              return
            }
            if (MaxY + transformY >= this.baseImg.height) {
              return
            }
            // 拖拽边界限制
            pathProxy.moveTransform = {
              x: transformX,
              y: transformY
            }
            groupSvg.style.transform = `translate(${transformX}px, ${transformY}px)`
          })

          return
        }
        if (Stretch) {
          /*
          1. 区分是否为矩形
          2. 利用一个跟随鼠标的原点 对角线点勾画
          3. 多边形勾画单独一个点
          */
          // 解决  transformX isallowMove  拉伸不纯准确的问题 fix位置
          let currLabelObj = this.lableObj[isStretchIndex]
          if (currLabelObj.transformPoint) {
            this.fixTranformPosition(currLabelObj, isStretchIndex)
            pathProxy.moveTransform = null
            // fix border tranform
            let groupSvg = imgSvg.getElementsByClassName(
              `group_${isStretchIndex}`
            )[0]
            groupSvg.style.transform = `translate(${0}px, ${0}px)`
          }
          let pathIndex = pathProxy.isCricleIndex * 2
          let pathArr_item = this.pathArr[isStretchIndex]
          if (currLabelObj["shape_type"] === "rectangle") {
            /*
              矩形拖拽 对角线的点不变
              由：      clircle (index*2) reactArr
                x1,y1;    0                 0,1
                x2,y2;    1                 2,3
                x3,y3;    2                 4,5
                x4,y4;    3                 6,7

                x1 = x2; y1 = y4;
                x3 = x4; y2 = y3;
              得：          diagonal
                  0:[2,7], 4
                  2:[0,5], 6
                  4:[6,3], 0
                  6:[4,1], 2
            */
            let realChangeObj = {
                0: [2, 7],
                2: [0, 5],
                4: [6, 3],
                6: [4, 1]
              },
              diagonal = {
                0: 4,
                2: 6,
                4: 0,
                6: 2
              }
            pathArr_item[realChangeObj[pathIndex][0]] = m_move_x
            pathArr_item[realChangeObj[pathIndex][1]] = m_move_y
            pathArr_item[pathIndex] = m_move_x
            pathArr_item[pathIndex + 1] = m_move_y

            let textX = pathArr_item[0]
            let textY = pathArr_item[1]
            /* 解决绘制过程中发生 move text坐标出现偏差 */
            // let diagonalX = pathProxy.reactArr[4]
            // let diagonalY = pathProxy.reactArr[3]
            let diagonalX = pathArr_item[diagonal[pathIndex]]
            let diagonalY = pathArr_item[diagonal[pathIndex] + 1]
            if (textX > diagonalX) {
              if (textY > diagonalY) {
                textX = diagonalX
                textY = diagonalY
              } else {
                // 变X
                textX = diagonalX
              }
            } else {
              // 无论上下 变Y
              if (textY > diagonalY) {
                textY = diagonalY
              }
            }
            this.lableObj[isStretchIndex].text.x = textX
            this.lableObj[isStretchIndex].text.y = textY - 6
            this.lableObj[isStretchIndex].circle = pathArr_item
              .map((point, index, arr) => {
                if (index % 2 === 0) {
                  return {
                    cx: arr[index],
                    cy: arr[index + 1]
                  }
                }
                return null
              })
              .filter(circle => circle)

            this.lableObj[isStretchIndex].d = this.polygon2path(pathArr_item)
          } else {
            pathArr_item[pathIndex] = m_move_x
            pathArr_item[pathIndex + 1] = m_move_y
            if (pathIndex === 0) {
              let l = pathArr_item.length
              pathArr_item[l - 2] = m_move_x
              pathArr_item[l - 1] = m_move_y
              this.lableObj[isStretchIndex].text.x = m_move_x
              this.lableObj[isStretchIndex].text.y = m_move_y
            }
            this.lableObj[isStretchIndex].circle[
              pathProxy.isCricleIndex
            ].cx = m_move_x
            this.lableObj[isStretchIndex].circle[
              pathProxy.isCricleIndex
            ].cy = m_move_y
          }
          this.lableObj[isStretchIndex].d = this.polygon2path(pathArr_item)
          return
        }
        if (this.isReactLabel && isDown && isGoReactLable) {
          //需要注意矩形画图的四个放行
          // svg矩形开始的点位 永远左上角的点位
          // 思路参考田字格
          //经过各种情况测试 建议试用不规则图形绘制矩形
          // x,y x,y1, x1,y1, x1,y
          pathProxy.reactArr = [
            rectX,
            rectY,
            rectX,
            m_move_y,
            m_move_x,
            m_move_y,
            m_move_x,
            rectY
          ]
          // console.log(pathProxy.reactArr)
          this.fixLabelObjPath(`${this.polygon2path(pathProxy.reactArr)}`)

          return
        }
        if (this.isReactLabel) {
          return
        }
        // 不规则图形绘画
        if (isClick) {
          if (!pathProxy.pointArr) {
            pathProxy.pointArr = [m_click_x, m_click_y, m_move_x, m_move_y]
          } else {
            //是否有园
            if (isPolyline) {
              pathProxy.pointArr.push(m_move_x, m_move_y)
              isPolyline = false
            } else {
              let l = pathProxy.pointArr.length
              pathProxy.pointArr[l - 1] = m_move_y
              pathProxy.pointArr[l - 2] = m_move_x
            }
            /*
              move到可点击闭合的区域 出现闪烁
            */
            let area = 10 //重复范围
            //  最后一次结束 画图
            let isLast = false
            // 超过3个点需要判读是否闭合 结束该不规则的多边形
            if (pathProxy.circlePointArr.length >= 3) {
              let element = pathProxy.circlePointArr[0]
              let absx = [element[0] - area, element[0] + area]
              let absy = [element[1] - area, element[1] + area]
              if (
                m_move_x >= absx[0] &&
                m_move_x <= absx[1] &&
                m_move_y >= absy[0] &&
                m_move_y <= absy[1]
              ) {
                isLast = true
              }
            }
            if (isLast) {
              let lastL = this.lableObj.length - 1
              let circle = this.lableObj[lastL]["circle"]
              circle[0].animation = `text_animation--${this.colorIndex + 1}`
            }
            /*
              闪烁 ---end
            */
          }
          this.fixLabelObjPath(`${this.polyline2path(pathProxy.pointArr)}`)
        }
      }
      imgSvg.onclick = () => {
        m_click_x = event.offsetX
        m_click_y = event.offsetY
        let dom = event.target,
          classList = dom.classList

        if (classList.contains("svg-icon--close--path")) {
          let index = dom.getAttribute("p-id")
          this.delOneLabelObj(index)
          return
        }
        // click 选中不继续
        if (
          dom.getAttribute("data-index") &&
          this.lableObj[dom.getAttribute("data-index")].svgFont
        ) {
          return
        }

        // if(classList.contains('stopDraw') || stopDraw){
        // 不能继续绘图
        if (classList.contains("svgFont")) {
          return
        }
        // return
        // }
        if (isallowMove) {
          return
        }

        if (this.isReactLabel && !stopDraw && pathProxy.startReactDraw) {
          if (!isGoReactLable) {
            //矩形不在继续
            return
          }
          // 从矩形开始到结束使用 500ms 时间差控制 500ms 的时间查控制
          if (!isClick) {
            isClick = true
          } else {
            // 关闭 move 事件
            // 消除move 坐标对最后生成
            // 无效绘制矩形问题
            pathProxy.startReactDraw = false
            if (!pathProxy.reactArr) {
              // 首次勾画没有 无效
              this.lableObj.splice(this.lableObj.length - 1, 1)
              isClick = false
              return
            }
            // 在此勾画矩形无效 经测试该方法不准
            let oldReact = this.pathArr[this.pathArr.length - 1]
            if (oldReact) {
              if (oldReact.toString() === pathProxy.reactArr.toString()) {
                // 无效勾画 需要回撤 状态 删除变量数据
                this.lableObj.splice(this.lableObj.length - 1, 1)
                isClick = false
                return
              }
            }
            // 时间差距 失败 使用时间差
            // console.log(+new Date() - pathProxy.starReactTime)
            if (+new Date() - pathProxy.starReactTime < 250) {
              this.lableObj.splice(this.lableObj.length - 1, 1)
              isClick = false
              return
            }
            pathProxy.stopMoveEvent = true
            pathProxy.reactArr.forEach((element, index, arr) => {
              if (index % 2 === 0) {
                this.addLabelCricle({
                  cx: arr[index],
                  cy: arr[index + 1]
                })
              }
            })
            //是否进入图片操作状态
            if (!this.operateingState) {
              // pathProxy.reactArr = [rectX,rectY,rectX,m_move_y,m_move_x,m_move_y,m_move_x,rectY]
              let textX = rectX
              let textY = rectY
              /* 解决绘制过程中发生 move text坐标出现偏差 */
              let m_move_x = pathProxy.reactArr[4]
              let m_move_y = pathProxy.reactArr[3]
              if (rectX > m_move_x) {
                if (rectY > m_move_y) {
                  textX = m_move_x
                  textY = m_move_y
                } else {
                  // 变X
                  textX = m_move_x
                }
              } else {
                // 无论上下 变Y
                if (rectY > m_move_y) {
                  textY = m_move_y
                }
              }
              this.addLabelObjText({
                x: textX,
                y: textY - 6,
                txt: this.labelText
              })
            }
            if (this.operateingState) {
              this.$emit("cropImg")
            }
            this.savePathd(pathProxy.reactArr)
            pathProxy.stopMoveEvent = false
            isClick = false
          }
          return
        }
        if (this.isReactLabel) {
          return
        }
        // 多边形
        if (!isClick) {
          // if(this.lableObj.length >=5){
          //   console.log('最多允许标注5个')
          //   return
          // }
          if (pathProxy.Stretch) {
            pathProxy.Stretch = false
            return
          }
          pathProxy.startIrregular = true
          // 图形挥着开始关闭 移动状态
          isallowMove = false
          pathProxy.moveTransform = null

          pathProxy.circlePointArr = [[m_click_x, m_click_y]]
          isClick = true

          this.saveLabeObj({
            d: "",
            circle: [
              {
                cx: m_click_x,
                cy: m_click_y
              }
            ],
            shape_type: "polygon"
          })
        } else {
          //  非第一次点击
          //  避免重复的点
          let area = 10 //重复范围
          //  最后一次结束 画图
          let isLast = false
          // 超过3个点需要判读是否闭合 结束该不规则的多边形
          isDoubleAutoClose = true
          if (pathProxy.circlePointArr.length >= 3) {
            let element = pathProxy.circlePointArr[0]
            let absx = [element[0] - area, element[0] + area]
            let absy = [element[1] - area, element[1] + area]
            if (
              m_click_x >= absx[0] &&
              m_click_x <= absx[1] &&
              m_click_y >= absy[0] &&
              m_click_y <= absy[1]
            ) {
              isLast = true
            }
          }
          if (isLast) {
            // 最后一个点变成第一个点
            if (pathProxy.Stretch) {
              pathProxy.Stretch = false
            }
            isDoubleAutoClose = false
            pathProxy.startIrregular = false
            let l = pathProxy.pointArr.length
            pathProxy.pointArr[l - 1] = pathProxy.pointArr[1]
            pathProxy.pointArr[l - 2] = pathProxy.pointArr[0]
            // 增加是因为接下来他要为null
            this.fixLabelObjPath(`${this.polygon2path(pathProxy.pointArr)}`)
            // this.saveLabelTagArr({
            //   style:{
            //     left: pathProxy.pointArr[0],
            //     top: pathProxy.pointArr[1]
            //   },
            //   text: 'faoiwq'
            // })
            this.addLabelObjText({
              x: pathProxy.pointArr[0],
              y: pathProxy.pointArr[1],
              txt: this.labelText
            })
            // let lastL = this.lableObj.length - 1
            // let circle = this.lableObj[lastL]['circle']
            // circle[0].animation = `text_animation--${this.colorIndex+1}`
            this.savePathd(pathProxy.pointArr)
            // 清楚所有的状态
            pathProxy.pointArr = null
            isClick = false
          } else {
            let isGoCircle = true
            // console.log(m_click_x,m_click_y)
            // +-10 区间内无效点击
            for (let i = 0; i < pathProxy.circlePointArr.length; i++) {
              let element = pathProxy.circlePointArr[i]
              let absx = [element[0] - area, element[0] + area]
              let absy = [element[1] - area, element[1] + area]
              if (
                m_click_x >= absx[0] &&
                m_click_x <= absx[1] &&
                m_click_y >= absy[0] &&
                m_click_y <= absy[1]
              ) {
                isGoCircle = false
              }
            }
            pathProxy.isAutoDelCircle = false
            // 原点在不在误差范围之内
            if (isGoCircle) {
              isPolyline = true
              pathProxy.isAutoDelCircle = true
              // g.appendChild(newCircle)
              this.addLabelCricle({
                cx: m_click_x,
                cy: m_click_y
              })
              pathProxy.circlePointArr.push([m_click_x, m_click_y])
            }
          }
        }
      }
      // 不规则图形 双击自动闭合
      imgSvg.ondblclick = () => {
        let dom = event.target,
          classList = dom.classList
        if (classList.contains("svgFont")) {
          // 文本点击 修改path fill 与 fill-opacity
          let index = dom.parentNode.getAttribute("data-index")
          let item = this.lableObj[index]
          let { stroke } = item
          if (!item.svgFont) {
            item.svgFont = true
            item.fill = stroke
            item["fill-opacity"] = "0.75"
            if (!item.text.svgCloseStyle) {
              this.addClose(item.text, index)
            }
          } else {
            item.svgFont = false
            item.fill = "none"
            item["fill-opacity"] = "0"
          }
          this.$emit("setBtnState", this.lableObj)
          return
        }
        if (!isDoubleAutoClose) {
          return
        }
        if (isDoubleAutoClose && pathProxy.circlePointArr.length >= 3) {
          // let l = pathProxy.pointArr.length
          let lastL = this.lableObj.length - 1
          let circle = this.lableObj[lastL]["circle"]
          if (pathProxy.isAutoDelCircle) {
            circle.pop()
            pathProxy.circlePointArr.pop()
            console.log(circle, "del")
          }
          // circle[0].animation = `text_animation--${this.colorIndex+1}`
          pathProxy.pointArr.push(pathProxy.pointArr[0])
          pathProxy.pointArr.push(pathProxy.pointArr[1])
          // 增加是因为接下来他要为null
          this.fixLabelObjPath(`${this.polygon2path(pathProxy.pointArr)}`)
          this.addLabelObjText({
            x: pathProxy.pointArr[0],
            y: pathProxy.pointArr[1],
            txt: this.labelText
          })
          this.savePathd(pathProxy.pointArr)
          // 清楚所有的状态
          pathProxy.pointArr = null
          isClick = false
          isDoubleAutoClose = false
          pathProxy.startIrregular = false
          pathProxy.Stretch = false
        }
      }
    },
    removeSVGEvent() {
      let imgSvg = document.getElementById("imgSvg")
      if (!imgSvg) {
        return
      }
      imgSvg.onmousedown = null
      imgSvg.onmouseup = null
      imgSvg.onmousemove = null
      imgSvg.onmouseleave = null
      imgSvg.onmouseenter = null
      imgSvg.onclick = null
      imgSvg.ondblclick = null
    },
    // drag svg
    dragSvgEvent() {
      //鉴于 base 中操作过多 现进行事件的重新绑定进行功能状态分离
      let imgSvg = document.getElementById("imgSvg")
      let m_down_x,
        m_down_y,
        m_move_y,
        m_move_x,
        isMove = false
      let saveTransform = {
        x: 0,
        y: 0
      }
      imgSvg.onmousedown = () => {
        m_down_x = event.offsetX
        m_down_y = event.offsetY
        isMove = true
        // console.log(event)
      }
      imgSvg.onmousemove = () => {
        if (!isMove) {
          return
        }
        m_move_x = event.offsetX
        m_move_y = event.offsetY
        let transformX = m_move_x - m_down_x
        let transformY = m_move_y - m_down_y
        transformX += saveTransform.x
        transformY += saveTransform.y
        saveTransform = {
          x: transformX,
          y: transformY
        }
        imgSvg.style.transform = `translate(${transformX}px, ${transformY}px)`
      }
      imgSvg.onmouseup = () => {
        isMove = false
      }
      imgSvg.onmouseleave = () => {
        isMove = false
      }
    },
    //
    // 自定义svg组 g
    saveLabeObj(item) {
      // 校验标注对象
      let colorConfig = this.colorConfig
      // let stroke = colorConfig[Math.floor(Math.random() * colorConfig.length)];
      // colorConfig.splice(colorConfig.indexOf(stroke),1);
      let stroke = colorConfig[this.colorIndex]
      item.stroke = stroke
      item["fill-opacity"] = "0"
      item["fill"] = "none"
      this.lableObj.push(item)
    },
    // 修改对应path
    fixLabelObjPath(d) {
      this.lableObj[this.lableObj.length - 1]["d"] = d
    },
    // 增加标注文字
    addLabelObjText(item) {
      this.lableObj[this.lableObj.length - 1]["text"] = item
      this.$nextTick(() => {
        this.addClose(item, this.lableObj.length - 1)
      })
    },
    addClose(item, index) {
      let imgSvg = document.getElementById("imgSvg")
      let groupSvg = imgSvg.getElementsByClassName(`group_${index}`)[0]
      let textBox = groupSvg.getElementsByTagName("text")[0].getBBox()
      let svgCloseStyle = groupSvg.getElementsByClassName("svg-icon--close")[0]
      item.svgCloseStyle = {
        x: Math.floor(textBox.x + textBox.width),
        y: textBox.y
      }
      this.lableObj[index]["text"] = item
      // svgCloseStyle.style.display = `unset`;
      svgCloseStyle.style.transform = `translate(${item.svgCloseStyle.x}px, ${item.svgCloseStyle.y}px)`
    },
    delOneLabelObj(index) {
      this.lableObj.splice(index, 1)
      this.pathArr.splice(index, 1)
    },
    // 文字存储
    saveLabelTagArr(item) {
      this.labelTagArr.push(item)
    },
    // 添加新的原点
    addLabelCricle(item) {
      this.lableObj[this.lableObj.length - 1]["circle"].push(item)
    },
    // 存储SVG Path的 d
    savePathd(arr) {
      this.pathArr.push(arr)
    },
    // del All label
    delLabel(filter) {
      //filter 是否删除选中
      if (filter) {
        let arr = []
        this.lableObj.forEach((element, index) => {
          if (element.svgFont) {
            arr.push(index)
          }
        })
        this.lableObj = this.lableObj.filter(
          (item, index) => !(arr.indexOf(index) > -1)
        )
        this.pathArr = this.pathArr.filter(
          (item, index) => !(arr.indexOf(index) > -1)
        )
      } else {
        this.lableObj = []
        this.pathArr = []
      }
      this.labelTagArr = []
      // this.colorConfig = ['yellow','cyan','magenta','springgreen','tomato','deepskyblue','orange']
      this.reloadBaseEvent()
      // this.$emit('setBtnState')
    },
    // fix tranformlabel position
    fixTranformPosition(item, index) {
      let obj = item
      let path = this.mapTraformPath(obj)
      item.d = path.d
      item.circle = path.circle
      item.text = this.mapTraformText(obj, index)
      item.transformPoint = null
      this.pathArr[index] = path.path
    },
    fixSvgCloseTag(index, svgCloseStyle) {
      // fix close tranform
      let imgSvg = document.getElementById("imgSvg")
      let groupSvg = imgSvg.getElementsByClassName(`group_${index}`)[0]
      let closeDom = groupSvg.getElementsByClassName("svg-icon--close")[0]
      closeDom.style.transform = `translate(${svgCloseStyle.x}px, ${svgCloseStyle.y}px)`
    },
    mapTraformText(obj) {
      let { text, transformPoint } = obj
      text.x += transformPoint[0]
      text.y += transformPoint[1]
      if (text.svgCloseStyle) {
        text.svgCloseStyle.x += transformPoint[0]
        text.svgCloseStyle.y += transformPoint[1]
        // this.fixSvgCloseTag(index,text.svgCloseStyle)
      }
      return text
    },
    mapTraformPath(obj) {
      let { transformPoint, circle } = obj
      let arr = circle.map(item => [
        item.cx + transformPoint[0],
        item.cy + transformPoint[1]
      ])
      circle = arr.map(element => ({ cx: element[0], cy: element[1] }))
      let arrOne = [].concat.apply([], arr)
      return {
        circle,
        d: this.polygon2path(arrOne),
        path: arrOne
      }
    },
    /* svg base 方法 */
    // 创建svg 标签
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
    },
    //折线转换
    polyline2path(points) {
      var path =
        "M" + points.slice(0, 2).join(" ") + "L" + points.slice(2).join(" ")
      return path
    },
    // 多边形转换
    polygon2path(points) {
      var path =
        "M" +
        points.slice(0, 2).join(" ") +
        "L" +
        points.slice(2).join(" ") +
        "z"
      return path
    },
    // 直线
    line2Path(x1, y1, x2, y2) {
      if (isNaN(x1 - y1 + x2 - y2)) return
      x1 = x1 || 0
      y1 = y1 || 0
      x2 = x2 || 0
      y2 = y2 || 0
      var path = "M" + x1 + " " + y1 + "L" + x2 + " " + y2
      return path
    },
    //矩形转path
    rect2path(x, y, width, height, rx, ry) {
      /* * rx 和 ry 的规则是： * 1. 如果其中一个设置为 0 则圆角不生效 * 2. 如果有一个没有设置则取值为另一个 */
      rx = rx || ry || 0
      ry = ry || rx || 0
      //非数值单位计算，如当宽度像100%则移除
      if (isNaN(x - y + width - height + rx - ry)) return
      rx = rx > width / 2 ? width / 2 : rx
      ry = ry > height / 2 ? height / 2 : ry
      //如果其中一个设置为 0 则圆角不生效
      var path = ""
      if (0 == rx || 0 == ry) {
        // var path =
        // 'M' + x + ' ' + y +
        // 'H' + (x + width) + 不推荐用绝对路径，相对路径节省代码量
        // 'V' + (y + height) +
        // 'H' + x +
        // 'z';
        path =
          "M" + x + " " + y + "h" + width + "v" + height + "h" + -width + "z"
      } else {
        path =
          "M" +
          x +
          " " +
          (y + ry) +
          "a" +
          rx +
          " " +
          ry +
          " 0 0 1 " +
          rx +
          " " +
          -ry +
          "h" +
          (width - rx - rx) +
          "a" +
          rx +
          " " +
          ry +
          " 0 0 1 " +
          rx +
          " " +
          ry +
          "v" +
          (height - ry - ry) +
          "a" +
          rx +
          " " +
          ry +
          " 0 0 1 " +
          -rx +
          " " +
          ry +
          "h" +
          (rx + rx - width) +
          "a" +
          rx +
          " " +
          ry +
          " 0 0 1 " +
          -rx +
          " " +
          -ry +
          "z"
      }
      return path
    },
    getImgNaturalDimensions(img, callback) {
      var nWidth, nHeight
      if (img.naturalWidth) {
        // 现代浏览器
        nWidth = img.naturalWidth
        nHeight = img.naturalHeight
      } else {
        // IE6/7/8
        let image = new Image()
        image.src = img.src
        image.onload = function() {
          callback(image.width, image.height)
        }
      }
      return [nWidth, nHeight]
    }
    /*
    // 裁剪 抠图 旋转 弃用
    fnImageCropRot(){
      //当前显示图片的高度和宽度
      var baseImg = this.baseImg
      var ID = (id)=>(document.getElementById(id));
      var o = ID('cropTestImg')
      var getCss = (o,key) =>{
        return o.currentStyle? o.currentStyle[key] : document.defaultView.getComputedStyle(o,false)[key];
      };
      var iCurWidth = baseImg.width
          , iCurHeight = baseImg.height
      //获取实际图片的高宽
      var oCreateImg = new Image();
          oCreateImg.src = o.src;
      var iOrigWidth = oCreateImg.width, iOrigHeight = oCreateImg.height;
      if(iCurWidth && iOrigWidth){//如果宽度为不为0 - 意味着加载成功
        //计算当前与实际的纵横比
        var scaleX = iCurWidth / iOrigWidth;
        var scaleY = iCurHeight / iOrigHeight;
        //创建包裹div
        var oRelDiv = document.createElement("div");
        oRelDiv.style.position = "absolute";
        oRelDiv.style.width = iCurWidth + "px";
        oRelDiv.style.height = iCurHeight + 30 + "px";
        oRelDiv.style.top = "30px";
        o.parentNode.insertBefore(oRelDiv, o);
        //初始化坐标与剪裁高宽
        var cropW = 80, cropH = 80;
        var posX = (iCurWidth - cropW)/2, posY = (iCurHeight - cropH)/2;
        var sInnerHtml = '<div id="zxxCropBox" style="height:'+cropH+'px; width:'+cropW+'px; position:absolute; left:'+posX+'px; top:'+posY+'px; border:1px solid black;"><div id="zxxDragBg" style="height:100%; background:white; opacity:0.3; filter:alpha(opacity=30); cursor:move;"></div><div id="dragLeftTop" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; top:-3px; cursor:nw-resize;"></div><div id="dragLeftBot" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; bottom:-3px; cursor:sw-resize;"></div><div id="dragRightTop" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; top:-3px; cursor:ne-resize;"></div><div id="dragRightBot" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; bottom:-3px; cursor:se-resize;"></div><div id="dragTopCenter" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; top:-3px; left:50%; margin-left:-3px; cursor:n-resize;"></div><div id="dragBotCenter" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; bottom:-3px; left:50%; margin-left:-3px; cursor:s-resize;"></div><div id="dragRightCenter" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; right:-3px; top:50%; margin-top:-3px; cursor:e-resize;"></div><div id="dragLeftCenter" style="position:absolute; width:4px; height:4px; border:1px solid #000; background:white; overflow:hidden; left:-3px; top:50%; margin-top:-3px; cursor:w-resize;"></div></div><input type="hidden" id="cropPosX" value="'+posX/scaleX+'" /><input type="hidden" id="cropPosY" value="'+posY/scaleY+'" /><input type="hidden" id="cropImageWidth" value="'+cropW/scaleX+'" /><input type="hidden" id="cropImageHeight" value="'+cropH/scaleY+'" />';
        oRelDiv.innerHTML = sInnerHtml;
      console.log(oRelDiv)

        //拖拽与拉伸方法
        //拖拽拉伸所需参数
        var params = {
          left: 0,
          top: 0,
          width:0,
          height:0,
          currentX: 0,
          currentY: 0,
          flag: false,
          kind: "drag"
        };
        var startDrag = function(point, target, kind){
          //point是拉伸点，target是被拉伸的目标，其高度及位置会发生改变
          //此处的target与上面拖拽的target是同一目标，故其params.left,params.top可以共用，也必须共用
          //初始化宽高
          params.width = getCss(target, "width");
          params.height = getCss(target, "height");
          //初始化坐标
          if(getCss(target, "left") !== "auto"){
            params.left = getCss(target, "left");
          }
          if(getCss(target, "top") !== "auto"){
            params.top = getCss(target, "top");
          }
          //target是移动对象
          point.onmousedown = function(event){
            params.kind = kind;
            params.flag = true;
            if(!event){
              event = window.event;
            }
            var e = event;
            params.currentX = e.clientX;
            params.currentY = e.clientY;
            //防止IE文字选中，有助于拖拽平滑
            point.onselectstart = function(){
              return false;
            }
          };
          document.onmouseup = function(){
            params.flag = false;
            if(getCss(target, "left") !== "auto"){
              params.left = getCss(target, "left");
            }
            if(getCss(target, "top") !== "auto"){
              params.top = getCss(target, "top");
            }
            params.width = getCss(target, "width");
            params.height = getCss(target, "height");

            //给隐藏文本框赋值
            posX = parseInt(target.style.left);
            posY = parseInt(target.style.top);
            cropW = parseInt(target.style.width);
            cropH = parseInt(target.style.height);
            if(posX < 0){
              posX = 0;
            }
            if(posY < 0){
              posY = 0;
            }
            if((posX + cropW) > iCurWidth){
              cropW = iCurWidth - posX;
            }
            if((posY + cropH) > iCurHeight){
              cropH = iCurHeight - posY;
            }
            //比例计算
            posX = posX / scaleX;
            posY /= scaleY;
            cropW /= scaleX;
            cropH /= scaleY;
            //赋值
            ID("cropPosX").value = posX;
            ID("cropPosY").value = posY;
            ID("cropImageWidth").value = cropW;
            ID("cropImageHeight").value = cropH;
          };
          document.onmousemove = function(event){
            var e = event ? event: window.event;
            if(params.flag){
              var nowX = e.clientX, nowY = e.clientY;
              var disX = nowX - params.currentX, disY = nowY - params.currentY;
              if(params.kind === "n"){
                //上拉伸
                //高度增加或减小，位置上下移动
                target.style.top = parseInt(params.top) + disY + "px";
                target.style.height = parseInt(params.height) - disY + "px";
              }else if(params.kind === "w"){//左拉伸
                target.style.left = parseInt(params.left) + disX + "px";
                target.style.width = parseInt(params.width) - disX + "px";
              }else if(params.kind === "e"){//右拉伸
                target.style.width = parseInt(params.width) + disX + "px";
              }else if(params.kind === "s"){//下拉伸
                target.style.height = parseInt(params.height) + disY + "px";
              }else if(params.kind === "nw"){//左上拉伸
                target.style.left = parseInt(params.left) + disX + "px";
                target.style.width = parseInt(params.width) - disX + "px";
                target.style.top = parseInt(params.top) + disY + "px";
                target.style.height = parseInt(params.height) - disY + "px";
              }else if(params.kind === "ne"){//右上拉伸
                target.style.top = parseInt(params.top) + disY + "px";
                target.style.height = parseInt(params.height) - disY + "px";
                //右
                target.style.width = parseInt(params.width) + disX + "px";
              }else if(params.kind === "sw"){//左下拉伸
                target.style.left = parseInt(params.left) + disX + "px";
                target.style.width = parseInt(params.width) - disX + "px";
                //下
                target.style.height = parseInt(params.height) + disY + "px";
              }else if(params.kind === "se"){//右下拉伸
                target.style.width = parseInt(params.width) + disX + "px";
                target.style.height = parseInt(params.height) + disY + "px";
              }else{//移动
                target.style.left = parseInt(params.left) + disX + "px";
                target.style.top = parseInt(params.top) + disY + "px";
              }
            }
          }
        }
        //绑定拖拽
        startDrag(ID("zxxDragBg"),ID("zxxCropBox"),"drag");
        //绑定拉伸
        startDrag(ID("dragLeftTop"),ID("zxxCropBox"),"nw");
        startDrag(ID("dragLeftBot"),ID("zxxCropBox"),"sw");
        startDrag(ID("dragRightTop"),ID("zxxCropBox"),"ne");
        startDrag(ID("dragRightBot"),ID("zxxCropBox"),"se");
        startDrag(ID("dragTopCenter"),ID("zxxCropBox"),"n");
        startDrag(ID("dragBotCenter"),ID("zxxCropBox"),"s");
        startDrag(ID("dragRightCenter"),ID("zxxCropBox"),"e");
        startDrag(ID("dragLeftCenter"),ID("zxxCropBox"),"w");
      }
    }
    */
  },
  watch: {
    lableObj(val) {
      if (val) {
        this.$emit("setBtnState", val)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.v-boderbase {
  position: relative;
  #imgSvg {
    position: relative;
    align-self: center;
    justify-self: center;
    image {
      display: block;
    }
  }
  .svg-wrapper {
    width: 100%;
    overflow: auto;
    height: 100%;
    display: grid;
  }
  .svgFont {
    font-weight: bold;
    user-select: none;
    fill: #000;
    cursor: pointer;
  }
  .stopDraw {
    cursor: pointer;
  }
  .crosshair {
    cursor: crosshair;
  }
  .pointer {
    cursor: pointer;
  }
  .openfixImg {
    position: relative;
    .imgDiv-wrapper {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  .seResize {
    cursor: se-resize;
  }
  .neResize {
    cursor: ne-resize;
  }
  .mouse--move {
    cursor: move;
  }
}
</style>
<style lang="scss">
@mixin animationColor($color, $index) {
  animation: blink_#{$index} 1s 2;
  @keyframes blink_#{$index} {
    50% {
      fill: $color;
      r: 8;
    }
  }
}
@each $index,
  $color in (1: #525dd7, 2: #97183e, 3: #a95508, 4: #22894b, 5: #086b91)
{
  .text_animation--#{$index} {
    @include animationColor($color, $index);
  }
}
</style>
