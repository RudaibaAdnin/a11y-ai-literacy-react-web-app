import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { storedPuzzles } from "../Util/storedPuzzles.js";
import { setCurrentPuzzle, setCurrentFocusedPanel } from "../PuzzleReducer";

import YourTurnGrid from "./YourTurnGrid";
import AlicePanel from "./AlicePanel";

import "../PuzzleLandingPage/index.css";
import "./index.css";

export const shapes = {
  1: {
    name: "square",
    className: "shape-square",
    note: "tone",
    instrument: "piano",
    sound: "/sounds/piano.mp3",
  },
  2: {
    name: "triangle",
    className: "shape-triangle",
    note: "tone",
    instrument: "guitar",
    sound: "/sounds/guitar.mp3",
  },
  3: {
    name: "circle",
    className: "shape-circle",
    note: "tone",
    instrument: "flute",
    sound: "/sounds/flute.mp3",
  },
  4: {
    name: "cross",
    className: "shape-cross",
    note: "tone",
    instrument: "bell",
    sound: "/sounds/bell.mp3",
  },
  5: {
    name: "plus",
    className: "shape-plus",
    note: "tone",
    instrument: "xylophone",
    sound: "/sounds/xylophone.mp3",
  },
};

const puzzleColors = {
  puzzle1: "#1d4289",
  puzzle2: "#8b4513",
  puzzle3: "#5d3754",
  puzzle4: "#8b4513",
  puzzle5: "#1d4289",
};

let currentAudio;

export const playShapeSound = (shape) => {
  if (!shape) return;

  currentAudio?.pause();
  currentAudio = new Audio(shape.sound);
  currentAudio.volume = 0.7;
  currentAudio.play();
};

