import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as PIXI from 'pixi.js';
import { Character, Relationship } from '../../types';
import { characterService } from '../../services/characterService';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import ForceDirectedNetwork from './ForceDirectedNetwork';

interface NetworkNode {
  id: string;
  name: string;
  profession: string;
  x: number;
  y: number;
  radius: number;
  color: number;
  sprite?: PIXI.Graphics;
  textSprite?: PIXI.Text;
  character: Character;
}

interface NetworkEdge {
  from: string;
  to: string;
  type: string;
  strength: number;
  sprite?: PIXI.Graphics;
  relationship: Relationship;
}

const NetworkContainer = styled(Card)`
  height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const NetworkCanvas = styled.div`
  flex: 1;
  position: relative;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 2px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
`;

const NetworkControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
  flex-wrap: wrap;
`;

const NodeInfo = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  max-width: 250px;
  z-index: 10;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const NodeName = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.md};
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NodeDetails = styled.div`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

interface RelationshipNetworkProps {
  centerCharacterId?: string;
  width?: number;
  height?: number;
}

const RelationshipNetwork: React.FC<RelationshipNetworkProps> = ({
  centerCharacterId,
  width = 800,
  height = 500,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [layoutType, setLayoutType] = useState<'circular' | 'force'>('circular');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  useEffect(() => {
    initializeNetwork();
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, [centerCharacterId]);

  useEffect(() => {
    if (appRef.current) {
      updateVisualization();
    }
  }, [nodes, edges, showLabels, filterType]);

  const initializeNetwork = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取角色数据
      const charactersData = await characterService.getAllCharacters();
      setCharacters(charactersData);

      // 如果指定了中心角色，获取其网络数据
      let networkData;
      if (centerCharacterId) {
        networkData = await characterService.getCharacterNetwork(centerCharacterId, 2);
        // 获取关系数据
        const relationshipsData = await characterService.getCharacterRelationships(centerCharacterId);
        setRelationships(relationshipsData);
      } else {
        // 否则使用所有角色构建网络
        networkData = await buildFullNetwork(charactersData);
        // 获取所有关系
        const allRelationships = await getAllRelationships(charactersData);
        setRelationships(allRelationships);
      }

      // 创建PIXI应用
      if (canvasRef.current) {
        const app = new PIXI.Application();
        await app.init({
          width,
          height,
          backgroundColor: 0x0a0a0a,
          antialias: true,
        });

        canvasRef.current.appendChild(app.canvas);
        appRef.current = app;

        // 构建网络节点和边
        const networkNodes = createNetworkNodes(networkData.nodes, characters);
        const networkEdges = createNetworkEdges(networkData.edges, networkNodes);

        setNodes(networkNodes);
        setEdges(networkEdges);
      }
    } catch (err: any) {
      setError(err.message || '加载网络数据失败');
      console.error('网络初始化失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const buildFullNetwork = async (characters: Character[]) => {
    const nodes = characters.slice(0, 20).map(char => ({
      id: char.characterId,
      name: char.name,
      profession: char.profession,
      level: 0,
    }));

    const edges: any[] = [];

    // 为每个角色获取关系
    for (const character of characters.slice(0, 10)) {
      try {
        const relationships = await characterService.getCharacterRelationships(character.characterId);
        relationships.forEach(rel => {
          if (nodes.find(n => n.id === rel.toCharacterId)) {
            edges.push({
              from: rel.fromCharacterId,
              to: rel.toCharacterId,
              type: rel.relationshipType,
              strength: rel.strength,
            });
          }
        });
      } catch (error) {
        console.warn(`获取角色 ${character.characterId} 的关系失败:`, error);
      }
    }

    return { nodes, edges };
  };

  const getAllRelationships = async (characters: Character[]): Promise<Relationship[]> => {
    const allRelationships: Relationship[] = [];

    for (const character of characters.slice(0, 10)) {
      try {
        const relationships = await characterService.getCharacterRelationships(character.characterId);
        allRelationships.push(...relationships);
      } catch (error) {
        console.warn(`获取角色 ${character.characterId} 的关系失败:`, error);
      }
    }

    return allRelationships;
  };

  const createNetworkNodes = (nodeData: any[], characters: Character[]): NetworkNode[] => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;

    return nodeData.map((node, index) => {
      const character = characters.find(c => c.characterId === node.id);
      if (!character) return null;

      // 计算节点位置（圆形布局）
      const angle = (index / nodeData.length) * 2 * Math.PI;
      const distance = node.level === 0 ? 0 : radius * (1 + node.level * 0.5);
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // 根据角色属性确定节点大小和颜色
      const nodeRadius = 8 + (character.resources.reputation / 100) * 12;
      const color = getProfessionColor(character.profession);

      return {
        id: node.id,
        name: node.name,
        profession: character.profession,
        x,
        y,
        radius: nodeRadius,
        color,
        character,
      };
    }).filter(Boolean) as NetworkNode[];
  };

  const createNetworkEdges = (edgeData: any[], nodes: NetworkNode[]): NetworkEdge[] => {
    return edgeData.map(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return null;

      return {
        from: edge.from,
        to: edge.to,
        type: edge.type,
        strength: edge.strength,
        relationship: {
          fromCharacterId: edge.from,
          toCharacterId: edge.to,
          relationshipType: edge.type,
          strength: edge.strength,
          description: '',
          history: [],
        },
      };
    }).filter(Boolean) as NetworkEdge[];
  };

  const getProfessionColor = (profession: string): number => {
    const colors: Record<string, number> = {
      entrepreneur: 0x00ff88,
      trader: 0xffaa00,
      official: 0xff0088,
      banker: 0x4488ff,
      manufacturer: 0x88ff44,
      investor: 0xff4488,
      developer: 0x44ff88,
      merchant: 0xff8844,
      consultant: 0x8844ff,
      manager: 0x44ffff,
    };
    return colors[profession] || 0xffffff;
  };

  const getRelationshipColor = (type: string): number => {
    const colors: Record<string, number> = {
      family: 0x00ff88,
      friend: 0x4488ff,
      business: 0xffaa00,
      romantic: 0xff0088,
      rival: 0xff4444,
    };
    return colors[type] || 0x888888;
  };

  const updateVisualization = () => {
    if (!appRef.current) return;

    const app = appRef.current;
    app.stage.removeChildren();

    // 过滤边
    const filteredEdges = filterType === 'all' 
      ? edges 
      : edges.filter(edge => edge.type === filterType);

    // 绘制边
    filteredEdges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return;

      const line = new PIXI.Graphics();
      const color = getRelationshipColor(edge.type);
      const alpha = Math.max(0.3, edge.strength / 100);
      const thickness = 1 + (edge.strength / 100) * 3;

      line.lineStyle(thickness, color, alpha);
      line.moveTo(fromNode.x, fromNode.y);
      line.lineTo(toNode.x, toNode.y);

      app.stage.addChild(line);
      edge.sprite = line;
    });

    // 绘制节点
    nodes.forEach(node => {
      const circle = new PIXI.Graphics();
      circle.beginFill(node.color);
      circle.drawCircle(0, 0, node.radius);
      circle.endFill();
      
      // 添加边框
      circle.lineStyle(2, 0xffffff, 0.8);
      circle.drawCircle(0, 0, node.radius);
      
      circle.x = node.x;
      circle.y = node.y;
      circle.interactive = true;
      circle.buttonMode = true;

      // 添加点击事件
      circle.on('pointerdown', () => {
        setSelectedNode(node);
      });

      // 添加悬停效果
      circle.on('pointerover', () => {
        circle.scale.set(1.2);
      });

      circle.on('pointerout', () => {
        circle.scale.set(1);
      });

      app.stage.addChild(circle);
      node.sprite = circle;

      // 添加标签
      if (showLabels) {
        const text = new PIXI.Text(node.name, {
          fontFamily: 'Arial',
          fontSize: 10,
          fill: 0xffffff,
          align: 'center',
        });
        
        text.x = node.x - text.width / 2;
        text.y = node.y + node.radius + 5;
        
        app.stage.addChild(text);
        node.textSprite = text;
      }
    });
  };

  const handleResetView = () => {
    setSelectedNode(null);
    setFilterType('all');
  };

  const handleCenterOnNode = (nodeId: string) => {
    // 重新初始化以该节点为中心的网络
    // 这里可以实现重新布局逻辑
  };

  if (loading) {
    return (
      <NetworkContainer>
        <Card.Header>
          <Card.Title>角色关系网络</Card.Title>
        </Card.Header>
        <Card.Content>
          <LoadingContainer>
            <LoadingSpinner size="large" variant="dots" />
          </LoadingContainer>
        </Card.Content>
      </NetworkContainer>
    );
  }

  if (error) {
    return (
      <NetworkContainer>
        <Card.Header>
          <Card.Title>角色关系网络</Card.Title>
        </Card.Header>
        <Card.Content>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>❌</div>
            <div>{error}</div>
            <Button
              variant="primary"
              size="small"
              onClick={initializeNetwork}
              style={{ marginTop: '1rem' }}
            >
              重试
            </Button>
          </div>
        </Card.Content>
      </NetworkContainer>
    );
  }

  return (
    <NetworkContainer>
      <Card.Header>
        <Card.Title>角色关系网络</Card.Title>
        <Card.Subtitle>
          {nodes.length} 个角色，{edges.length} 个关系
        </Card.Subtitle>
      </Card.Header>
      
      <Card.Content style={{ flex: 1, position: 'relative', padding: 0 }}>
        {layoutType === 'force' ? (
          <ForceDirectedNetwork
            nodes={characters}
            relationships={relationships.filter(rel =>
              filterType === 'all' || rel.relationshipType === filterType
            )}
            width={width}
            height={height}
            onNodeClick={(character) => setSelectedNode({
              id: character.characterId,
              name: character.name,
              profession: character.profession,
              x: 0,
              y: 0,
              radius: 0,
              color: 0,
              character,
            })}
            onNodeHover={(character) => {
              if (character) {
                setSelectedNode({
                  id: character.characterId,
                  name: character.name,
                  profession: character.profession,
                  x: 0,
                  y: 0,
                  radius: 0,
                  color: 0,
                  character,
                });
              } else {
                setSelectedNode(null);
              }
            }}
          />
        ) : (
          <NetworkCanvas ref={canvasRef} />
        )}

        {selectedNode && (
          <NodeInfo>
            <NodeName>{selectedNode.name}</NodeName>
            <NodeDetails>
              <div><strong>职业:</strong> {selectedNode.profession}</div>
              <div><strong>资金:</strong> ¥{selectedNode.character.resources.money.toLocaleString()}</div>
              <div><strong>声望:</strong> {selectedNode.character.resources.reputation}/100</div>
              <div><strong>人脉:</strong> {selectedNode.character.resources.connections}人</div>
            </NodeDetails>
          </NodeInfo>
        )}
      </Card.Content>

      <NetworkControls>
        <Button
          variant={layoutType === 'circular' ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setLayoutType('circular')}
        >
          圆形布局
        </Button>

        <Button
          variant={layoutType === 'force' ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setLayoutType('force')}
        >
          力导向布局
        </Button>

        <Button
          variant={showLabels ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setShowLabels(!showLabels)}
        >
          {showLabels ? '隐藏' : '显示'}标签
        </Button>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '4px 8px',
            background: '#2a2a2a',
            color: '#fff',
            border: '1px solid #00ff88',
            borderRadius: '2px',
            fontSize: '12px',
          }}
        >
          <option value="all">所有关系</option>
          <option value="family">家庭关系</option>
          <option value="friend">朋友关系</option>
          <option value="business">商业关系</option>
          <option value="romantic">恋爱关系</option>
          <option value="rival">竞争关系</option>
        </select>
        
        <Button
          variant="secondary"
          size="small"
          onClick={handleResetView}
        >
          重置视图
        </Button>
        
        <Button
          variant="accent"
          size="small"
          onClick={initializeNetwork}
        >
          刷新网络
        </Button>
      </NetworkControls>
    </NetworkContainer>
  );
};

export default RelationshipNetwork;
