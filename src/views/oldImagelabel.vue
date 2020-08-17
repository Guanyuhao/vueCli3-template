<template>
  <div class="demo">
    <el-row class="image-warpper">
      <borderBase
        ref="borderBase"
        @cropImg="corpImg"
        @setBtnState="setBtnState"
      ></borderBase>
    </el-row>
    <el-row>
      <el-button type="default" @click="switchGrap(true)">矩形</el-button>
      <el-button type="default" @click="switchGrap(false)">不规则</el-button>
      <el-button type="info" :disabled="true">旋转</el-button>
      <el-button type="info" :disabled="true" @click="corp(true)"
        >裁剪</el-button
      >
      <el-button type="info" :disabled="true" @click="cutOut(true)"
        >抠图</el-button
      >
      <el-button type="primary" @click="moveSvg()">{{
        !dragSvg ? "开启移动" : "关闭移动"
      }}</el-button>
      <el-button type="success" @click="zoom()">放大</el-button>
      <el-button type="danger" @click="restZoom()">恢复</el-button>
      <el-button type="warning" @click="zoomOut()">缩小</el-button>
      <el-input placeholder="请输入内容" v-model="imgScale" :disabled="true">
      </el-input>
    </el-row>
  </div>
</template>
<script>
import borderBase from "@/components/oldImagelabel/borderBase"

export default {
  layout: "default",
  components: {
    borderBase
  },
  data() {
    return {
      cropDel: false,
      bottomList: [
        {
          width: 700,
          height: 700,
          url:
            "https://picb.zhimg.com/v2-8551e0c88b29401e3c440598cdcf2611_1440w.jpg?source=172ae18b"
        }
      ],
      activeIndex: 0,
      zoomScale: 0,
      btnState: {
        del: false,
        all: false
      },
      initEventEmitter: null,
      dragSvg: false
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.initBorderBase()
  },
  computed: {
    imgScale() {
      return this.zoomScale + "%"
    }
  },
  methods: {
    init() {
      this.componentsManagement()
    },
    componentsManagement() {
      //观察者
      this.initEventEmitter = {
        _events: {},
        subscribe(event, callback) {
          if (!this._events[event]) {
            this._events[event] = []
          }
          this._events[event].push(callback)
        },
        unSubscribe(event) {
          if (this._events && this._events[event]) {
            delete this._events[event]
          }
        },
        dispatch(event, ...arg) {
          if (!this._events[event]) {
            return
          }
          let i
          for (i = 0; i < this._events[event].length; i++) {
            this._events[event][i](...arg)
          }
        }
      }
      // 图片拖动跨组件通信
      this.initEventEmitter.subscribe("OPEN_DRAG--svg", () => {
        this.$refs.borderBase.controlDragSvg(true)
      })
      this.initEventEmitter.subscribe("CLOSE_DRAG--svg", () => {
        this.$refs.borderBase.controlDragSvg(false)
      })
    },
    initBorderBase() {
      this.$refs.borderBase.demoInit()
    },
    switchGrap(drag) {
      drag
        ? this.$refs.borderBase.rectangularLabel()
        : this.$refs.borderBase.irregularLabeling()
    },
    corp() {
      this.delLabel()
      this.$refs.borderBase.openOperateingState(true)
    },
    corpImg() {
      // let labelObj = this.getLabelArr()
    },
    getLabelArr() {
      return this.$refs.borderBase.getLabelObjArr()
    },
    delLabel() {
      this.$refs.borderBase.delLabel()
    },
    setBtnState(obj) {
      if (obj.length > 0) {
        this.btnState.all = true
      } else {
        this.btnState.del = false
        this.btnState.all = false
        return
      }
      if (obj.filter(item => item.svgFont).length > 0) {
        this.btnState.del = true
      } else {
        this.btnState.del = false
      }
    },
    zoomOut() {
      let item = this.bottomList[this.activeIndex]
      let dom = this.$refs.borderBase
      if (item.width < 200) {
        return
      }
      //
      item.width = Math.round((item.width / 11) * 10)
      item.height = Math.round((item.height / 11) * 10)
      dom.fixImgSize(item.width, item.height, num =>
        Math.round((num / 11) * 10)
      )
      this.zoomScale -= 10
    },
    full() {
      console.log("full")
      this.orcFull = !this.orcFull
      this.$refs.llpLabel.hideLeft()
    },
    zoom() {
      let item = this.bottomList[this.activeIndex]
      let dom = this.$refs.borderBase
      if (item.width > 3000) {
        return
      }
      item.width = Math.round((item.width * 11) / 10)
      item.height = Math.round((item.height * 11) / 10)
      dom.fixImgSize(item.width, item.height, num =>
        Math.round((num * 11) / 10)
      )
      this.zoomScale += 10
    },
    restZoom() {
      let item = this.bottomList[this.activeIndex]
      let dom = this.$refs.borderBase
      let count = Math.abs(this.zoomScale / 10)
      let scale = Math.pow(11, count)
      if (this.zoomScale > 0) {
        item.width = Math.round((item.width / scale) * Math.pow(10, count))
        item.height = Math.round((item.height / scale) * Math.pow(10, count))
        dom.fixImgSize(item.width, item.height, num =>
          Math.round((num / scale) * Math.pow(10, count))
        )
        this.zoomScale = 0
      } else if (this.zoomScale < 0) {
        item.width = Math.round((item.width * scale) / Math.pow(10, count))
        item.height = Math.round((item.height * scale) / Math.pow(10, count))
        dom.fixImgSize(item.width, item.height, num =>
          Math.round((num * scale) / Math.pow(10, count))
        )
        this.zoomScale = 0
      }
    },
    moveSvg() {
      this.dragSvg = !this.dragSvg
      this.dragSvg
        ? this.initEventEmitter.dispatch("OPEN_DRAG--svg")
        : this.initEventEmitter.dispatch("CLOSE_DRAG--svg")
    }
  }
}
</script>
<style lang="scss" scoped>
.demo {
  height: 100%;
  overflow: hidden;
  .image-warpper {
    height: 700px;
    overflow: auto;
  }
}
</style>
