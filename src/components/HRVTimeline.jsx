import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Heart, TrendingUp, Info } from 'lucide-react';

const HRVTimeline = ({ data = [] }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 300 });
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [statistics, setStatistics] = useState({
    average: 0,
    trend: 0,
    coherence: 0
  });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height: 300 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Calculate statistics
    const hrvValues = data.map(d => d.hrv).filter(v => v > 0);
    if (hrvValues.length > 0) {
      const average = hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length;
      
      // Calculate trend (positive = improving)
      const firstHalf = hrvValues.slice(0, Math.floor(hrvValues.length / 2));
      const secondHalf = hrvValues.slice(Math.floor(hrvValues.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length || 0;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length || 0;
      const trend = ((secondAvg - firstAvg) / firstAvg) * 100;

      // Calculate coherence (how stable the HRV pattern is)
      const variance = hrvValues.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / hrvValues.length;
      const coherence = Math.max(0, 1 - (Math.sqrt(variance) / average));

      setStatistics({
        average: Math.round(average),
        trend: Math.round(trend),
        coherence: Math.round(coherence * 100)
      });
    }

    drawTimeline();
  }, [data, dimensions]);

  const drawTimeline = () => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter valid HRV data
    const validData = data.filter(d => d.hrv > 0);
    if (validData.length === 0) return;

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, validData.length - 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(validData, d => d.hrv) * 1.1])
      .range([height, 0]);

    // Gradient definition for the area
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'hrv-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', yScale(0))
      .attr('x2', 0).attr('y2', yScale(d3.max(validData, d => d.hrv)));

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8b5cf6')
      .attr('stop-opacity', 0.3);

    // Area generator
    const area = d3.area()
      .x((d, i) => xScale(i))
      .y0(height)
      .y1(d => yScale(d.hrv))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.hrv))
      .curve(d3.curveMonotoneX);

    // Draw area
    g.append('path')
      .datum(validData)
      .attr('class', 'area')
      .attr('fill', 'url(#hrv-gradient)')
      .attr('d', area);

    // Draw line
    g.append('path')
      .datum(validData)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add coherence zones
    const coherenceZones = [
      { min: 0, max: 30, color: '#ef4444', label: 'Low' },
      { min: 30, max: 50, color: '#f59e0b', label: 'Moderate' },
      { min: 50, max: 100, color: '#10b981', label: 'High' }
    ];

    coherenceZones.forEach(zone => {
      g.append('rect')
        .attr('x', 0)
        .attr('y', yScale(zone.max))
        .attr('width', width)
        .attr('height', yScale(zone.min) - yScale(zone.max))
        .attr('fill', zone.color)
        .attr('opacity', 0.05);
    });

    // Add dots for data points
    g.selectAll('.dot')
      .data(validData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.hrv))
      .attr('r', 3)
      .attr('fill', '#8b5cf6')
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1)
      .on('mouseenter', (event, d) => {
        setHoveredPoint(d);
      })
      .on('mouseleave', () => {
        setHoveredPoint(null);
      });

    // Add average line
    const avgY = yScale(statistics.average);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', avgY)
      .attr('y2', avgY)
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.7);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', '#6b7280');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#6b7280');

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .text('HRV (ms)');
  };

  const getCoherenceColor = (coherence) => {
    if (coherence >= 70) return 'text-green-400';
    if (coherence >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend) => {
    if (Math.abs(trend) < 5) return '→';
    return trend > 0 ? '↑' : '↓';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Heart className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Heart Rate Variability</h3>
            <p className="text-sm text-gray-400">Real-time autonomic nervous system balance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">Last 5 minutes</span>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Average HRV</p>
          <p className="text-2xl font-bold text-white">{statistics.average} <span className="text-sm text-gray-400">ms</span></p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Trend</p>
          <p className={`text-2xl font-bold ${statistics.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {getTrendIcon(statistics.trend)} {Math.abs(statistics.trend)}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Coherence</p>
          <p className={`text-2xl font-bold ${getCoherenceColor(statistics.coherence)}`}>
            {statistics.coherence}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
        />

        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 border border-gray-700"
          >
            <p className="text-sm text-gray-400">HRV</p>
            <p className="text-xl font-bold text-white">{hoveredPoint.hrv} ms</p>
            {hoveredPoint.heartRate && (
              <>
                <p className="text-sm text-gray-400 mt-2">Heart Rate</p>
                <p className="text-lg font-semibold text-white">{hoveredPoint.heartRate} bpm</p>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            {statistics.coherence >= 70 ? (
              <p>Excellent HRV coherence! Your nervous system is well-balanced, supporting optimal brain healing.</p>
            ) : statistics.coherence >= 40 ? (
              <p>Moderate HRV coherence. Consider deep breathing exercises to improve autonomic balance.</p>
            ) : (
              <p>Low HRV coherence detected. This may indicate stress. Try the guided breathing exercise.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HRVTimeline;