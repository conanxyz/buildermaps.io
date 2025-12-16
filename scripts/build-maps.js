/**
 * 数据构建脚本
 * 将拆分的数据合并回 builder-maps.json：
 * - 读取 projects/ 下的所有项目文件
 * - 读取 maps/ 下的所有映射文件
 * - 合并生成完整的 builder-maps.json
 */

const fs = require('fs');
const path = require('path');

// 路径配置
const DATA_DIR = path.join(__dirname, '../public/data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const MAPS_DIR = path.join(DATA_DIR, 'maps');
const OUTPUT_FILE = path.join(DATA_DIR, 'builder-maps.json');

function buildData() {
  console.log('🔨 开始构建 builder-maps.json...\n');

  // 1. 加载所有项目
  console.log('📦 加载项目文件...');
  const projectFiles = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json'));
  const projects = new Map();

  projectFiles.forEach(file => {
    const projectData = JSON.parse(
      fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf-8')
    );
    projects.set(projectData.id, projectData);
  });

  console.log(`✅ 加载了 ${projects.size} 个项目\n`);

  // 2. 加载所有映射
  console.log('🗺️  加载映射文件...');
  const mapFiles = fs.readdirSync(MAPS_DIR).filter(f => f.endsWith('.json'));
  const maps = [];

  mapFiles.forEach(file => {
    const mapData = JSON.parse(
      fs.readFileSync(path.join(MAPS_DIR, file), 'utf-8')
    );
    maps.push(mapData);
  });

  console.log(`✅ 加载了 ${maps.length} 个映射文件\n`);

  // 3. 构建完整数据
  console.log('🔄 构建数据结构...');
  const builderMaps = [];
  const projectSectors = new Map(); // 存储每个项目的sectors

  // 遍历所有映射，收集每个项目的sectors信息
  maps.forEach(map => {
    const sectorName = map.sector;
    const types = map.types || [];

    // 遍历每个type及其项目列表
    types.forEach((type) => {
      const typeName = type.name;
      const projectIds = type.projects || [];
      
      projectIds.forEach(projectId => {
        // 获取或初始化项目的sectors数组
        if (!projectSectors.has(projectId)) {
          projectSectors.set(projectId, []);
        }

        // 查找是否已存在该sector
        let sectorEntry = projectSectors.get(projectId).find(s => s.sector === sectorName);

        if (sectorEntry) {
          // sector已存在，添加type
          if (!sectorEntry.types.includes(typeName)) {
            sectorEntry.types.push(typeName);
          }
        } else {
          // 新建sector entry
          projectSectors.get(projectId).push({
            sector: sectorName,
            types: [typeName]
          });
        }
      });
    });
  });

  // 为每个项目创建完整的entry
  let warnings = [];

  for (const [projectId, sectors] of projectSectors) {
    const project = projects.get(projectId);

    if (!project) {
      warnings.push(`⚠️  项目不存在: ${projectId}`);
      continue;
    }

    // 创建完整的项目entry
    builderMaps.push({
      name: project.name,
      description: project.description,
      sectors: sectors,
      founded: project.founded,
      funding: project.funding,
      links: project.links
    });
  }

  // 按项目名称排序
  builderMaps.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`✅ 构建了 ${builderMaps.length} 个项目条目\n`);

  // 4. 输出警告
  if (warnings.length > 0) {
    console.log('⚠️  警告:');
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }

  // 5. 写入文件
  console.log('💾 写入 builder-maps.json...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(builderMaps, null, 2));
  console.log(`✅ 成功写入 ${OUTPUT_FILE}\n`);

  // 6. 统计信息
  console.log('📊 构建统计:');
  console.log(`   - 输出项目数: ${builderMaps.length}`);
  console.log(`   - 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);

  // 统计每个sector的项目数
  const sectorCounts = new Map();
  builderMaps.forEach(entry => {
    entry.sectors.forEach(s => {
      const count = sectorCounts.get(s.sector) || 0;
      sectorCounts.set(s.sector, count + 1);
    });
  });

  console.log('\n📋 Sector分布:');
  const sortedSectors = Array.from(sectorCounts.entries()).sort((a, b) => b[1] - a[1]);
  for (const [sector, count] of sortedSectors) {
    console.log(`   - ${sector}: ${count} 个项目`);
  }

  console.log('\n✨ 构建完成！');
}

// 执行构建
try {
  buildData();
} catch (error) {
  console.error('❌ 构建失败:', error);
  process.exit(1);
}
