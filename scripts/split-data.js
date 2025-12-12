/**
 * 数据拆分脚本
 * 将 builder-maps.json 拆分为：
 * - projects/: 每个项目一个文件（单一数据源）
 * - maps/: 每个sector的映射关系
 */

const fs = require('fs');
const path = require('path');

// 路径配置
const DATA_DIR = path.join(__dirname, '../public/data');
const INPUT_FILE = path.join(DATA_DIR, 'builder-maps.json');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const MAPS_DIR = path.join(DATA_DIR, 'maps');

// 工具函数：生成slug ID
function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 主函数
function splitData() {
  console.log('📖 读取原始数据...');
  const builderMaps = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

  console.log(`✅ 加载了 ${builderMaps.length} 个项目条目`);

  // 用于存储唯一项目和映射关系
  const projects = new Map();
  const sectorMaps = new Map();

  console.log('\n🔄 处理数据...');

  builderMaps.forEach((entry, index) => {
    const projectId = entry.name ? slugify(entry.name) : `project-${index}`;

    // 提取项目基本信息（不含sectors）
    const projectData = {
      id: projectId,
      name: entry.name,
      description: entry.description || '',
      founded: entry.founded ?? null,
      funding: entry.funding ?? null,
      links: entry.links || {}
    };

    // 存储项目（避免重复）
    if (!projects.has(projectId)) {
      projects.set(projectId, projectData);
    }

    // 处理sectors映射
    const sectors = entry.sectors || [];
    sectors.forEach(sectorEntry => {
      const sectorName = sectorEntry.sector?.trim() || 'Uncategorized';
      const sectorId = slugify(sectorName);

      // 获取或创建sector映射
      if (!sectorMaps.has(sectorId)) {
        sectorMaps.set(sectorId, {
          sector: sectorName,
          types: {}
        });
      }

      const sectorMap = sectorMaps.get(sectorId);

      // 处理每个type
      const types = sectorEntry.types || ['General'];
      types.forEach(typeName => {
        const typeKey = typeName.trim() || 'General';

        // 初始化type数组
        if (!sectorMap.types[typeKey]) {
          sectorMap.types[typeKey] = [];
        }

        // 添加项目ID（避免重复）
        if (!sectorMap.types[typeKey].includes(projectId)) {
          sectorMap.types[typeKey].push(projectId);
        }
      });
    });
  });

  // 写入项目文件
  console.log(`\n📝 写入 ${projects.size} 个项目文件...`);
  let projectCount = 0;
  for (const [projectId, projectData] of projects) {
    const filePath = path.join(PROJECTS_DIR, `${projectId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(projectData, null, 2));
    projectCount++;
    if (projectCount % 50 === 0) {
      console.log(`   已写入 ${projectCount}/${projects.size} 个项目`);
    }
  }
  console.log(`✅ 完成写入 ${projects.size} 个项目文件`);

  // 写入映射文件
  console.log(`\n📝 写入 ${sectorMaps.size} 个sector映射文件...`);
  for (const [sectorId, sectorMap] of sectorMaps) {
    const filePath = path.join(MAPS_DIR, `${sectorId}.json`);

    // 对每个type下的项目ID进行排序
    const sortedTypes = {};
    Object.keys(sectorMap.types).sort().forEach(typeKey => {
      sortedTypes[typeKey] = sectorMap.types[typeKey].sort();
    });

    const output = {
      sector: sectorMap.sector,
      types: sortedTypes
    };

    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  }
  console.log(`✅ 完成写入 ${sectorMaps.size} 个映射文件`);

  // 统计信息
  console.log('\n📊 拆分统计：');
  console.log(`   - 总项目数：${projects.size}`);
  console.log(`   - Sector数量：${sectorMaps.size}`);

  // 列出所有sectors
  console.log('\n📋 Sector列表：');
  for (const [sectorId, sectorMap] of sectorMaps) {
    const totalProjects = Object.values(sectorMap.types).reduce((sum, projects) => sum + projects.length, 0);
    const typeCount = Object.keys(sectorMap.types).length;
    console.log(`   - ${sectorMap.sector} (${typeCount} 个types, ${totalProjects} 个项目)`);
    Object.entries(sectorMap.types).forEach(([typeName, projects]) => {
      console.log(`     * ${typeName}: ${projects.length} 个项目`);
    });
  }

  console.log('\n✨ 数据拆分完成！');
}

// 执行拆分
try {
  splitData();
} catch (error) {
  console.error('❌ 拆分失败:', error);
  process.exit(1);
}