const PuzzleGrid = ({ grid, label }) => {
  const refs = useRef([]);
  const [activeCell, setActiveCell] = useState(0);

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

  return (
    <div
      className="puzzle-grid"
      style={{ "--columns": columns }}
      role="group"
      aria-label={label}
    >
      {grid.flat().map((value, index) => {
        const row = Math.floor(index / columns) + 1;
        const column = (index % columns) + 1;
        const shape = shapes[value];

        return (
          <button
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            className="puzzle-cell"
            tabIndex={activeCell === index ? 0 : -1}
            aria-label={
              shape
                ? `Row ${row}, Column ${column}, ${
                    shape.name
                  }, Cell ${index + 1}. Press Enter to hear ${shape.instrument} ${shape.note}.`
                : `Cell ${index + 1}, row ${row}, column ${column}, empty cell`
            }
            onFocus={() => setActiveCell(index)}
            onKeyDown={(event) => moveCell(event, index)}
            onClick={() => playShapeSound(shape)}
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
  );
};

const PuzzleGamePage = () => {
  const { puzzleId = "puzzle-1" } = useParams();
  const dispatch = useDispatch();

  const [aliceOpen, setAliceOpen] = useState(false);

  const currentFocusedPanel = useSelector(
    (state) => state.PuzzleReducer.currentFocusedPanel,
  );

  const puzzleKey = puzzleId.replaceAll("-", "");
  const puzzle = storedPuzzles[puzzleKey];
  const puzzleNumber = puzzleId.replace("puzzle-", "");

  useEffect(() => {
    if (!puzzle) return;

    dispatch(
      setCurrentPuzzle({
        puzzleKey,
        puzzle,
      }),
    );
  }, [dispatch, puzzleKey, puzzle]);

  if (!puzzle) {
    return <p>Puzzle not found.</p>;
  }

  const shapeValues = [
    ...new Set(
      puzzle.examples.flatMap(({ before, after }) => [
        ...before.flat(),
        ...after.flat(),
      ]),
    ),
  ].filter(Boolean);

  const focusPanel = (panel) => {
    dispatch(setCurrentFocusedPanel(panel));
  };

  const panelClass = (panel, baseClass) =>
    currentFocusedPanel === panel
      ? `${baseClass} puzzle-current-focused-panel`
      : baseClass;

  return (
    <main className="puzzle-landing-page" aria-labelledby="puzzle-page-title">
      <header className="puzzle-header">
        <div className="puzzle-header-space" aria-hidden="true" />

        <div className="puzzle-header-title-group">
          <img
            src="/images/puzzle-avatar.png"
            className="puzzle-title-image"
            alt=""
            aria-hidden="true"
          />

          <h1 id="puzzle-page-title" className="puzzle-page-title" tabIndex={0}>
            Secret Pattern:{" "}
            <span
              style={{
                color: puzzleColors[puzzleKey],
                textDecoration: "underline",
              }}
            >
              Puzzle {puzzleNumber}
            </span>
          </h1>
        </div>

        <nav className="puzzle-page-nav" aria-label="Puzzle navigation">
          <Link className="puzzle-nav-button" to="/secret-pattern">
            Back to Puzzles
          </Link>
        </nav>
      </header>

      <section
        className={panelClass("missionSection", "puzzle-guide-section")}
        onMouseEnter={() => focusPanel("missionSection")}
        onFocusCapture={() => focusPanel("missionSection")}
      >
        <h2 className="puzzle-guide-title" tabIndex={0}>
          Your Mission
        </h2>

        <p className="puzzle-guide-text" tabIndex={0}>
          A secret pattern is hiding in the grids! Explore how the Before grids
          change into the After grids and observe closely to spot the secret
          rule. Use the arrow keys to move from cell to cell and explore the
          grid. Press Enter on a shape to hear its sound, then use the clues you
          find to solve the puzzle! You can also use headings to move through
          the page with a screen reader.
        </p>
      </section>

      <section
        className={panelClass("aliceSection", "shape-intro")}
        onMouseEnter={() => focusPanel("aliceSection")}
        onFocusCapture={() => focusPanel("aliceSection")}
      >
        <div className="alice-heading-group">
          <img
            src="/images/puzzle-alice-avatar.png"
            className="alice-avatar"
            alt=""
            aria-hidden="true"
          />

          <h2 tabIndex={0}>Ask Alice</h2>
        </div>

        <p className="puzzle-guide-text" tabIndex={0}>
          Alice can help you explore the grids, understand where shapes are, and
          think through clues when you get stuck.
        </p>

        <button
          type="button"
          className="puzzle-nav-button"
          onClick={() => {
            setAliceOpen(true);
            focusPanel("alicePanel");
          }}
        >
          Ask Alice
        </button>
      </section>

      {aliceOpen && <AlicePanel onClose={() => setAliceOpen(false)} />}

      <section
        className={panelClass("shapeSection", "shape-intro")}
        onMouseEnter={() => focusPanel("shapeSection")}
        onFocusCapture={() => focusPanel("shapeSection")}
      >
        <h2 tabIndex={0}>Meet the Shapes</h2>

        <p className="puzzle-guide-text" tabIndex={0}>
          Each shape has its own sound. Try them out before you start!
        </p>

        <ul className="shape-note-list" aria-label="Shape sounds">
          {shapeValues.map((value) => {
            const shape = shapes[value];

            return (
              <li key={value}>
                <button
                  type="button"
                  className="shape-note-button"
                  onClick={() => playShapeSound(shape)}
                >
                  <span
                    className={`grid-shape ${shape.className}`}
                    aria-hidden="true"
                  />

                  <span>
                    {shape.name} - {shape.instrument} {shape.note}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className={panelClass("learnSection", "puzzle-example")}
        onMouseEnter={() => focusPanel("learnSection")}
        onFocusCapture={() => focusPanel("learnSection")}
      >
        <h2 tabIndex={0}>Learn the Secret Pattern</h2>

        <p className="puzzle-guide-text" tabIndex={0}>
          First, study the examples. Compare each Before grid with its After
          grid. What changed between the grids? What stayed the same?
        </p>
      </section>

      {puzzle.examples.map((example, index) => {
        const panelName = `exampleSection-${index}`;

        return (
          <section
            key={example.id}
            className={panelClass(panelName, "puzzle-example")}
            onMouseEnter={() => focusPanel(panelName)}
            onFocusCapture={() => focusPanel(panelName)}
          >
            <h2 tabIndex={0}>Example {index + 1}</h2>

            <p className="puzzle-guide-text" tabIndex={0}>
              Explore the Before and After grids and look for clues.
            </p>

            <div className="puzzle-grid-pair">
              <div className="puzzle-grid-block">
                <h3
                  className="before-title"
                  tabIndex={0}
                  aria-label={`Before Grid of Example ${index + 1}`}
                >
                  Before Grid of Example {index + 1}
                </h3>

                <PuzzleGrid
                  grid={example.before}
                  label={`Example ${index + 1} Before grid`}
                />
              </div>

              <div className="puzzle-grid-block">
                <h3
                  className="after-title"
                  tabIndex={0}
                  aria-label={`After Grid of Example ${index + 1}`}
                >
                  After Grid of Example {index + 1}
                </h3>

                <PuzzleGrid
                  grid={example.after}
                  label={`Example ${index + 1} After grid`}
                />
              </div>
            </div>
          </section>
        );
      })}

      <section
        className={panelClass("yourTurnSection", "puzzle-example")}
        onMouseEnter={() => focusPanel("yourTurnSection")}
        onFocusCapture={() => focusPanel("yourTurnSection")}
      >
        <h2 tabIndex={0}>Your Turn!</h2>

        <p className="puzzle-guide-text" tabIndex={0}>
          Think you found the secret pattern? Now put it to the test! Explore
          the Before grid, then build your answer in the your Answer grid. Press
          Enter on a cell to add, change, or delete a shape.
        </p>

        <div className="puzzle-your-turn-stack">
          <div className="puzzle-grid-block">
            <h3 className="before-title" tabIndex={0}>
              Before Grid of Your Turn
            </h3>

            <PuzzleGrid
              grid={puzzle.test.before}
              label="Your Turn Before grid"
            />
          </div>

          <div className="puzzle-grid-block">
            <h3 className="after-title" tabIndex={0}>
              Your Answer Grid
            </h3>

            <YourTurnGrid
              key={puzzleKey}
              shapeValues={shapeValues}
              shapes={shapes}
              playShapeSound={playShapeSound}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default PuzzleGamePage;
