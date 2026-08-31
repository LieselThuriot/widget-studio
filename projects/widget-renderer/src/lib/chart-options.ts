import type { EChartsCoreOption } from 'echarts/core';
import { ChartElement } from './widget.model';

export function chartOptions(
  element: ChartElement,
  tooltipLayer?: HTMLElement,
  tooltipEnabled = true,
): EChartsCoreOption {
  const base = {
    animation: false,
    title: element.title
      ? {
          text: element.title,
          left: 'center',
          textStyle: { fontSize: element.style.font.size, color: element.style.color.title },
        }
      : undefined,
    legend:
      (element.type === 'pie' || element.type === 'donut' || element.type === 'funnel') &&
      element.showLegend
        ? {
            bottom: 10,
            textStyle: { fontSize: element.style.font.size, color: element.style.color.legend },
          }
        : undefined,
    tooltip: {
      show: tooltipEnabled,
      trigger:
        element.type === 'pie' || element.type === 'donut' || element.type === 'funnel'
          ? 'item'
          : 'axis',
      ...(tooltipLayer ? { appendToBody: false, appendTo: tooltipLayer } : {}),
    },
  } satisfies EChartsCoreOption;

  if (element.type === 'pie' || element.type === 'donut') {
    return {
      ...base,
      series: [
        {
          type: 'pie',
          center: ['50%', element.title ? '54%' : '50%'],
          radius:
            element.type === 'donut'
              ? [element.title ? '34%' : '45%', element.title ? '54%' : '72%']
              : element.title
                ? '62%'
                : '68%',
          label: { show: false },
          labelLine: { show: false },
          data: element.data.map(({ label, value, color }) => ({
            name: label,
            value,
            ...(color ? { itemStyle: { color } } : {}),
          })),
        },
      ],
    };
  }
  if (element.type === 'funnel') {
    return {
      ...base,
      series: [
        {
          type: 'funnel',
          left: '8%',
          right: '8%',
          top: element.title ? 38 : 12,
          bottom: element.showLegend ? 38 : 12,
          min: 0,
          max: Math.max(...element.data.map(({ value }) => value), 1),
          minSize: '10%',
          maxSize: '88%',
          sort: 'descending',
          gap: 3,
          label: { show: false },
          labelLine: { show: false },
          emphasis: { label: { show: false }, labelLine: { show: false } },
          data: element.data.map(({ label, value, color }) => ({
            name: label,
            value,
            ...(color ? { itemStyle: { color } } : {}),
          })),
        },
      ],
    };
  }
  if (element.type === 'gauge') {
    const percentage = Math.max(
      0,
      Math.min(1, (element.data.value - element.data.min) / (element.data.max - element.data.min)),
    );
    return {
      ...base,
      title: element.title
        ? {
            text: element.title,
            left: 'center',
            bottom: 0,
            textStyle: { fontSize: element.style.font.size, color: element.style.color.title },
          }
        : undefined,
      series: [
        {
          type: 'gauge',
          center: ['50%', '58%'],
          radius: '78%',
          startAngle: 200,
          endAngle: -20,
          min: element.data.min,
          max: element.data.max,
          splitNumber: 6,
          axisLine: {
            lineStyle: {
              width: 16,
              cap: 'round',
              color: [
                [percentage, element.style.color.fill],
                [1, element.style.color.track],
              ],
            },
          },
          axisTick: {
            distance: -22,
            splitNumber: 5,
            length: 4,
            lineStyle: { color: element.style.color.legend, width: 1 },
          },
          splitLine: {
            distance: -24,
            length: 8,
            lineStyle: { color: element.style.color.legend, width: 2 },
          },
          axisLabel: {
            show: element.showLegend,
            distance: -2,
            color: element.style.color.legend,
            fontSize: element.style.font.size,
            formatter: (value: number) => `${Math.round(value)}`,
          },
          pointer: {
            show: true,
            length: '55%',
            width: 5,
            itemStyle: { color: element.style.color.legend },
          },
          progress: { show: true, itemStyle: { color: element.style.color.fill } },
          detail: {
            show: element.showLegend,
            valueAnimation: false,
            formatter: (value: number) => `${Math.round(value)}`,
            color: element.style.color.legend,
            fontSize: element.style.font.size,
          },
          data: [{ value: element.data.value }],
        },
      ],
    };
  }
  const seriesElement = element as Extract<ChartElement, { type: 'bar' | 'line' }>;
  return {
    ...base,
    grid: {
      left: 34,
      right: 12,
      top: element.title ? 30 : 12,
      bottom: element.showLegend ? 28 : 24,
      outerBoundsMode: 'same',
      outerBoundsContain: 'axisLabel',
    },
    xAxis: {
      type: 'category',
      data: element.data.map(({ label }) => label),
      axisLabel: { color: seriesElement.style.axis.label, fontSize: seriesElement.style.font.size },
      axisLine: { lineStyle: { color: seriesElement.style.axis.line } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: seriesElement.style.axis.label, fontSize: seriesElement.style.font.size },
      axisLine: { lineStyle: { color: seriesElement.style.axis.line } },
      splitLine: { lineStyle: { color: seriesElement.style.axis.grid } },
    },
    series: [
      {
        type: seriesElement.type,
        data: seriesElement.data.map(({ value, color }) => ({
          value,
          ...(seriesElement.type === 'line'
            ? { itemStyle: { color: color ?? seriesElement.style.color.line } }
            : { itemStyle: { color } }),
        })),
        itemStyle:
          seriesElement.type === 'line' ? { color: seriesElement.style.color.line } : undefined,
        lineStyle:
          seriesElement.type === 'line' ? { color: seriesElement.style.color.line } : undefined,
        symbol: seriesElement.type === 'line' ? 'circle' : undefined,
        smooth: seriesElement.type === 'line',
      },
    ],
  };
}
