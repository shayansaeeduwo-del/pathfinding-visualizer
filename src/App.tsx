import { useState } from 'react';
import { createGrid, type Cell } from './grid';
import './App.css';

function App() {
  // The whole board lives in React state as a 2D array
  const [grid, setGrid] = useState<Cell[][]>(() => createGrid());

  // True while the mouse button is held down
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Remember whether this drag is drawing walls or erasing them
  const [isDrawingWall, setIsDrawingWall] = useState(true);

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
    const cell = grid[row][col];
    if (cell.isStart || cell.isEnd) return;

    const makeWall = !cell.isWall; // empty → wall, wall → empty
    setIsDrawingWall(makeWall);
    setIsMouseDown(true);
    updateWall(row, col, makeWall);
  }

  /** Mouse enter while dragging: keep drawing or erasing. */
  function handleMouseEnter(row: number, col: number) {
    if (!isMouseDown) return;
    updateWall(row, col, isDrawingWall);
  }

  /** Mouse up anywhere: stop the drag. */
  function handleMouseUp() {
    setIsMouseDown(false);
  }

  /** Reset to a fresh grid with only start and end. */
  function clearBoard() {
    setGrid(createGrid());
  }

  /** Pick CSS class names from cell flags. */
  function cellClassName(cell: Cell): string {
    if (cell.isStart) return 'cell start';
    if (cell.isEnd) return 'cell end';
    if (cell.isWall) return 'cell wall';
    return 'cell';
  }

  return (
    <div className="app" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <h1>Pathfinding Visualizer</h1>

      <button type="button" className="clear-btn" onClick={clearBoard}>
        Clear board
      </button>

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
