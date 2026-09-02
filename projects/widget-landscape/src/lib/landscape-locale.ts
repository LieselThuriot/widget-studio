export interface WidgetLandscapeAriaLocale {
  columns: string;
  responsive: string;
  edit: string;
  widgets: string;
  widgetFootprint: (columns: number, rows: number) => string;
  selectWidget: string;
  deleteWidget: string;
}

export interface WidgetLandscapeLocale {
  landscape: string;
  columns: string;
  responsive: string;
  cancel: string;
  confirm: string;
  addWidget: string;
  clearAll: string;
  emptyEditMode: string;
  emptyLandscape: string;
  columnCount: (count: number) => string;
  refreshFallback: string;
  aria: WidgetLandscapeAriaLocale;
}

export type WidgetLandscapeLocaleOverrides = Partial<Omit<WidgetLandscapeLocale, 'aria'>> & {
  aria?: Partial<WidgetLandscapeAriaLocale>;
};

export const defaultWidgetLandscapeLocale: WidgetLandscapeLocale = {
  landscape: 'Widget landscape',
  columns: 'Columns',
  responsive: 'Responsive',
  cancel: 'Cancel',
  confirm: 'Confirm',
  addWidget: 'Add widget',
  clearAll: 'Clear all',
  emptyEditMode: 'Choose a widget from the palette to add it.',
  emptyLandscape: 'Open edit mode to add a widget.',
  columnCount: (count) => `${count} columns`,
  refreshFallback: 'Refresh widget',
  aria: {
    columns: 'Landscape columns',
    responsive: 'Responsive landscape',
    edit: 'Edit landscape',
    widgets: 'Widgets',
    widgetFootprint: (columns, rows) => `Widget footprint: ${columns} × ${rows}`,
    selectWidget: 'Select widget',
    deleteWidget: 'Delete widget',
  },
};

export const germanWidgetLandscapeLocale: WidgetLandscapeLocale = {
  landscape: 'Widget-Landschaft',
  columns: 'Spalten',
  responsive: 'Responsiv',
  cancel: 'Abbrechen',
  confirm: 'Bestätigen',
  addWidget: 'Widget hinzufügen',
  clearAll: 'Alle löschen',
  emptyEditMode: 'Wählen Sie ein Widget aus der Palette aus, um es hinzuzufügen.',
  emptyLandscape: 'Öffnen Sie den Bearbeitungsmodus, um ein Widget hinzuzufügen.',
  columnCount: (count) => `${count} ${count === 1 ? 'Spalte' : 'Spalten'}`,
  refreshFallback: 'Widget aktualisieren',
  aria: {
    columns: 'Landschaftsspalten',
    responsive: 'Responsives Widget-Layout',
    edit: 'Landschaft bearbeiten',
    widgets: 'Widgets',
    widgetFootprint: (columns, rows) => `Widget-Größe: ${columns} × ${rows}`,
    selectWidget: 'Widget auswählen',
    deleteWidget: 'Widget löschen',
  },
};

export const frenchWidgetLandscapeLocale: WidgetLandscapeLocale = {
  landscape: 'Tableau de widgets',
  columns: 'Colonnes',
  responsive: 'Adaptatif',
  cancel: 'Annuler',
  confirm: 'Confirmer',
  addWidget: 'Ajouter un widget',
  clearAll: 'Tout effacer',
  emptyEditMode: "Choisissez un widget dans la palette pour l'ajouter.",
  emptyLandscape: 'Ouvrez le mode édition pour ajouter un widget.',
  columnCount: (count) => `${count} ${count === 1 ? 'colonne' : 'colonnes'}`,
  refreshFallback: 'Actualiser le widget',
  aria: {
    columns: 'Colonnes du tableau',
    responsive: 'Tableau adaptatif',
    edit: 'Modifier le tableau',
    widgets: 'Widgets',
    widgetFootprint: (columns, rows) => `Taille du widget : ${columns} × ${rows}`,
    selectWidget: 'Sélectionner le widget',
    deleteWidget: 'Supprimer le widget',
  },
};

export const dutchWidgetLandscapeLocale: WidgetLandscapeLocale = {
  landscape: 'Widgetlandschap',
  columns: 'Kolommen',
  responsive: 'Responsief',
  cancel: 'Annuleren',
  confirm: 'Bevestigen',
  addWidget: 'Widget toevoegen',
  clearAll: 'Alles wissen',
  emptyEditMode: 'Kies een widget uit het palet om deze toe te voegen.',
  emptyLandscape: 'Open de bewerkingsmodus om een widget toe te voegen.',
  columnCount: (count) => `${count} ${count === 1 ? 'kolom' : 'kolommen'}`,
  refreshFallback: 'Widget vernieuwen',
  aria: {
    columns: 'Kolommen van het landschap',
    responsive: 'Responsief widgetlandschap',
    edit: 'Widgetlandschap bewerken',
    widgets: 'Widgets',
    widgetFootprint: (columns, rows) => `Widgetafmetingen: ${columns} × ${rows}`,
    selectWidget: 'Widget selecteren',
    deleteWidget: 'Widget verwijderen',
  },
};
