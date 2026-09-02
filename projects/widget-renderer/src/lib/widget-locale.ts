export interface WidgetRendererChartLocale {
  progressAriaLabel: (title: string | undefined, value: string, range: string) => string;
  gaugeAriaLabel: (title: string | undefined, value: string, max: string) => string;
  chartAriaLabel: (title: string | undefined, chartType: string, pointCount: number) => string;
  progressSummary: (
    title: string | undefined,
    value: string,
    min: string,
    max: string,
    breakdown: string,
  ) => string;
  gaugeSummary: (
    title: string | undefined,
    value: string,
    max: string,
    percentage: string,
  ) => string;
  dataSummary: (title: string | undefined, points: string) => string;
  noDataSummary: (title: string | undefined) => string;
  noSegmentsSummary: string;
  morePoints: (count: number) => string;
  progressSegmentLabel: (label: string, value: string) => string;
  progressBreakdown: (label: string, start: string, end: string) => string;
}

export interface WidgetRendererAriaLocale {
  toolbarActions: string;
  loading: string;
  showSensitiveData: string;
  hideSensitiveData: string;
  imageUnavailable: string;
  chart: WidgetRendererChartLocale;
}

export interface WidgetRendererLocale {
  aria: WidgetRendererAriaLocale;
}

export interface WidgetRendererLocaleOverrides {
  aria?: Partial<Omit<WidgetRendererAriaLocale, 'chart'>> & {
    chart?: Partial<WidgetRendererChartLocale>;
  };
}

const chart = {
  progressAriaLabel: (title: string | undefined, value: string, range: string) =>
    `${title || 'Progress'}, ${value} of ${range}.`,
  gaugeAriaLabel: (title: string | undefined, value: string, max: string) =>
    `${title || 'Gauge'}, ${value} of ${max}.`,
  chartAriaLabel: (title: string | undefined, chartType: string, pointCount: number) =>
    `${title || chartType} chart, ${pointCount} data points.`,
  progressSummary: (
    title: string | undefined,
    value: string,
    min: string,
    max: string,
    breakdown: string,
  ) => `${title || 'Progress'}: ${value} of ${max}; range ${min} to ${max}.${breakdown}`,
  gaugeSummary: (title: string | undefined, value: string, max: string, percentage: string) =>
    `${title || 'Gauge'}: value ${value} of ${max}, ${percentage} percent.`,
  dataSummary: (title: string | undefined, points: string) =>
    `${title ? `${title}: ` : ''}${points}.`,
  noDataSummary: (title: string | undefined) => `${title ? `${title}: ` : ''}no data.`,
  noSegmentsSummary: ' No segments.',
  morePoints: (count: number) => `${count} more points.`,
  progressSegmentLabel: (label: string, value: string) => `${label}: ${value}`,
  progressBreakdown: (label: string, start: string, end: string) => `${label}: ${start} to ${end}`,
} satisfies WidgetRendererChartLocale;

export const defaultWidgetRendererLocale: WidgetRendererLocale = {
  aria: {
    toolbarActions: 'Widget actions',
    loading: 'Widget loading',
    showSensitiveData: 'Show sensitive data',
    hideSensitiveData: 'Hide sensitive data',
    imageUnavailable: 'Image unavailable',
    chart,
  },
};

function locale(
  aria: Omit<WidgetRendererAriaLocale, 'chart'>,
  chartLocale: WidgetRendererChartLocale,
): WidgetRendererLocale {
  return { aria: { ...aria, chart: chartLocale } };
}

