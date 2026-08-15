import { Widget } from 'widget-renderer';

export const sampleWidget: Widget = {
  version: 2,
  size: 'square',
  rows: [
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
  ],
  columns: [
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
  ],
  background: {
    color: '#101827',
    anchor: 'center',
    sensitive: false,
    repeat: false,
    size: 'cover',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900',
    overlayColor: '#101827b8',
  },
  refresh: { enabled: true, label: 'Refresh widget' },
  elements: [
    {
      id: 'headline',
      type: 'text',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 3, anchor: 'top left' },
      sensitive: false,
      text: 'TODAY · 09:42',
      style: {
        color: '#d4dbea',
        font: { size: 10, weight: 600, style: 'normal', decoration: 'none' },
        align: 'left',
        wrap: true,
      },
    },
    {
      id: 'message',
      type: 'text',
      grid: { row: 1, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'top left' },
      sensitive: false,
      text: 'Your daily brief',
      style: {
        color: '#f6f7fb',
        font: { size: 21, weight: 700, style: 'normal', decoration: 'none' },
        align: 'left',
        wrap: true,
      },
    },
    {
      id: 'caption',
      type: 'text',
      grid: { row: 2, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'top left' },
      sensitive: true,
      text: 'A focused view of what needs your attention.',
      style: {
        color: '#e2e6ef',
        font: { size: 12, weight: 500, style: 'normal', decoration: 'none' },
        align: 'left',
        wrap: true,
      },
    },
    {
      id: 'details',
      type: 'button',
      grid: { row: 2, column: 2, rowSpan: 1, columnSpan: 1, anchor: 'bottom right' },
      sensitive: false,
      label: 'Open',
      method: 'get',
      url: '/brief',
      style: 'outline',
    },
  ],
};
