import type { Cell } from '../grid';

/**
 * Breadth-first search: explores the grid layer by layer from start.
 * Returns the order we visited cells (for animation) and the shortest path.
 * Does NOT touch React state — pure data in, pure data out.
 */
export function bfs(
  grid: Cell[][],
  start: Cell,
  end: Cell,
): { visitedInOrder: Cell[]; path: Cell[] } {
  const rows = grid.length;
  const cols = grid[0].length;

  // Up, down, left, right
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  // True if (r, c) is a real cell on the board
  function isInside(r: number, c: number): boolean {
    return r >= 0 && r < rows && c >= 0 && c < cols;
  }

  // Track visited with a boolean grid so we never mutate Cell objects
  const visited: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    visited.push(Array(cols).fill(false));
  }

  // cameFrom[r][c] = the cell we stepped from to reach (r, c)
  const cameFrom: (Cell | null)[][] = [];
  for (let r = 0; r < rows; r++) {
    cameFrom.push(Array(cols).fill(null));
  }

  const visitedInOrder: Cell[] = [];
  const queue: Cell[] = [];

  // Start the search at the start cell
  queue.push(start);
  visited[start.row][start.col] = true;

  let foundEnd = false;

  while (queue.length > 0) {
    // Take the oldest cell in the queue (front of the line)
    const current = queue.shift()!;
    visitedInOrder.push(current);

    // Done if we reached the end
    if (current.row === end.row && current.col === end.col) {
      foundEnd = true;
      break;
    }

    // Look at each neighbor
    for (const [dr, dc] of directions) {
      const nextRow = current.row + dr;
      const nextCol = current.col + dc;

      if (!isInside(nextRow, nextCol)) continue;
      if (visited[nextRow][nextCol]) continue;
      if (grid[nextRow][nextCol].isWall) continue;

      // Mark visited when we enqueue (avoids adding the same cell twice)
      visited[nextRow][nextCol] = true;
      cameFrom[nextRow][nextCol] = current;
      queue.push(grid[nextRow][nextCol]);
    }
  }

  // Walk backwards from end → start using cameFrom, then reverse
  const path: Cell[] = [];
  if (foundEnd) {
    let curr: Cell | null = end;
    while (curr !== null) {
      path.push(curr);
      curr = cameFrom[curr.row][curr.col];
    }
    path.reverse(); // now start → end
  }

  return { visitedInOrder, path };
}
