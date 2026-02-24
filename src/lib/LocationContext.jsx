import { createContext, useContext } from 'react';

/**
 * Provides the resolved franchise location to all nested route pages.
 * Set by LocationRouter when a /:locationSlug/* URL is matched.
 */
export const LocationContext = createContext(null);

export const useLocationData = () => useContext(LocationContext);
