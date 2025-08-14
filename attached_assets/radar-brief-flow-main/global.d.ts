// Global module shim for @shared/database.types so TS can resolve it without tsconfig paths
declare module "@shared/database.types" {
  export * from "./shared/database.types";
}
