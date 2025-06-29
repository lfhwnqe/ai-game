// 测试角色数据加载
const { charactersData } = require('../data/characters-data');
const { relationshipsData } = require('../data/relationships-data');

console.log('🔍 测试角色数据...');
console.log(`总角色数量: ${charactersData.length}`);

// 统计各类型角色数量
const typeCount = {};
charactersData.forEach(c => {
  typeCount[c.type] = (typeCount[c.type] || 0) + 1;
});

console.log('各类型角色数量:');
console.log(`- 政府官员 (government): ${typeCount.government || 0}`);
console.log(`- 本地商人 (businessman): ${typeCount.businessman || 0}`);
console.log(`- 外商 (foreigner): ${typeCount.foreigner || 0}`);
console.log(`- 知识分子 (intellectual): ${typeCount.intellectual || 0}`);
console.log(`- 社会各界 (social): ${typeCount.social || 0}`);

console.log('\n🔍 测试关系数据...');
console.log(`总关系数量: ${relationshipsData.length}`);

// 统计各类型关系数量
const relationTypeCount = {};
relationshipsData.forEach(r => {
  relationTypeCount[r.relationshipType] = (relationTypeCount[r.relationshipType] || 0) + 1;
});

console.log('各类型关系数量:');
Object.entries(relationTypeCount).forEach(([type, count]) => {
  console.log(`- ${type}: ${count}`);
});

// 检查数据完整性
console.log('\n🔍 检查数据完整性...');
let hasErrors = false;

// 检查角色数据完整性
charactersData.forEach((char, index) => {
  if (!char.characterId || !char.name || !char.type) {
    console.error(`❌ 角色 ${index} 缺少必要字段:`, char);
    hasErrors = true;
  }
  if (!char.personality || !char.resources || !char.skills) {
    console.error(`❌ 角色 ${char.name} 缺少详细信息`);
    hasErrors = true;
  }
});

// 检查关系数据完整性
relationshipsData.forEach((rel, index) => {
  if (!rel.fromCharacterId || !rel.toCharacterId || !rel.relationshipType) {
    console.error(`❌ 关系 ${index} 缺少必要字段:`, rel);
    hasErrors = true;
  }
  
  // 检查关系中的角色ID是否存在
  const fromExists = charactersData.some(c => c.characterId === rel.fromCharacterId);
  const toExists = charactersData.some(c => c.characterId === rel.toCharacterId);
  
  if (!fromExists) {
    console.error(`❌ 关系中的源角色ID不存在: ${rel.fromCharacterId}`);
    hasErrors = true;
  }
  if (!toExists) {
    console.error(`❌ 关系中的目标角色ID不存在: ${rel.toCharacterId}`);
    hasErrors = true;
  }
});

if (!hasErrors) {
  console.log('✅ 数据完整性检查通过！');
} else {
  console.log('❌ 发现数据完整性问题，请检查上述错误');
}

// 显示一些示例数据
console.log('\n📋 示例角色数据:');
console.log('政府官员示例:', charactersData.find(c => c.type === 'government')?.name);
console.log('本地商人示例:', charactersData.find(c => c.type === 'businessman')?.name);
console.log('外商示例:', charactersData.find(c => c.type === 'foreigner')?.name);
console.log('知识分子示例:', charactersData.find(c => c.type === 'intellectual')?.name);
console.log('社会各界示例:', charactersData.find(c => c.type === 'social')?.name);

console.log('\n📋 示例关系数据:');
relationshipsData.slice(0, 3).forEach(rel => {
  const fromChar = charactersData.find(c => c.characterId === rel.fromCharacterId);
  const toChar = charactersData.find(c => c.characterId === rel.toCharacterId);
  console.log(`${fromChar?.name} --[${rel.relationshipType}]--> ${toChar?.name}`);
});

console.log('\n🎉 数据测试完成！');
