import { Widget } from 'widget-renderer';

export interface WidgetSample {
  id: string;
  name: string;
  description: string;
  widget: Widget;
}

const dailyBrief: Widget = {
  version: 2,
  size: 'square',
  rows: [
    { size: 1, unit: 'auto' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'auto' },
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
      grid: { row: 1, column: 0, rowSpan: 1, columnSpan: 3, anchor: 'top left' },
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

const payslip: Widget = {
  version: 2,
  size: 'square',
  rows: [
    { size: 1, unit: 'auto' },
    { size: 1, unit: 'auto' },
    { size: 1, unit: 'auto' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'auto' },
  ],
  columns: [
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
  ],
  background: {
    color: '#edf4ef',
    anchor: 'center',
    sensitive: false,
    repeat: false,
    size: 'cover',
    overlayColor: '#edf4efee',
  },
  refresh: { enabled: true, label: 'Refresh payslip' },
  elements: [
    {
      id: 'payslip-label',
      type: 'text',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 3, anchor: 'top left' },
      sensitive: false,
      text: 'PAYROLL · JUNE 2026',
      style: { color: '#4d8064', font: { size: 9, weight: 700 }, align: 'left', wrap: true },
    },
    {
      id: 'payslip-image',
      type: 'image',
      grid: { row: 0, column: 3, rowSpan: 4, columnSpan: 1, anchor: 'center' },
      sensitive: false,
      source: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500',
      alt: 'Colleagues smiling together in a bright office',
      fit: 'cover',
      overlayColor: '#2f684230',
      radius: 12,
    },
    {
      id: 'payslip-title',
      type: 'text',
      grid: { row: 1, column: 0, rowSpan: 1, columnSpan: 3, anchor: 'center left' },
      sensitive: false,
      text: 'Your payslip',
      style: { color: '#20372a', font: { size: 19, weight: 700 }, align: 'left', wrap: true },
    },
    {
      id: 'payslip-net-label',
      type: 'text',
      grid: { row: 2, column: 0, rowSpan: 1, columnSpan: 3, anchor: 'bottom left' },
      sensitive: false,
      text: 'NET PAY',
      style: { color: '#4d8064', font: { size: 9, weight: 700 }, align: 'left', wrap: true },
    },
    {
      id: 'payslip-amount',
      type: 'text',
      grid: { row: 3, column: 0, rowSpan: 1, columnSpan: 3, anchor: 'center left' },
      sensitive: true,
      text: '€2,480.00',
      style: { color: '#173d2b', font: { size: 32, weight: 700 }, align: 'left', wrap: true },
    },
    {
      id: 'payslip-employee',
      type: 'text',
      grid: { row: 4, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'bottom left' },
      sensitive: true,
      text: 'Alex Morgan · Product Design',
      style: { color: '#4b6656', font: { size: 10, weight: 600 }, align: 'left', wrap: true },
    },
    {
      id: 'payslip-open',
      type: 'button',
      grid: { row: 4, column: 2, rowSpan: 1, columnSpan: 2, anchor: 'bottom right' },
      sensitive: false,
      label: 'View details',
      method: 'get',
      url: '/payslip',
      style: 'solid',
    },
  ],
};

const clockedIn: Widget = {
  version: 2,
  size: 'wide',
  rows: [
    { size: 1, unit: 'auto' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'auto' },
  ],
  columns: [
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
  ],
  background: {
    color: '#112b30',
    anchor: 'center',
    sensitive: false,
    repeat: false,
    size: 'cover',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200',
    overlayColor: '#082b30c9',
  },
  refresh: { enabled: true, label: 'Refresh time' },
  elements: [
    {
      id: 'clock-status',
      type: 'text',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'top left' },
      sensitive: false,
      text: 'WORKDAY · TUESDAY 16 JUNE',
      style: { color: '#9be7d1', font: { size: 10, weight: 700 }, align: 'left', wrap: true },
    },
    {
      id: 'clock-title',
      type: 'text',
      grid: { row: 1, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'center left' },
      sensitive: false,
      text: 'Clocked in\nKeep the momentum going.',
      style: { color: '#f4fffb', font: { size: 22, weight: 700 }, align: 'left', wrap: true },
    },
    {
      id: 'clock-progress',
      type: 'progress',
      grid: { row: 2, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'bottom left' },
      sensitive: false,
      data: { label: 'hours worked', value: 3, min: 0, max: 8 },
      showLegend: true,
      active: true,
      style: {
        color: { legend: '#e7fff7', fill: '#70e0bd', track: '#ffffff38' },
        font: { size: 11 },
      },
    },
    {
      id: 'clock-action',
      type: 'button',
      grid: { row: 2, column: 2, rowSpan: 1, columnSpan: 1, anchor: 'bottom right' },
      sensitive: false,
      label: 'Clock out',
      method: 'post',
      url: '/clock-out',
      style: 'outline',
    },
  ],
};

const holidayBalance: Widget = {
  version: 2,
  size: 'wide',
  rows: [
    { size: 1, unit: 'auto' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'auto' },
  ],
  columns: [
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
    { size: 1, unit: 'star' },
  ],
  background: {
    color: '#173b54',
    anchor: 'center',
    sensitive: false,
    repeat: false,
    size: 'cover',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    overlayColor: '#123b54a8',
  },
  refresh: { enabled: true, label: 'Refresh holiday balance' },
  elements: [
    {
      id: 'holiday-label',
      type: 'text',
      grid: { row: 0, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'top left' },
      sensitive: false,
      text: 'TIME AWAY · 2026 ALLOWANCE',
      style: { color: '#c9f1ff', font: { size: 10, weight: 700 }, align: 'left', wrap: true },
    },
    {
      id: 'holiday-title',
      type: 'text',
      grid: { row: 1, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'center left' },
      sensitive: false,
      text: 'A little more\nroom to roam.',
      style: { color: '#ffffff', font: { size: 23, weight: 700 }, align: 'left', wrap: true },
    },
    {
      id: 'holiday-chart',
      type: 'donut',
      grid: { row: 0, column: 2, rowSpan: 3, columnSpan: 1, anchor: 'center' },
      sensitive: false,
      title: '18 days left',
      showLegend: true,
      data: [
        { label: 'Remaining', value: 18, color: '#ffd27d' },
        { label: 'Used', value: 7, color: '#ffffff55' },
      ],
      style: { color: { legend: '#f4fbff', title: '#ffffff' }, font: { size: 10 } },
    },
    {
      id: 'holiday-caption',
      type: 'text',
      grid: { row: 2, column: 0, rowSpan: 1, columnSpan: 2, anchor: 'bottom left' },
      sensitive: false,
      text: '25 days available · 7 booked',
      style: { color: '#d8f2fb', font: { size: 11, weight: 600 }, align: 'left', wrap: true },
    },
  ],
};

export const sampleWidgets: readonly WidgetSample[] = [
  {
    id: 'daily-brief',
    name: 'Daily brief',
    description: 'A focused morning overview',
    widget: dailyBrief,
  },
  { id: 'payslip', name: 'Payslip', description: 'Sensitive payroll information', widget: payslip },
  {
    id: 'clocked-in',
    name: 'Clocked in',
    description: "Track today's working hours",
    widget: clockedIn,
  },
  {
    id: 'holiday-balance',
    name: 'Holiday balance',
    description: 'See time away at a glance',
    widget: holidayBalance,
  },
];

export const sampleWidget = dailyBrief;
