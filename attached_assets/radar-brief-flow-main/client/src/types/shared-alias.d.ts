// Local shim to resolve @shared/database.types for files under client/src
// Explicit named type re-exports to ensure TS sees the members

declare module "@shared/database.types" {
  export type Json = import("../../../shared/database.types").Json;
  export type Database = import("../../../shared/database.types").Database;
  export type ProjectRow = import("../../../shared/database.types").ProjectRow;
  export type CaptureRow = import("../../../shared/database.types").CaptureRow;
  export type MomentRow = import("../../../shared/database.types").MomentRow;
  export type BriefRow = import("../../../shared/database.types").BriefRow;
  export type UserFeedRow = import("../../../shared/database.types").UserFeedRow;
}
