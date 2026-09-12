# Trip 旅行指南 · 中国十大热门景点攻略

一个**纯静态、零依赖**的旅行攻略网站，展示中国 10 大热门景点的结构化攻略。可一键托管于 GitHub Pages。

## 在线访问

- 网站首页：`https://zhoumin8281-lgtm.github.io/trip/`
- 仓库地址：`https://github.com/zhoumin8281-lgtm/trip`

## 功能

- 🗺️ **景点列表页**：10 大景点卡片网格，支持按**地区**、**季节**、**关键词**实时筛选与搜索
- 📖 **景点详情页**：每个景点 11 个结构化模块（概览 / 最佳季节 / 交通 / 门票 / 路线 / 亮点 / 美食 / 住宿 / 避坑 / 贴士 / 相关推荐），含目录锚点导航
- ⭐ **收藏**：基于 `localStorage`，列表页一键收藏（无需登录）
- 📱 **响应式**：移动端单列 → 平板 2 列 → 桌面 3 列，手机优先

## 收录景点

长城 · 故宫 · 西湖 · 张家界 · 九寨沟 · 桂林山水 · 黄山 · 泰山 · 丽江古城 · 秦始皇兵马俑

## 技术栈

| 维度 | 方案 |
|---|---|
| 架构 | 纯静态 HTML / CSS / JS，无框架、无构建 |
| 样式 | 原生 CSS（CSS 变量 + 响应式），文旅风视觉 |
| 交互 | 原生 JS（筛选 / 收藏 / 锚点），零依赖 |
| 数据 | 集中维护于 `assets/js/data.js`，并同步导出 `data/attractions.json` |
| 托管 | GitHub Pages |

## 目录结构

```
trip/
├── index.html              # 列表页（10 景点 + 筛选）
├── attraction.html         # 详情页模板（?id= 渲染）
├── about.html              # 关于本站
├── sitemap.xml             # SEO 站点地图
├── assets/
│   ├── css/style.css       # 全局样式
│   └── js/
│       ├── data.js         # 景点结构化数据（单一数据源）
│       └── main.js         # 列表/详情渲染与交互
├── data/
│   └── attractions.json     # 数据副本（便于维护/迁移）
├── 旅行攻略网站需求.md       # 需求与实现方案文档
└── README.md
```

## 本地预览

直接用浏览器打开 `index.html` 即可；或起一个本地静态服务：

```bash
# Python
python -m http.server 8080
# 然后访问 http://localhost:8080
```

## 维护说明

景点内容集中在 `assets/js/data.js`（与 `data/attractions.json` 同源）。修改或新增景点后，运行 `node gen_json.js` 重新生成 JSON 副本即可。

> 封面目前为渐变占位，正式上线时替换为授权图片即可；门票、交通等信息会随政策变动，出行前请以官方公告为准。
