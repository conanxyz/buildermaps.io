# BuilderMaps 数据管理指南

## 📁 目录结构

```
public/data/
├── projects/              # 项目数据（单一数据源）
│   ├── 0xgasless.json    # 每个项目一个文件
│   ├── 1shot-api.json
│   └── ...               # 共 478 个项目文件
│
├── maps/                  # Sector 映射关系
│   ├── x402.json         # 项目到 sector 的映射
│   ├── defi.json
│   ├── stablecoins.json
│   └── ...               # 共 7 个 sector
│
├── builder-maps.json      # 自动生成的完整数据（不要手动编辑！）
└── README.md             # 本文档
```

---

## 🎯 核心理念

### 数据规范化
- **单一数据源**：每个项目只在 `projects/` 中存储一次
- **零重复**：避免数据冗余和不一致
- **易于维护**：更新项目信息只需编辑一个文件

### 文件职责
- `projects/`: 存储项目的所有信息（名称、描述、链接等）
- `maps/`: 存储项目归属的 sector 和 type
- `builder-maps.json`: 自动生成的合并文件，供应用使用

---

## 📝 日常维护

### 1. 添加新项目

#### 步骤 1: 创建项目文件

在 `projects/` 目录下创建新文件，文件名使用项目名的 slug 格式：

```bash
# 例如：MyNewProject → mynewproject.json
vim public/data/projects/mynewproject.json
```

文件内容示例：

```json
{
  "id": "mynewproject",
  "name": "MyNewProject",
  "description": "项目简短描述",
  "founded": 2024,
  "funding": null,
  "links": {
    "homepage": "https://example.com",
    "logo": "https://example.com/logo.png",
    "twitter": "https://x.com/mynewproject",
    "telegram": "https://t.me/mynewproject"
  }
}
```

**字段说明**：
- `id`: 项目唯一标识符（小写，连字符分隔）
- `name`: 项目显示名称
- `description`: 项目描述（简短）
- `founded`: 成立年份（可为 null）
- `funding`: 融资金额（可为 null 或数字）
- `links`: 相关链接（可选字段：homepage, logo, twitter, telegram, discord, medium, github, linkedin, reddit）

#### 步骤 2: 添加到 Sector 映射

编辑对应的 sector 文件（例如 `maps/x402.json`），在对应的 type 数组中添加项目ID：

```json
{
  "sector": "x402",
  "types": {
    "Infra & Devtools": [
      "0xgasless",
      "1shot-api",
      "mynewproject"  // 添加到这里
    ],
    "Consumer Apps": [
      "402rush-fun"
    ]
  }
}
```

**注意**：
- 项目ID必须与项目文件的 `id` 完全一致
- 项目ID按字母顺序排列（构建时会自动排序）
- 如果type不存在，需要先创建该type

#### 步骤 3: 构建数据

```bash
npm run build:maps
```

这会自动生成 `builder-maps.json`。

---

### 2. 更新现有项目

#### 更新项目信息

```bash
# 只需编辑项目文件
vim public/data/projects/0xgasless.json

# 构建
npm run build:maps
```

✅ **优势**：只需修改一个文件，所有引用自动更新

#### 更新项目的 Sector 归属

```bash
# 编辑对应的 sector 映射文件
vim public/data/maps/x402.json

# 构建
npm run build:maps
```

---

### 3. 删除项目

#### 步骤 1: 从 Sector 映射中移除

编辑所有包含该项目的 sector 文件，从对应的 type 数组中删除项目ID。

```json
{
  "sector": "x402",
  "types": {
    "Infra & Devtools": [
      "0xgasless",
      "1shot-api"
      // 删除 "mynewproject"
    ]
  }
}
```

#### 步骤 2: 删除项目文件

```bash
rm public/data/projects/mynewproject.json
```

#### 步骤 3: 构建数据

```bash
npm run build:maps
```

---

### 4. 添加新 Sector

创建新的映射文件：

```bash
vim public/data/maps/newsector.json
```

文件内容：

```json
{
  "sector": "NewSector",
  "types": {
    "Type1": [
      "someproject"
    ],
    "Type2": [
      "someproject"
    ]
  }
}
```

然后运行：

```bash
npm run build:maps
```

---

## 🛠️ NPM 命令

### `npm run build:maps`
**用途**: 构建完整的 `builder-maps.json`

**何时使用**:
- 添加、修改或删除项目后
- 更新 sector 映射后
- **生产部署前**

```bash
npm run build:maps
```

### `npm run verify:maps`
**用途**: 验证数据完整性

**检查内容**:
- 所有项目ID引用是否存在
- 数据格式是否正确
- 统计信息

```bash
npm run verify:maps
```

**建议**: 每次修改数据后都运行一次验证。

### `npm run split:maps`
**用途**: 初始化拆分（仅一次性使用）

⚠️ **警告**: 这会从 `builder-maps.json` 重新拆分数据，覆盖现有的 `projects/` 和 `maps/` 文件！

