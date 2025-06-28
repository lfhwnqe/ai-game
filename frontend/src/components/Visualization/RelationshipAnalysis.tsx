import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Character, Relationship } from '../../types';
import { characterService } from '../../services/characterService';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';

const AnalysisContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.md};
`;

const MetricValue = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.xxl};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  font-family: 'Orbitron', ${({ theme }) => theme.fonts.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MetricLabel = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const RelationshipList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 300px;
  overflow-y: auto;
`;

const RelationshipItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const RelationshipInfo = styled.div`
  flex: 1;
`;

const RelationshipNames = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const RelationshipType = styled.div<{ type: string }>`
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ type, theme }) => {
    switch (type) {
      case 'family': return theme.colors.status.success;
      case 'friend': return theme.colors.status.info;
      case 'business': return theme.colors.game.money;
      case 'romantic': return theme.colors.secondary;
      case 'rival': return theme.colors.status.error;
      default: return theme.colors.text.muted;
    }
  }};
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
`;

const StrengthBar = styled.div`
  width: 60px;
  height: 8px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 4px;
  overflow: hidden;
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const StrengthFill = styled.div<{ strength: number }>`
  height: 100%;
  width: ${({ strength }) => strength}%;
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.colors.status.error},
    ${({ theme }) => theme.colors.status.warning},
    ${({ theme }) => theme.colors.status.success}
  );
  transition: width 0.3s ease;
`;

const TopCharactersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CharacterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const CharacterName = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CharacterScore = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

interface RelationshipAnalysisProps {
  characters: Character[];
  relationships: Relationship[];
}

const RelationshipAnalysis: React.FC<RelationshipAnalysisProps> = ({
  characters,
  relationships,
}) => {
  const [networkMetrics, setNetworkMetrics] = useState({
    totalNodes: 0,
    totalEdges: 0,
    averageConnections: 0,
    networkDensity: 0,
  });

  const [topRelationships, setTopRelationships] = useState<Array<{
    relationship: Relationship;
    fromCharacter: Character;
    toCharacter: Character;
  }>>([]);

  const [influentialCharacters, setInfluentialCharacters] = useState<Array<{
    character: Character;
    connectionCount: number;
    influenceScore: number;
  }>>([]);

  useEffect(() => {
    calculateNetworkMetrics();
    findTopRelationships();
    calculateInfluentialCharacters();
  }, [characters, relationships]);

  const calculateNetworkMetrics = () => {
    const totalNodes = characters.length;
    const totalEdges = relationships.length;
    const maxPossibleEdges = totalNodes * (totalNodes - 1) / 2;
    const networkDensity = maxPossibleEdges > 0 ? (totalEdges / maxPossibleEdges) * 100 : 0;
    const averageConnections = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0;

    setNetworkMetrics({
      totalNodes,
      totalEdges,
      averageConnections: Math.round(averageConnections * 10) / 10,
      networkDensity: Math.round(networkDensity * 10) / 10,
    });
  };

  const findTopRelationships = () => {
    const relationshipsWithCharacters = relationships
      .map(rel => {
        const fromCharacter = characters.find(c => c.characterId === rel.fromCharacterId);
        const toCharacter = characters.find(c => c.characterId === rel.toCharacterId);
        
        if (fromCharacter && toCharacter) {
          return {
            relationship: rel,
            fromCharacter,
            toCharacter,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.relationship.strength - a!.relationship.strength)
      .slice(0, 10) as Array<{
        relationship: Relationship;
        fromCharacter: Character;
        toCharacter: Character;
      }>;

    setTopRelationships(relationshipsWithCharacters);
  };

  const calculateInfluentialCharacters = () => {
    const characterConnections = characters.map(character => {
      const connections = relationships.filter(rel => 
        rel.fromCharacterId === character.characterId || 
        rel.toCharacterId === character.characterId
      );
      
      const connectionCount = connections.length;
      const totalStrength = connections.reduce((sum, rel) => sum + rel.strength, 0);
      const averageStrength = connectionCount > 0 ? totalStrength / connectionCount : 0;
      
      // 影响力分数 = 连接数 * 平均强度 * 声望权重
      const influenceScore = connectionCount * averageStrength * (character.resources.reputation / 100);
      
      return {
        character,
        connectionCount,
        influenceScore: Math.round(influenceScore),
      };
    })
    .sort((a, b) => b.influenceScore - a.influenceScore)
    .slice(0, 10);

    setInfluentialCharacters(characterConnections);
  };

  const getRelationshipTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
      family: '家庭',
      friend: '朋友',
      business: '商业',
      romantic: '恋爱',
      rival: '竞争'
    };
    return typeNames[type] || type;
  };

  return (
    <div>
      <AnalysisContainer>
        <MetricCard>
          <Card.Header>
            <Card.Title>网络指标</Card.Title>
          </Card.Header>
          <Card.Content>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <MetricValue>{networkMetrics.totalNodes}</MetricValue>
                <MetricLabel>角色数量</MetricLabel>
              </div>
              <div>
                <MetricValue>{networkMetrics.totalEdges}</MetricValue>
                <MetricLabel>关系数量</MetricLabel>
              </div>
              <div>
                <MetricValue>{networkMetrics.averageConnections}</MetricValue>
                <MetricLabel>平均连接</MetricLabel>
              </div>
              <div>
                <MetricValue>{networkMetrics.networkDensity}%</MetricValue>
                <MetricLabel>网络密度</MetricLabel>
              </div>
            </div>
          </Card.Content>
        </MetricCard>

        <MetricCard>
          <Card.Header>
            <Card.Title>影响力排行</Card.Title>
          </Card.Header>
          <Card.Content>
            <TopCharactersList>
              {influentialCharacters.slice(0, 5).map((item, index) => (
                <CharacterItem key={item.character.characterId}>
                  <div>
                    <CharacterName>
                      #{index + 1} {item.character.name}
                    </CharacterName>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {item.connectionCount} 个连接
                    </div>
                  </div>
                  <CharacterScore>{item.influenceScore}</CharacterScore>
                </CharacterItem>
              ))}
            </TopCharactersList>
          </Card.Content>
        </MetricCard>
      </AnalysisContainer>

      <Card style={{ marginTop: '16px' }}>
        <Card.Header>
          <Card.Title>最强关系</Card.Title>
          <Card.Subtitle>按关系强度排序</Card.Subtitle>
        </Card.Header>
        <Card.Content>
          <RelationshipList>
            {topRelationships.map((item, index) => (
              <RelationshipItem key={index}>
                <RelationshipInfo>
                  <RelationshipNames>
                    {item.fromCharacter.name} ↔ {item.toCharacter.name}
                  </RelationshipNames>
                  <RelationshipType type={item.relationship.relationshipType}>
                    {getRelationshipTypeName(item.relationship.relationshipType)}
                  </RelationshipType>
                </RelationshipInfo>
                <StrengthBar>
                  <StrengthFill strength={item.relationship.strength} />
                </StrengthBar>
                <div style={{ 
                  marginLeft: '8px', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: '#fff',
                  minWidth: '30px',
                  textAlign: 'right'
                }}>
                  {item.relationship.strength}
                </div>
              </RelationshipItem>
            ))}
          </RelationshipList>
        </Card.Content>
      </Card>
    </div>
  );
};

export default RelationshipAnalysis;
