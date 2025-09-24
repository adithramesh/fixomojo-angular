
export interface AutocompleteSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    // Add other properties you might use from the LocationIQ API
}

export interface GeolocationCoordinates {
    latitude: number;
    longitude: number;
}