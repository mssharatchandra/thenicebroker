/**
 * Default inventory provider, used by API routes and the dashboard.
 *
 * Today: in-memory mock over 25 Bangalore listings.
 * Tomorrow: a NoBroker / Housing.com / community-data adapter that
 * implements the same InventoryProvider interface.
 */
import { mockProvider, MockInventoryProvider } from "./mock";

export const provider = mockProvider;
export { MockInventoryProvider };
export * from "./types";
