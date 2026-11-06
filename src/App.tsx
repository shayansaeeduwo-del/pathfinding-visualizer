import { useState } from 'react';
import {
  createGrid,
  START_ROW,
  START_COL,
  END_ROW,
  END_COL,
  type Cell,
} from './grid';
import { bfs } from './algorithms/bfs';
import './App.css';

/** Wait `ms` milliseconds (used to space out the animation). */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function App() {
  // The whole board lives in React state as a 2D array
  const [grid, setGrid] = useState<Cell[][]>(() => createGrid());

  // True while the mouse button is held down
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Remember whether this drag is drawing walls or erasing them
  const [isDrawingWall, setIsDrawingWall] = useState(true);

  // True while visited/path animation is running
  const [isAnimating, setIsAnimating] = useState(false);

  /** Flip (or set) isWall on one cell; never touch start/end. */
  function updateWall(row: number, col: number, makeWall: boolean) {
    setGrid((prev) => {
      const cell = prev[row][col];
      if (cell.isStart || cell.isEnd) return prev;

      // Copy the row so React sees a new array and re-renders
      const newGrid = prev.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = { ...cell, isWall: makeWall };
      newGrid[row] = newRow;
      return newGrid;
    });
  }

  /** Mouse down: start a drag; toggle based on the cell you clicked. */
  function handleMouseDown(row: number, col: number) {
    if (isAnimating) return;
    const cell = grid[row][col];
    if (cell.isStart || cell.isEnd) return;

    const makeWall = !cell.isWall; // empty → wall, wall → empty
    setIsDrawingWall(makeWall);
    setIsMouseDown(true);
    updateWall(row, col, makeWall);
  }

  /** Mouse enter while dragging: keep drawing or erasing. */
  function handleMouseEnter(row: number, col: number) {
    if (isAnimating || !isMouseDown) return;
    updateWall(row, col, isDrawingWall);
  }

  /** Mouse up anywhere: stop the drag. */
  function handleMouseUp() {
    setIsMouseDown(false);
  }

  /** Reset to a fresh grid with only start and end (clears walls/visited/path). */
  function clearBoard() {
    setGrid(createGrid());
  }

  /** Mark one cell's isVisited or isPath flag without touching others. */
  function paintCell(row: number, col: number, flag: 'isVisited' | 'isPath') {
    setGrid((prev) => {
      const newGrid = prev.slice();
      const newRow = newGrid[row].slice();
      newRow[col] = { ...newRow[col], [flag]: true };
      newGrid[row] = newRow;
      return newGrid;
    });
  }

  /** Run BFS, then animate visited (light blue) then path (yellow). */
  async function visualizeBfs() {
    setIsAnimating(true);

    // Wipe old visited/path colors but keep walls
    const cleanGrid = grid.map((row) =>
      row.map((cell) => ({ ...cell, isVisited: false, isPath: false })),
    );
    setGrid(cleanGrid);

    const start = cleanGrid[START_ROW][START_COL];
    const end = cleanGrid[END_ROW][END_COL];
    const { visitedInOrder, path } = bfs(cleanGrid, start, end);

    // Animate exploration one cell at a time
    for (const cell of visitedInOrder) {
      await sleep(10);
      paintCell(cell.row, cell.col, 'isVisited');
    }

    // Animate the shortest path
    for (const cell of path) {
      await sleep(40);
      paintCell(cell.row, cell.col, 'isPath');
    }

    setIsAnimating(false);
  }

  /** Pick CSS class names from cell flags (start/end win over path/visited). */
  function cellClassName(cell: Cell): string {
    if (cell.isStart) return 'cell start';
    if (cell.isEnd) return 'cell end';
    if (cell.isWall) return 'cell wall';
    if (cell.isPath) return 'cell path';
    if (cell.isVisited) return 'cell visited';
    return 'cell';
  }

  return (
    <div className="app" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <h1>Pathfinding Visualizer</h1>

      <div className="controls">
        <button
          type="button"
          className="control-btn"
          onClick={visualizeBfs}
          disabled={isAnimating}
        >
          Visualize BFS
        </button>
        <button
          type="button"
          className="control-btn"
          onClick={clearBoard}
          disabled={isAnimating}
        >
          Clear board
        </button>
      </div>

      <div className="grid">
        {grid.map((row) =>
          row.map((cell) => (
            <div
              key={`${cell.row}-${cell.col}`}
              className={cellClassName(cell)}
              onMouseDown={() => handleMouseDown(cell.row, cell.col)}
              onMouseEnter={() => handleMouseEnter(cell.row, cell.col)}
            />
          )),
        )}
      </div>
    </div>
  );
}

export default App;
