// One square on the board
export type Cell = {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
};

export const ROWS = 20;
export const COLS = 40;

// Fixed start and end positions
export const START_ROW = 10;
export const START_COL = 5;
export const END_ROW = 10;
export const END_COL = 34;

/** Build a fresh 20x40 grid with start and end set. */
export function createGrid(): Cell[][] {
  const grid: Cell[][] = [];

  for (let row = 0; row < ROWS; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push({
        row,
        col,
        isWall: false,
        isStart: row === START_ROW && col === START_COL,
        isEnd: row === END_ROW && col === END_COL,
        isVisited: false,
        isPath: false,
      });
    }
    grid.push(currentRow);
  }

  return grid;
}
