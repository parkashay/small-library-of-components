export type Tools = "rect" | "circle" | null;

export type ToolType = Exclude<Tools, null>;
