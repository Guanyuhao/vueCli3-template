# VueCli3 模板

### 自定义配置 API

See [Configuration Reference](https://cli.vuejs.org/config/).

## Vue CLI v3.11.0

- Babel
- Router
- Vuex
- Css Pre-proceesors `Sass/Scss`(dart-sass)
- Linter `Prettier` `lint on save` `lint and fix on commit`
- In deicated config files
- save select (name is "ocr")

## 代码风格的统一

- [Prettier](https://segmentfault.com/a/1190000012909159)

# 目录

- componements 公用组件
- icons SVG 目录
- utils tool 函数

### 高阶组件

- MiXin
- hoc.js

### ImageLable 图片标注

![组件应用第一版](https://github.com/Guanyuhao/vueCli3-template/blob/imagelabel/public/static/imagelabel.jpg)

### 右键菜单 `@/componements/Contextmenu`

- 参数说明

#### MenuOptions

|    属性     |                描述                |        类型         | 可选值 | 默认值 |
| :---------: | :--------------------------------: | :-----------------: | :----: | :----: |
|    items    |            菜单结构信息            | `MenuItemOptions[]` |   —    |   —    |
|    event    |            鼠标事件信息            |       `Event`       |   —    |   —    |
|      x      | 菜单显示 X 坐标, 存在`event`则失效 |      `number`       |   —    |  `0`   |
|      y      | 菜单显示 Y 坐标, 存在`event`则失效 |      `number`       |   —    |  `0`   |
|   zIndex    |         菜单样式`z-index`          |      `number`       |   —    |  `2`   |
| customClass |          自定义菜单 class          |      `string`       |   —    |   —    |
|  minWidth   |           主菜单最小宽度           |      `number`       |   —    | `150`  |

#### MenuItemOptions

|    属性     |                    描述                    |        类型         | 可选值 | 默认值  |
| :---------: | :----------------------------------------: | :-----------------: | :----: | :-----: |
|    label    |                 菜单项名称                 |      `string`       |   —    |    —    |
|    icon     | 菜单项图标, 生成`<i class="icon"></i>`元素 |      `string`       |   —    |    —    |
|  disabled   |               是否禁用菜单项               |      `boolean`      |   —    | `false` |
|   divided   |               是否显示分割线               |      `boolean`      |   —    | `false` |
| customClass |             自定义子菜单 class             |      `string`       |   —    |    —    |
|  minWidth   |               子菜单最小宽度               |      `number`       |   —    |  `150`  |
|   onClick   |               菜单项点击事件               |    `Function()`     |   —    |    —    |
|  children   |               子菜单结构信息               | `MenuItemOptions[]` |   —    |    —    |