export const germanWidgetRendererLocale = locale(
  {
    toolbarActions: 'Widget-Aktionen',
    loading: 'Widget wird geladen',
    showSensitiveData: 'Sensible Daten anzeigen',
    hideSensitiveData: 'Sensible Daten ausblenden',
    imageUnavailable: 'Bild nicht verfügbar',
  },
  {
    ...chart,
    progressAriaLabel: (title, value, range) => `${title || 'Fortschritt'}, ${value} von ${range}.`,
    gaugeAriaLabel: (title, value, max) => `${title || 'Messwert'}, ${value} von ${max}.`,
    chartAriaLabel: (title, type, count) => `${title || `${type}-Diagramm`}, ${count} Datenpunkte.`,
    progressSummary: (title, value, min, max, breakdown) =>
      `${title || 'Fortschritt'}: ${value} von ${max}; Bereich ${min} bis ${max}.${breakdown}`,
    gaugeSummary: (title, value, max, percentage) =>
      `${title || 'Messwert'}: Wert ${value} von ${max}, ${percentage} Prozent.`,
    noDataSummary: (title) => `${title ? `${title}: ` : ''}keine Daten.`,
    noSegmentsSummary: ' Keine Segmente.',
    morePoints: (count) => `${count} weitere Datenpunkte.`,
    progressSegmentLabel: (label, value) => `${label}: ${value}`,
    progressBreakdown: (label, start, end) => `${label}: ${start} bis ${end}`,
  },
);

export const frenchWidgetRendererLocale = locale(
  {
    toolbarActions: 'Actions du widget',
    loading: 'Chargement du widget',
    showSensitiveData: 'Afficher les données sensibles',
    hideSensitiveData: 'Masquer les données sensibles',
    imageUnavailable: 'Image indisponible',
  },
  {
    ...chart,
    progressAriaLabel: (title, value, range) => `${title || 'Progression'}, ${value} sur ${range}.`,
    gaugeAriaLabel: (title, value, max) => `${title || 'Jauge'}, ${value} sur ${max}.`,
    chartAriaLabel: (title, type, count) =>
      `${title || `Graphique ${type}`}, ${count} points de données.`,
    progressSummary: (title, value, min, max, breakdown) =>
      `${title || 'Progression'} : ${value} sur ${max} ; plage de ${min} à ${max}.${breakdown}`,
    gaugeSummary: (title, value, max, percentage) =>
      `${title || 'Jauge'} : valeur ${value} sur ${max}, ${percentage} pour cent.`,
    noDataSummary: (title) => `${title ? `${title} : ` : ''}aucune donnée.`,
    noSegmentsSummary: ' Aucun segment.',
    morePoints: (count) => `${count} points de données supplémentaires.`,
    progressSegmentLabel: (label, value) => `${label} : ${value}`,
    progressBreakdown: (label, start, end) => `${label} : de ${start} à ${end}`,
  },
);

export const dutchWidgetRendererLocale = locale(
  {
    toolbarActions: 'Widgetacties',
    loading: 'Widget wordt geladen',
    showSensitiveData: 'Gevoelige gegevens tonen',
    hideSensitiveData: 'Gevoelige gegevens verbergen',
    imageUnavailable: 'Afbeelding niet beschikbaar',
  },
  {
    ...chart,
    progressAriaLabel: (title, value, range) => `${title || 'Voortgang'}, ${value} van ${range}.`,
    gaugeAriaLabel: (title, value, max) => `${title || 'Meter'}, ${value} van ${max}.`,
    chartAriaLabel: (title, type, count) =>
      `${title || `${type}-grafiek`}, ${count} gegevenspunten.`,
    progressSummary: (title, value, min, max, breakdown) =>
      `${title || 'Voortgang'}: ${value} van ${max}; bereik ${min} tot ${max}.${breakdown}`,
    gaugeSummary: (title, value, max, percentage) =>
      `${title || 'Meter'}: waarde ${value} van ${max}, ${percentage} procent.`,
    noDataSummary: (title) => `${title ? `${title}: ` : ''}geen gegevens.`,
    noSegmentsSummary: ' Geen segmenten.',
    morePoints: (count) => `${count} extra gegevenspunten.`,
    progressSegmentLabel: (label, value) => `${label}: ${value}`,
    progressBreakdown: (label, start, end) => `${label}: ${start} tot ${end}`,
  },
);
