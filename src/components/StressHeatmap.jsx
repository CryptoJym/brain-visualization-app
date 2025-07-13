import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Flame, Calendar, Clock, AlertTriangle } from 'lucide-react';

const StressHeatmap = ({ data = [] }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [stressPatterns, setStressPatterns] = useState({
    peakHours: [],
    calmHours: [],
    weeklyAverage: 0,
    volatility: 0
  });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height: 400 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Process data into hourly and daily aggregates
    const processedData = processStressData(data);
    analyzePatterns(processedData);
    drawHeatmap(processedData);
  }, [data, dimensions]);

  const processStressData = (rawData) => {
    // Create a 7x24 matrix (days x hours)
    const matrix = Array(7).fill(null).map(() => Array(24).fill(0));
    const counts = Array(7).fill(null).map(() => Array(24).fill(0));

    rawData.forEach(point => {
      if (point.stressLevel !== undefined) {
        const date = new Date(point.timestamp);
        const day = date.getDay();
        const hour = date.getHours();
        
        matrix[day][hour] += point.stressLevel;
        counts[day][hour]++;
      }
    });

    // Calculate averages
    const processedMatrix = matrix.map((day, dayIndex) => 
      day.map((stress, hourIndex) => {
        const count = counts[dayIndex][hourIndex];
        return count > 0 ? stress / count : null;
      })
    );

    return processedMatrix;
  };

  const analyzePatterns = (matrix) => {
    const allValues = matrix.flat().filter(v => v !== null);
    if (allValues.length === 0) return;

    // Find peak and calm hours
    const hourlyAverages = Array(24).fill(0).map((_, hour) => {
      const hourValues = matrix.map(day => day[hour]).filter(v => v !== null);
      return hourValues.length > 0 
        ? hourValues.reduce((a, b) => a + b) / hourValues.length 
        : 0;
    });

    const sortedHours = hourlyAverages
      .map((avg, hour) => ({ hour, avg }))
      .sort((a, b) => b.avg - a.avg);

    const peakHours = sortedHours.slice(0, 3).map(h => h.hour);
    const calmHours = sortedHours.slice(-3).map(h => h.hour);

    // Calculate weekly average and volatility
    const weeklyAverage = allValues.reduce((a, b) => a + b) / allValues.length;
    const variance = allValues.reduce((sum, val) => sum + Math.pow(val - weeklyAverage, 2), 0) / allValues.length;
    const volatility = Math.sqrt(variance);

    setStressPatterns({
      peakHours,
      calmHours,
      weeklyAverage: weeklyAverage * 100,
      volatility: volatility * 100
    });
  };

  const drawHeatmap = (matrix) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 50, right: 30, bottom: 50, left: 80 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate cell dimensions
    const cellWidth = width / 24;
    const cellHeight = height / 7;

    // Color scale
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateRdYlBu)
      .domain([1, 0]); // Reversed so red is high stress

    // Days of week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Draw cells
    matrix.forEach((dayData, dayIndex) => {
      dayData.forEach((stress, hourIndex) => {
        if (stress !== null) {
          const rect = g.append('rect')
            .attr('x', hourIndex * cellWidth)
            .attr('y', dayIndex * cellHeight)
            .attr('width', cellWidth - 2)
            .attr('height', cellHeight - 2)
            .attr('fill', colorScale(stress))
            .attr('rx', 4)
            .attr('opacity', 0.9)
            .on('mouseenter', function(event) {
              d3.select(this).attr('opacity', 1);
              setHoveredCell({
                day: days[dayIndex],
                hour: hourIndex,
                stress: Math.round(stress * 100)
              });
            })
            .on('mouseleave', function() {
              d3.select(this).attr('opacity', 0.9);
              setHoveredCell(null);
            });

          // Add pulse animation for high stress cells
          if (stress > 0.7) {
            rect.classed('animate-pulse', true);
          }
        }
      });
    });

    // Add day labels
    g.selectAll('.day-label')
      .data(days)
      .enter().append('text')
      .attr('class', 'day-label')
      .attr('x', -10)
      .attr('y', (d, i) => i * cellHeight + cellHeight / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', 12)
      .text(d => d);

    // Add hour labels
    const hourLabels = Array(24).fill(0).map((_, i) => i);
    g.selectAll('.hour-label')
      .data(hourLabels)
      .enter().append('text')
      .attr('class', 'hour-label')
      .attr('x', (d, i) => i * cellWidth + cellWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', 11)
      .text(d => d % 3 === 0 ? `${d}:00` : '');

    // Add legend
    const legendWidth = 200;
    const legendHeight = 10;
    const legend = svg.append('g')
      .attr('transform', `translate(${dimensions.width - legendWidth - 20}, 10)`);

    const legendScale = d3.scaleLinear()
      .domain([0, legendWidth])
      .range([0, 100]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    // Create gradient for legend
    const gradientId = 'stress-gradient';
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('x2', '100%');

    for (let i = 0; i <= 10; i++) {
      gradient.append('stop')
        .attr('offset', `${i * 10}%`)
        .attr('stop-color', colorScale(1 - i / 10));
    }

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', `url(#${gradientId})`)
      .attr('rx', 5);

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .attr('color', '#9ca3af');
  };

  const formatHour = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Stress Patterns</h3>
            <p className="text-sm text-gray-400">Weekly stress levels by hour</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">Last 7 days</span>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Weekly Average</p>
          <p className="text-xl font-bold text-white">{Math.round(stressPatterns.weeklyAverage)}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Volatility</p>
          <p className={`text-xl font-bold ${stressPatterns.volatility > 30 ? 'text-orange-400' : 'text-green-400'}`}>
            {Math.round(stressPatterns.volatility)}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Peak Hours</p>
          <p className="text-sm font-medium text-white">
            {stressPatterns.peakHours.map(h => formatHour(h)).join(', ')}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Calm Hours</p>
          <p className="text-sm font-medium text-white">
            {stressPatterns.calmHours.map(h => formatHour(h)).join(', ')}
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
        />

        {/* Tooltip */}
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 border border-gray-700"
          >
            <p className="text-sm font-medium text-white">{hoveredCell.day}, {formatHour(hoveredCell.hour)}</p>
            <p className="text-2xl font-bold text-white mt-1">{hoveredCell.stress}%</p>
            <p className="text-xs text-gray-400 mt-1">Stress Level</p>
          </motion.div>
        )}
      </div>

      {/* Recommendations */}
      {stressPatterns.peakHours.length > 0 && (
        <div className="mt-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-orange-400 mb-1">Stress Pattern Detected</p>
              <p>Your stress levels peak around {stressPatterns.peakHours.map(h => formatHour(h)).join(', ')}. 
              Consider scheduling breaks or calming activities during these times.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StressHeatmap;