'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

// Dynamically import ForceGraph2D with no SSR to avoid window is not defined error
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  language: string;
  partOfSpeech: string | null;
  outgoingRelations: {
    type: string;
    target: {
      word: string;
      partOfSpeech: string | null;
    };
  }[];
}

interface VocabularyGraphProps {
  data: Vocabulary[];
}

export function VocabularyGraph({ data }: VocabularyGraphProps) {
  const { theme } = useTheme();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight || 600,
      });
    }

    const nodes: any[] = [];
    const links: any[] = [];
    const nodeIds = new Set();

    // First pass: Add all root words as nodes
    data.forEach((vocab) => {
      if (!nodeIds.has(vocab.word)) {
        const { id: _, ...vocabData } = vocab;
        nodes.push({
          id: vocab.word,
          group: 'root',
          val: 20,
          ...vocabData,
        });
        nodeIds.add(vocab.word);
      }
    });

    // Second pass: Add related words and links
    data.forEach((vocab) => {
      vocab.outgoingRelations.forEach((rel) => {
        // Add target node if not exists
        if (!nodeIds.has(rel.target.word)) {
          nodes.push({
            id: rel.target.word,
            group: rel.type || 'related',
            val: 10,
            partOfSpeech: rel.target.partOfSpeech,
          });
          nodeIds.add(rel.target.word);
        }

        // Add link
        links.push({
          source: vocab.word,
          target: rel.target.word,
          type: rel.type || 'related',
        });
      });
    });

    setGraphData({ nodes, links } as any);

    // Reset forces after data update
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-120);
      fgRef.current.d3Force('link').distance(50);
      fgRef.current.d3ReheatSimulation();
    }
  }, [data]);

  const isDark = theme === 'dark';

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.id;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth, fontSize].map(
        (n) => n + fontSize * 0.2
      ); // some padding

      // Draw circle node
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
      ctx.fillStyle =
        node.group === 'root'
          ? isDark
            ? '#60a5fa'
            : '#3b82f6'
          : node.group === 'derivative'
            ? isDark
              ? '#4ade80'
              : '#22c55e'
            : node.group === 'synonym'
              ? isDark
                ? '#f472b6'
                : '#ec4899'
              : node.group === 'antonym'
                ? isDark
                  ? '#f87171'
                  : '#ef4444'
                : isDark
                  ? '#94a3b8'
                  : '#64748b';
      ctx.fill();

      // Draw text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillText(label, node.x, node.y + 8); // Offset text below node

      node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
    },
    [isDark]
  );

  const nodePointerAreaPaint = useCallback(
    (node: any, color: string, ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = color;
      const bckgDimensions = node.__bckgDimensions;
      bckgDimensions &&
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          ...bckgDimensions
        );
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] border rounded-lg overflow-hidden bg-card"
    >
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="id"
        nodeColor={(node: any) => {
          if (node.group === 'root') return isDark ? '#60a5fa' : '#3b82f6';
          if (node.group === 'derivative')
            return isDark ? '#4ade80' : '#22c55e';
          if (node.group === 'synonym') return isDark ? '#f472b6' : '#ec4899';
          if (node.group === 'antonym') return isDark ? '#f87171' : '#ef4444';
          return isDark ? '#94a3b8' : '#64748b';
        }}
        nodeRelSize={6}
        linkColor={() => (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}
        backgroundColor={isDark ? '#020817' : '#ffffff'}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        // Custom Node Rendering to show Text
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
      />
    </div>
  );
}