仅在以下情况使用：
- 首次迁移到新结构
- 从备份恢复数据

---

## ✅ 最佳实践

### 1. 修改前先验证

```bash
npm run verify:maps  # 确保当前数据完整
```

### 2. 修改后立即构建

```bash
npm run build:maps   # 生成最新的 builder-maps.json
npm run verify:maps  # 验证修改是否正确
```

### 3. 保持一致的命名

- 项目 ID 使用小写 + 连字符：`my-project`
- Sector 文件名使用小写 + 连字符：`x402.json`
- 项目名称使用正确的大小写：`MyProject`

### 4. 提交前检查

```bash
git diff public/data/             # 检查修改内容
npm run verify:maps               # 验证数据
npm run build:maps                # 确保 builder-maps.json 最新
git add public/data/
git commit -m "feat: add MyProject to x402"
```

---

## 🔍 故障排查

### 问题：构建后项目数量不对

**检查**：
```bash
ls -1 public/data/projects/ | wc -l  # 项目文件数
npm run verify:maps                  # 验证完整性
```

### 问题：某个项目没有出现在地图上

**可能原因**：
1. 项目文件中的 `id` 与映射文件中的项目ID不一致
2. 项目没有被添加到任何 sector 映射中
3. 忘记运行 `npm run build:maps`

**解决方法**：
```bash
npm run verify:maps  # 查看错误提示
```

### 问题：修改后前端没有更新

**解决方法**：
```bash
npm run build:maps   # 确保重新构建
# 重启开发服务器
```

---

## 📊 数据统计

当前数据（截至最后一次构建）：

- **项目总数**: 478
- **Sector 数量**: 7
  - x402: 80 个项目
  - AI & Crypto: 62 个项目
  - Stablecoins: 68 个项目
  - Sui: 118 个项目
  - Prediction Markets: 99 个项目
  - Data: 69 个项目
  - Uncategorized: 4 个项目

---

## 🚀 生产部署

### 部署前检查清单

- [ ] 运行 `npm run verify:maps` 确保数据完整
- [ ] 运行 `npm run build:maps` 生成最新数据
- [ ] 检查 `builder-maps.json` 文件大小合理（~250KB）
- [ ] 确认 Git 状态干净或已提交所有修改

### 部署流程

```bash
# 1. 构建数据
npm run build:maps

# 2. 构建项目（会自动先运行 build:maps）
npm run build

# 3. 部署到 CDN
# builder-maps.json 会被上传到：
# https://net-static-dev.chainbasehq.com/public/buildermaps/data/builder-maps.json
```

---

## 📖 常见场景示例

### 场景 1: 批量添加多个项目

```bash
# 1. 批量创建项目文件
for project in project1 project2 project3; do
  echo '{
    "id": "'$project'",
    "name": "'${project^}'",
    "description": "...",
    "founded": null,
    "funding": null,
    "links": {}
  }' > public/data/projects/$project.json
done

# 2. 编辑 sector 映射
vim public/data/maps/x402.json

# 3. 构建和验证
npm run build:maps
npm run verify:maps
```

### 场景 2: 项目更换 Sector

```bash
# 1. 从旧 sector 移除
vim public/data/maps/old-sector.json
# 从对应type数组中删除项目ID

# 2. 添加到新 sector
vim public/data/maps/new-sector.json
# 在对应type数组中添加项目ID

# 3. 构建
npm run build:maps
```

### 场景 3: 项目属于多个 Sector

项目文件只需存在一份，在多个 sector 映射中引用即可：

```bash
# public/data/maps/x402.json
{
  "sector": "x402",
  "types": {
    "Infra": ["myproject"]
  }
}

# public/data/maps/defi.json
{
  "sector": "DeFi",
  "types": {
    "DEX": ["myproject"]
  }
}
```

---

## 🎓 设计思想

### 为什么拆分数据？

**旧方案问题**：
- ❌ 大文件难以维护（9844 行）
- ❌ 多人协作容易冲突
- ❌ 数据重复（12+ 个重复项目）
- ❌ Git diff 不直观

**新方案优势**：
- ✅ 单一数据源（每个项目只存一次）
- ✅ 小文件易于编辑（平均 10-15 行）
- ✅ 清晰的数据关系（项目 vs 映射）
- ✅ 自动验证防错
- ✅ Git diff 友好（一次只改一个文件）

### 数据流

```
修改 projects/*.json 或 maps/*.json
           ↓
     npm run build:maps
           ↓
   生成 builder-maps.json
           ↓
     应用读取并显示
```

---

## 📞 需要帮助？

如有问题，请检查：
1. 本文档的故障排查部分
2. 运行 `npm run verify:maps` 查看具体错误
3. 检查 Git 提交历史中的修改示例

---

**最后更新**: 2024-12-12
**维护者**: BuilderMaps 团队
