import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  updateYourTurnCell,
  copyBeforeGrid,
  clearYourTurnGrid,
  setCurrentFocusedPanel,
} from "../../PuzzleReducer";

import "./index.css";

const YourTurnGrid = ({ shapeValues, shapes, playShapeSound }) => {
  const dispatch = useDispatch();

  const puzzle = useSelector((state) => state.PuzzleReducer.currentPuzzle);

  const grid = useSelector((state) => state.PuzzleReducer.yourTurnGrid);

  const [activeCell, setActiveCell] = useState(0);
  const [editingCell, setEditingCell] = useState(null);
  const [feedback, setFeedback] = useState("");

  const refs = useRef([]);

  if (!puzzle || !grid.length) return null;

  const rows = grid.length;
  const columns = grid[0].length;

  const moveCell = (event, index) => {
    const moves = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };

    if (!moves[event.key]) return;

    event.preventDefault();

    const [rowMove, columnMove] = moves[event.key];

    const row = Math.floor(index / columns);
    const column = index % columns;

    const nextRow = Math.max(0, Math.min(rows - 1, row + rowMove));

    const nextColumn = Math.max(0, Math.min(columns - 1, column + columnMove));

    const nextIndex = nextRow * columns + nextColumn;

    setActiveCell(nextIndex);
    refs.current[nextIndex]?.focus();
  };

  const openEditor = (index) => {
    setEditingCell(index);
    dispatch(setCurrentFocusedPanel("shapeEditorPanel"));
  };

  const closeEditor = () => {
    const index = editingCell;

    setEditingCell(null);
    dispatch(setCurrentFocusedPanel("yourTurnSection"));

    requestAnimationFrame(() => {
      refs.current[index]?.focus();
    });
  };

  const changeCell = (value) => {
    const row = Math.floor(editingCell / columns);
    const column = editingCell % columns;

    dispatch(
      updateYourTurnCell({
        row,
        column,
        value,
      }),
    );

    setFeedback("");
    closeEditor();
  };

  const copyBefore = () => {
    dispatch(copyBeforeGrid());
    setFeedback("");
  };

  const resetGrid = () => {
    dispatch(clearYourTurnGrid());
    setFeedback("");
  };

  const submitSolution = () => {
    const solutionGrid = puzzle.test.after;

    const correct = grid.every((row, rowIndex) =>
      row.every(
        (value, columnIndex) => value === solutionGrid[rowIndex][columnIndex],
      ),
    );

    setFeedback(
      correct
        ? "Correct! You found the secret pattern!"
        : "Not quite. Check the pattern and try again.",
    );
  };

  return (
    <>
      <div className="your-turn-controls">
        <p className="puzzle-guide-text" tabIndex={0}>
          Use the buttons below to manage your answer as you solve the puzzle.
          You can copy the shapes from the Before grid into your answer grid,
          clear everything and start again.
        </p>

        <div className="your-turn-actions">
          <button type="button" onClick={copyBefore}>
            Copy Before Grid to Your Answer Grid
          </button>

          <button type="button" onClick={resetGrid}>
            Clear Your Answer Grid
          </button>
        </div>
      </div>
      <div className="your-turn-grid">
        <div
          className="puzzle-grid"
          style={{ "--columns": columns }}
          role="group"
          aria-label="Editable Your Turn grid"
        >
          {grid.flat().map((value, index) => {
            const row = Math.floor(index / columns) + 1;
            const column = (index % columns) + 1;
            const shape = shapes[value];

            const cellLabel = shape
              ? `Cell ${index + 1}, row ${row}, column ${column}, ${
                  shape.name
                }. Press Enter to edit this cell.`
              : `Cell ${
                  index + 1
                }, row ${row}, column ${column}, empty cell. Press Enter to add a shape.`;

            return (
              <button
                key={index}
                ref={(element) => {
                  refs.current[index] = element;
                }}
                type="button"
                className="puzzle-cell"
                tabIndex={activeCell === index ? 0 : -1}
                aria-label={cellLabel}
                onFocus={() => setActiveCell(index)}
                onKeyDown={(event) => moveCell(event, index)}
                onClick={() => openEditor(index)}
              >
                {shape && (
                  <span
                    className={`grid-shape ${shape.className}`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="your-turn-controls">
          <p className="puzzle-guide-text" tabIndex={0}>
            Submit your answer grid when you think you have found the secret
            pattern and added the needed shapes.
          </p>

          <div className="your-turn-actions">
            <button type="button" onClick={submitSolution}>
              Submit Your Solution
            </button>
          </div>

          {feedback && (
            <p className="solution-feedback" role="status" aria-live="polite">
              {feedback}
            </p>
          )}
        </div>
      </div>

      {editingCell !== null && (
        <div className="shape-modal-backdrop">
          <section
            className="shape-modal puzzle-current-focused-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shape-modal-title"
            aria-describedby="shape-modal-description"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closeEditor();
              }
            }}
          >
            <h2 id="shape-modal-title">What Goes in This Cell?</h2>

            <p id="shape-modal-description">
              Choose a shape, or clear the cell if it should be empty.
            </p>

            <div
              className="shape-modal-options"
              role="group"
              aria-label="Shape choices"
            >
              {shapeValues.map((value, index) => {
                const shape = shapes[value];

                return (
                  <button
                    key={value}
                    type="button"
                    autoFocus={index === 0}
                    onClick={() => {
                      playShapeSound(shape);
                      changeCell(value);
                    }}
                  >
                    <span
                      className={`grid-shape ${shape.className}`}
                      aria-hidden="true"
                    />

                    {shape.name}
                  </button>
                );
              })}

              <button type="button" onClick={() => changeCell(0)}>
                Clear the Cell
              </button>
            </div>

            <button
              type="button"
              className="puzzle-nav-button"
              onClick={closeEditor}
            >
              Cancel
            </button>
          </section>
        </div>
      )}
    </>
  );
};

export default YourTurnGrid;
