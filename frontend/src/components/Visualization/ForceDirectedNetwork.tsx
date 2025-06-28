import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Character, Relationship } from '../../types';

interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: number;
  character: Character;
  sprite?: PIXI.Graphics;
  textSprite?: PIXI.Text;
  fixed?: boolean;
}

interface NetworkEdge {
  source: NetworkNode;
  target: NetworkNode;
  strength: number;
  type: string;
  sprite?: PIXI.Graphics;
}

interface ForceDirectedNetworkProps {
  nodes: Character[];
  relationships: Relationship[];
  width: number;
  height: number;
  onNodeClick?: (character: Character) => void;
  onNodeHover?: (character: Character | null) => void;
}

class ForceSimulation {
  private nodes: NetworkNode[] = [];
  private edges: NetworkEdge[] = [];
  private width: number;
  private height: number;
  private alpha: number = 1;
  private alphaDecay: number = 0.02;
  private velocityDecay: number = 0.4;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setNodes(nodes: NetworkNode[]) {
    this.nodes = nodes;
    return this;
  }

  setEdges(edges: NetworkEdge[]) {
    this.edges = edges;
    return this;
  }

  tick() {
    this.alpha *= (1 - this.alphaDecay);
    
    // 应用力
    this.applyForces();
    
    // 更新位置
    this.nodes.forEach(node => {
      if (!node.fixed) {
        node.vx *= this.velocityDecay;
        node.vy *= this.velocityDecay;
        node.x += node.vx;
        node.y += node.vy;
        
        // 边界约束
        node.x = Math.max(node.radius, Math.min(this.width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(this.height - node.radius, node.y));
      }
    });

    return this.alpha > 0.01;
  }

  private applyForces() {
    // 中心力
    this.applyCenterForce();
    
    // 排斥力
    this.applyRepulsionForce();
    
    // 连接力
    this.applyLinkForce();
  }

  private applyCenterForce() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const strength = 0.1;

    this.nodes.forEach(node => {
      if (!node.fixed) {
        node.vx += (centerX - node.x) * strength * this.alpha;
        node.vy += (centerY - node.y) * strength * this.alpha;
      }
    });
  }

  private applyRepulsionForce() {
    const strength = 300;

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i];
        const nodeB = this.nodes[j];
        
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const force = strength / (distance * distance) * this.alpha;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          if (!nodeA.fixed) {
            nodeA.vx -= fx;
            nodeA.vy -= fy;
          }
          if (!nodeB.fixed) {
            nodeB.vx += fx;
            nodeB.vy += fy;
          }
        }
      }
    }
  }

  private applyLinkForce() {
    this.edges.forEach(edge => {
      const dx = edge.target.x - edge.source.x;
      const dy = edge.target.y - edge.source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const targetDistance = 100 + (edge.strength / 100) * 50;
        const force = (distance - targetDistance) * 0.1 * this.alpha;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        if (!edge.source.fixed) {
          edge.source.vx += fx;
          edge.source.vy += fy;
        }
        if (!edge.target.fixed) {
          edge.target.vx -= fx;
          edge.target.vy -= fy;
        }
      }
    });
  }

  restart() {
    this.alpha = 1;
    return this;
  }
}

const ForceDirectedNetwork: React.FC<ForceDirectedNetworkProps> = ({
  nodes: charactersData,
  relationships,
  width,
  height,
  onNodeClick,
  onNodeHover,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const simulationRef = useRef<ForceSimulation | null>(null);
  const animationRef = useRef<number | null>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);

  useEffect(() => {
    initializeVisualization();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (appRef.current) {
        appRef.current.destroy(true);
      }
    };
  }, [charactersData, relationships]);

  const initializeVisualization = () => {
    if (!canvasRef.current) return;

    // 创建PIXI应用
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x0a0a0a,
      antialias: true,
    });

    canvasRef.current.innerHTML = '';
    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // 创建网络节点
    const networkNodes: NetworkNode[] = charactersData.map((character, index) => ({
      id: character.characterId,
      name: character.name,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: 8 + (character.resources.reputation / 100) * 12,
      color: getProfessionColor(character.profession),
      character,
    }));

    // 创建网络边
    const networkEdges: NetworkEdge[] = relationships
      .map(rel => {
        const source = networkNodes.find(n => n.id === rel.fromCharacterId);
        const target = networkNodes.find(n => n.id === rel.toCharacterId);
        
        if (source && target) {
          return {
            source,
            target,
            strength: rel.strength,
            type: rel.relationshipType,
          };
        }
        return null;
      })
      .filter(Boolean) as NetworkEdge[];

    setNodes(networkNodes);
    setEdges(networkEdges);

    // 创建力模拟
    const simulation = new ForceSimulation(width, height)
      .setNodes(networkNodes)
      .setEdges(networkEdges);

    simulationRef.current = simulation;

    // 开始动画
    startAnimation();
  };

  const startAnimation = () => {
    const animate = () => {
      if (simulationRef.current && appRef.current) {
        const shouldContinue = simulationRef.current.tick();
        updateVisualization();
        
        if (shouldContinue) {
          animationRef.current = requestAnimationFrame(animate);
        }
      }
    };
    
    animate();
  };

  const updateVisualization = () => {
    if (!appRef.current) return;

    const app = appRef.current;
    app.stage.removeChildren();

    // 绘制边
    edges.forEach(edge => {
      const line = new PIXI.Graphics();
      const color = getRelationshipColor(edge.type);
      const alpha = Math.max(0.3, edge.strength / 100);
      const thickness = 1 + (edge.strength / 100) * 3;

      line.lineStyle(thickness, color, alpha);
      line.moveTo(edge.source.x, edge.source.y);
      line.lineTo(edge.target.x, edge.target.y);

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

      // 添加事件
      circle.on('pointerdown', () => {
        onNodeClick?.(node.character);
        // 固定节点位置
        node.fixed = !node.fixed;
        if (node.fixed) {
          node.vx = 0;
          node.vy = 0;
        }
      });

      circle.on('pointerover', () => {
        circle.scale.set(1.2);
        onNodeHover?.(node.character);
      });

      circle.on('pointerout', () => {
        circle.scale.set(1);
        onNodeHover?.(null);
      });

      app.stage.addChild(circle);
      node.sprite = circle;

      // 添加标签
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
    });
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

  const restartSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.restart();
      startAnimation();
    }
  };

  return (
    <div>
      <div ref={canvasRef} style={{ border: '2px solid #00ff88', borderRadius: '4px' }} />
      <div style={{ marginTop: '8px', textAlign: 'center' }}>
        <button
          onClick={restartSimulation}
          style={{
            padding: '8px 16px',
            background: '#00ff88',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          重新布局
        </button>
        <span style={{ marginLeft: '16px', fontSize: '12px', color: '#888' }}>
          点击节点固定位置
        </span>
      </div>
    </div>
  );
};

export default ForceDirectedNetwork;
