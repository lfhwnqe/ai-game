import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { characterService } from '../services/characterService';
import { Character } from '../types';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';

const CharactersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  height: 100%;
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  overflow-y: auto;
`;

const CharacterCard = styled(Card)`
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.duration.normal};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CharacterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CharacterName = styled.h3`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CharacterAge = styled.span`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const CharacterProfession = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CharacterStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
`;

const CharacterBackground = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const CharactersPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    // 过滤角色
    if (!searchQuery.trim()) {
      setFilteredCharacters(characters);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = characters.filter(character =>
        character.name.toLowerCase().includes(query) ||
        character.profession.toLowerCase().includes(query) ||
        character.background.toLowerCase().includes(query)
      );
      setFilteredCharacters(filtered);
    }
  }, [characters, searchQuery]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await characterService.getAllCharacters();
      setCharacters(data);
    } catch (err: any) {
      setError(err.message || '加载角色失败');
      console.error('加载角色失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}亿`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}万`;
    } else {
      return `¥${amount.toLocaleString()}`;
    }
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

  if (loading) {
    return (
      <CharactersContainer>
        <Card>
          <LoadingContainer>
            <LoadingSpinner size="large" variant="dots" />
          </LoadingContainer>
        </Card>
      </CharactersContainer>
    );
  }

  if (error) {
    return (
      <CharactersContainer>
        <Card>
          <Card.Content>
            <EmptyState>
              <div style={{ marginBottom: '1rem' }}>❌</div>
              <div>加载失败: {error}</div>
              <Button
                variant="primary"
                size="small"
                onClick={loadCharacters}
                style={{ marginTop: '1rem' }}
              >
                重试
              </Button>
            </EmptyState>
          </Card.Content>
        </Card>
      </CharactersContainer>
    );
  }

  return (
    <CharactersContainer>
      <Card>
        <Card.Header>
          <Card.Title>角色列表</Card.Title>
          <Card.Subtitle>深圳1980的商业精英们</Card.Subtitle>
        </Card.Header>
        
        <Card.Content>
          <SearchBar>
            <Input
              placeholder="搜索角色姓名、职业或背景..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
            <Button
              variant="secondary"
              onClick={() => setSearchQuery('')}
              disabled={!searchQuery}
            >
              清除
            </Button>
          </SearchBar>
        </Card.Content>
      </Card>

      {filteredCharacters.length === 0 ? (
        <Card>
          <Card.Content>
            <EmptyState>
              <div style={{ marginBottom: '1rem' }}>🔍</div>
              <div>
                {searchQuery ? '未找到匹配的角色' : '暂无角色数据'}
              </div>
            </EmptyState>
          </Card.Content>
        </Card>
      ) : (
        <CharacterGrid>
          {filteredCharacters.map((character) => (
            <CharacterCard key={character.characterId}>
              <Card.Content>
                <CharacterHeader>
                  <div>
                    <CharacterName>{character.name}</CharacterName>
                    <CharacterAge>{character.age}岁</CharacterAge>
                  </div>
                </CharacterHeader>
                
                <CharacterProfession>
                  {getProfessionName(character.profession)}
                </CharacterProfession>
                
                <CharacterStats>
                  <StatItem>
                    <StatLabel>资金:</StatLabel>
                    <StatValue>{formatMoney(character.resources.money)}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>声望:</StatLabel>
                    <StatValue>{character.resources.reputation}/100</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>健康:</StatLabel>
                    <StatValue>{character.resources.health}%</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>人脉:</StatLabel>
                    <StatValue>{character.resources.connections}人</StatValue>
                  </StatItem>
                </CharacterStats>
                
                <CharacterBackground>
                  {character.background}
                </CharacterBackground>
              </Card.Content>
            </CharacterCard>
          ))}
        </CharacterGrid>
      )}
    </CharactersContainer>
  );
};

export default CharactersPage;
