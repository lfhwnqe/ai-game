import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { characterService } from '../services/characterService';
import { Character, Relationship } from '../types';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

const RelationshipsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  min-height: 100%;
  padding-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SimpleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.surface || '#1a1a1a'};
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.th`
  padding: 12px;
  background: ${({ theme }) => theme.colors.primary || '#007bff'};
  color: white;
  text-align: left;
  font-weight: bold;
  font-size: 14px;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: ${({ theme }) => theme.colors.background || '#0a0a0a'};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.border || '#333'};
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || '#333'};
  color: ${({ theme }) => theme.colors.text || '#fff'};
  font-size: 14px;
`;

const RelationshipType = styled.span<{ type: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  background: ${({ type }) => {
    switch (type) {
      case 'family': return '#4CAF50';
      case 'friend': return '#2196F3';
      case 'colleague': return '#FF9800';
      case 'enemy': return '#F44336';
      case 'business': return '#9C27B0';
      default: return '#757575';
    }
  }};
  color: white;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary || '#999'};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: ${({ theme }) => theme.spacing?.lg || '24px'};
  text-align: center;

  h3 {
    color: ${({ theme }) => theme.colors.error || '#f44336'};
    margin-bottom: ${({ theme }) => theme.spacing?.sm || '8px'};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary || '#999'};
    margin-bottom: ${({ theme }) => theme.spacing?.md || '16px'};
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing?.md || '16px'};
  margin-bottom: ${({ theme }) => theme.spacing?.md || '16px'};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface || '#1a1a1a'};
  border: 1px solid ${({ theme }) => theme.colors.border || '#333'};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing?.md || '16px'};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary || '#007bff'};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary || '#999'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const getProfessionName = (profession: string): string => {
  const professionMap: Record<string, string> = {
    'government': '政府官员',
    'businessman': '商人',
    'foreigner': '外国人',
    'intellectual': '知识分子',
    'social': '社会人士',
  };
  return professionMap[profession] || profession;
};

const getRelationshipTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'family': '家庭',
    'friend': '朋友',
    'colleague': '同事',
    'enemy': '敌人',
    'business': '商业',
    'romantic': '恋人',
    'mentor': '师生',
    'neighbor': '邻居',
  };
  return typeMap[type] || type;
};

const RelationshipsPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 获取角色数据
      const charactersData = await characterService.getAllCharacters();
      setCharacters(charactersData);

      // 获取关系数据 - 只获取前10个角色的关系以避免过多请求
      const allRelationships: Relationship[] = [];
      for (const character of charactersData.slice(0, 10)) {
        try {
          const characterRelationships = await characterService.getCharacterRelationships(character.characterId);
          allRelationships.push(...characterRelationships);
        } catch (error) {
          console.warn(`获取角色 ${character.characterId} 的关系失败:`, error);
        }
      }
      setRelationships(allRelationships);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RelationshipsContainer>
        <LoadingContainer>
          <div>正在加载关系数据...</div>
        </LoadingContainer>
      </RelationshipsContainer>
    );
  }

  if (error) {
    return (
      <RelationshipsContainer>
        <ErrorContainer>
          <h3>加载失败</h3>
          <p>{error}</p>
          <Button onClick={loadData}>重新加载</Button>
        </ErrorContainer>
      </RelationshipsContainer>
    );
  }

  return (
    <RelationshipsContainer>
      {/* 统计信息 */}
      <StatsContainer>
        <StatCard>
          <StatValue>{characters.length}</StatValue>
          <StatLabel>总角色数</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{relationships.length}</StatValue>
          <StatLabel>总关系数</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {characters.length > 0 ? Math.round(relationships.length / characters.length) : 0}
          </StatValue>
          <StatLabel>平均关系数</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {relationships.length > 0 ? Math.max(...relationships.map(r => r.strength)) : 0}
          </StatValue>
          <StatLabel>最强关系强度</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* 操作按钮 */}
      <Card>
        <Card.Header>
          <Card.Title>关系数据</Card.Title>
          <Card.Subtitle>简单的关系列表视图</Card.Subtitle>
        </Card.Header>
        <Card.Content>
          <div style={{ marginBottom: '16px' }}>
            <Button onClick={loadData} disabled={loading}>
              刷新数据
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* 关系表格 */}
      <Card>
        <Card.Content style={{ padding: 0 }}>
          {relationships.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
              暂无关系数据
            </div>
          ) : (
            <SimpleTable>
              <thead>
                <tr>
                  <TableHeader>角色A</TableHeader>
                  <TableHeader>职业A</TableHeader>
                  <TableHeader>关系类型</TableHeader>
                  <TableHeader>角色B</TableHeader>
                  <TableHeader>职业B</TableHeader>
                  <TableHeader>关系强度</TableHeader>
                  <TableHeader>描述</TableHeader>
                </tr>
              </thead>
              <tbody>
                {relationships.map((relationship, index) => {
                  const fromCharacter = characters.find(c => c.characterId === relationship.fromCharacterId);
                  const toCharacter = characters.find(c => c.characterId === relationship.toCharacterId);

                  return (
                    <TableRow key={index}>
                      <TableCell>{fromCharacter?.name || '未知'}</TableCell>
                      <TableCell>{fromCharacter ? getProfessionName(fromCharacter.profession) : '未知'}</TableCell>
                      <TableCell>
                        <RelationshipType type={relationship.relationshipType}>
                          {getRelationshipTypeName(relationship.relationshipType)}
                        </RelationshipType>
                      </TableCell>
                      <TableCell>{toCharacter?.name || '未知'}</TableCell>
                      <TableCell>{toCharacter ? getProfessionName(toCharacter.profession) : '未知'}</TableCell>
                      <TableCell>
                        <strong style={{ color: relationship.strength > 70 ? '#4CAF50' : relationship.strength > 40 ? '#FF9800' : '#F44336' }}>
                          {relationship.strength}
                        </strong>
                      </TableCell>
                      <TableCell>{relationship.description || '无描述'}</TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </SimpleTable>
          )}
        </Card.Content>
      </Card>
    </RelationshipsContainer>
  );
};

export default RelationshipsPage;
