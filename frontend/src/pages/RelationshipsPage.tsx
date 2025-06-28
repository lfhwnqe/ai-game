import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { characterService } from '../services/characterService';
import { Character, Relationship } from '../types';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import RelationshipNetwork from '../components/Visualization/RelationshipNetwork';
import RelationshipAnalysis from '../components/Visualization/RelationshipAnalysis';

const RelationshipsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  height: 100%;
`;

const ControlPanel = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: end;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const CharacterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary};
  }
`;

const NetworkContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StatsPanel = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xl};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const RelationshipLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ active, theme }) =>
    active ? theme.colors.primary + '20' : 'transparent'
  };
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.text.secondary
  };
  border: none;
  border-bottom: 2px solid ${({ active, theme }) =>
    active ? theme.colors.primary : 'transparent'
  };
  cursor: pointer;
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  transition: all ${({ theme }) => theme.animations.duration.normal};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}10;
  }
`;

const RelationshipsPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'network' | 'analysis'>('network');
  const [networkStats, setNetworkStats] = useState({
    totalCharacters: 0,
    totalRelationships: 0,
    averageConnections: 0,
    strongestConnection: '',
  });

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    if (characters.length > 0) {
      calculateNetworkStats();
    }
  }, [characters]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await characterService.getAllCharacters();
      setCharacters(data);

      // 加载所有关系
      const allRelationships = [];
      for (const character of data.slice(0, 10)) {
        try {
          const characterRelationships = await characterService.getCharacterRelationships(character.characterId);
          allRelationships.push(...characterRelationships);
        } catch (error) {
          console.warn(`获取角色 ${character.characterId} 的关系失败:`, error);
        }
      }
      setRelationships(allRelationships);

      // 默认选择第一个角色
      if (data.length > 0) {
        setSelectedCharacterId(data[0].characterId);
      }
    } catch (error) {
      console.error('加载角色失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNetworkStats = async () => {
    try {
      const stats = await characterService.getCharacterStats();
      setNetworkStats({
        totalCharacters: stats.totalCharacters,
        totalRelationships: Object.values(stats.relationshipTypes).reduce((a, b) => a + b, 0),
        averageConnections: Math.round(stats.totalCharacters > 0 ? 
          Object.values(stats.relationshipTypes).reduce((a, b) => a + b, 0) / stats.totalCharacters : 0),
        strongestConnection: '待分析',
      });
    } catch (error) {
      console.error('计算网络统计失败:', error);
    }
  };

  const handleCharacterChange = (characterId: string) => {
    setSelectedCharacterId(characterId);
  };

  const handleShowFullNetwork = () => {
    setSelectedCharacterId('');
  };

  const getProfessionName = (profession: string): string => {
    const professionNames: Record<string, string> = {
      entrepreneur: '企业家',
      trader: '商人',
      official: '官员',
      banker: '银行家',
      manufacturer: '制造商',
      investor: '投资者',
      developer: '开发商',
      merchant: '贸易商',
      consultant: '顾问',
      manager: '经理'
    };
    return professionNames[profession] || profession;
  };

  const relationshipLegend = [
    { type: 'family', label: '家庭关系', color: '#00ff88' },
    { type: 'friend', label: '朋友关系', color: '#4488ff' },
    { type: 'business', label: '商业关系', color: '#ffaa00' },
    { type: 'romantic', label: '恋爱关系', color: '#ff0088' },
    { type: 'rival', label: '竞争关系', color: '#ff4444' },
  ];

  return (
    <RelationshipsContainer>
      <ControlPanel>
        <Card.Header>
          <Card.Title>关系网络分析</Card.Title>
          <Card.Subtitle>探索深圳1980的人物关系网络</Card.Subtitle>
        </Card.Header>
        
        <Card.Content>
          <ControlGrid>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: '#fff' 
              }}>
                选择中心角色
              </label>
              <CharacterSelect
                value={selectedCharacterId}
                onChange={(e) => handleCharacterChange(e.target.value)}
                disabled={loading}
              >
                <option value="">显示完整网络</option>
                {characters.map(character => (
                  <option key={character.characterId} value={character.characterId}>
                    {character.name} - {getProfessionName(character.profession)}
                  </option>
                ))}
              </CharacterSelect>
            </div>
            
            <Button
              variant="secondary"
              onClick={handleShowFullNetwork}
              disabled={loading}
            >
              完整网络
            </Button>
            
            <Button
              variant="accent"
              onClick={loadCharacters}
              disabled={loading}
            >
              刷新数据
            </Button>
          </ControlGrid>

          <RelationshipLegend>
            <div style={{ fontWeight: 'bold', marginRight: '16px' }}>关系类型:</div>
            {relationshipLegend.map(item => (
              <LegendItem key={item.type}>
                <LegendColor color={item.color} />
                <span>{item.label}</span>
              </LegendItem>
            ))}
          </RelationshipLegend>
        </Card.Content>
      </ControlPanel>

      <Card>
        <Card.Content style={{ padding: 0 }}>
          <TabContainer>
            <Tab
              active={activeTab === 'network'}
              onClick={() => setActiveTab('network')}
            >
              关系网络
            </Tab>
            <Tab
              active={activeTab === 'analysis'}
              onClick={() => setActiveTab('analysis')}
            >
              数据分析
            </Tab>
          </TabContainer>

          <div style={{ padding: '16px' }}>
            {activeTab === 'network' ? (
              <NetworkContainer>
                <RelationshipNetwork
                  centerCharacterId={selectedCharacterId || undefined}
                  width={800}
                  height={500}
                />
              </NetworkContainer>
            ) : (
              <RelationshipAnalysis
                characters={characters}
                relationships={relationships}
              />
            )}
          </div>
        </Card.Content>
      </Card>

      <StatsPanel>
        <Card.Header>
          <Card.Title>网络统计</Card.Title>
        </Card.Header>
        
        <Card.Content>
          <StatsGrid>
            <StatItem>
              <StatValue>{networkStats.totalCharacters}</StatValue>
              <StatLabel>总角色数</StatLabel>
            </StatItem>
            
            <StatItem>
              <StatValue>{networkStats.totalRelationships}</StatValue>
              <StatLabel>总关系数</StatLabel>
            </StatItem>
            
            <StatItem>
              <StatValue>{networkStats.averageConnections}</StatValue>
              <StatLabel>平均连接数</StatLabel>
            </StatItem>
            
            <StatItem>
              <StatValue>
                {selectedCharacterId ? 
                  characters.find(c => c.characterId === selectedCharacterId)?.name || '未知' : 
                  '全网络'
                }
              </StatValue>
              <StatLabel>当前视图</StatLabel>
            </StatItem>
          </StatsGrid>
        </Card.Content>
      </StatsPanel>
    </RelationshipsContainer>
  );
};

export default RelationshipsPage;
