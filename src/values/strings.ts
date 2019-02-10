export const strings = {
  emptySiteInfoDetail:
    "(Access endpoint / stations / { stationId } requires an API key, so I don't have anything to display here.This blank view was just created to show the slide- up animation.)",
  locationServiceDisabled:
    'Please enable location service so we can show free charging stations near you.',
  siteDescription: (available: number, total: number, level: string) =>
    /* prettier-ignore */
    `${available} of ${total} charger${total >= 2 ? 's' : ''} available - ${level}`,
};
