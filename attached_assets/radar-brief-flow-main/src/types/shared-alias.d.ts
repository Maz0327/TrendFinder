// Global module shim for @shared/database.types so TS can resolve it without tsconfig paths
// Explicit named type re-exports from ../../shared/database.types

declare module "@shared/database.types" {
  export type Json = import("../../shared/database.types").Json;
  export type Database = import("../../shared/database.types").Database;
  export type ProjectRow = import("../../shared/database.types").ProjectRow;
  export type CaptureRow = import("../../shared/database.types").CaptureRow;
  export type MomentRow = import("../../shared/database.types").MomentRow;
  export type BriefRow = import("../../shared/database.types").BriefRow;
  export type UserFeedRow = import("../../shared/database.types").UserFeedRow;
}

