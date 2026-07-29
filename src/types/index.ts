export interface RS {
  rw:  number;
  rh:  number;
  ox:  number;
  oy:  number;
  idx: number;
}

export type LoadState = "idle" | "complete" | "expand" | "hollow" | "ready";
