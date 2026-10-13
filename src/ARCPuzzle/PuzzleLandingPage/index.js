import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setCurrentFocusedPanel } from "../PuzzleReducer";

import "./index.css";

const PuzzleLandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentFocusedPanel = useSelector(
    (state) => state.PuzzleReducer.currentFocusedPanel,
  );

  const puzzles = [
    { name: "Puzzle 1", path: "/secret-pattern/puzzle-1" },
    { name: "Puzzle 2", path: "/secret-pattern/puzzle-2" },
    { name: "Puzzle 3", path: "/secret-pattern/puzzle-3" },
    { name: "Puzzle 4", path: "/secret-pattern/puzzle-4" },
    { name: "Puzzle 5", path: "/secret-pattern/puzzle-5" },
  ];

  const focusPanel = (panel) => {
    dispatch(setCurrentFocusedPanel(panel));
  };

  return (
    <main
      className="puzzle-landing-page"
      aria-labelledby="puzzle-landing-page-title"
    >
      <header className="puzzle-header">
        <div className="puzzle-header-space" aria-hidden="true" />

        <div className="puzzle-header-title-group">
          <img
            src="/images/puzzle-avatar.png"
            className="puzzle-title-image"
            alt=""
            aria-hidden="true"
          />

          <h1
            id="puzzle-landing-page-title"
            className="puzzle-page-title"
            tabIndex={0}
          >
            Secret Pattern
          </h1>
        </div>

        <nav className="puzzle-page-nav" aria-label="Main menu navigation">
          <Link className="puzzle-nav-button" to="/secret-pattern">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section
        className={
          currentFocusedPanel === "puzzleGuideSection"
            ? "puzzle-guide-section puzzle-current-focused-panel"
            : "puzzle-guide-section"
        }
        aria-labelledby="puzzle-guide-title"
        onMouseEnter={() => focusPanel("puzzleGuideSection")}
        onFocusCapture={() => focusPanel("puzzleGuideSection")}
      >
        <h2 id="puzzle-guide-title" className="puzzle-guide-title" tabIndex={0}>
          Puzzle Guide
        </h2>

        <p className="puzzle-guide-text" tabIndex={0}>
          Choose a puzzle below. Look closely at the grids, discover the hidden
          pattern, and solve the puzzle.
        </p>
      </section>

      <section
        className={
          currentFocusedPanel === "puzzleSelectionSection"
            ? "puzzle-selection-section"
            : "puzzle-selection-section"
        }
        aria-labelledby="puzzle-selection-title"
        onMouseEnter={() => focusPanel("puzzleSelectionSection")}
        onFocusCapture={() => focusPanel("puzzleSelectionSection")}
      >
        <h2
          id="puzzle-selection-title"
          className="puzzle-selection-title"
          tabIndex={0}
        >
          Choose a Puzzle
        </h2>

        <ul className="puzzle-choice-list" aria-label="Puzzle choices">
          {puzzles.map((puzzle) => (
            <li key={puzzle.path} className="puzzle-choice-item">
              <button
                type="button"
                className="puzzle-choice-button"
                onClick={() => navigate(puzzle.path)}
                aria-label={`Select ${puzzle.name}`}
              >
                {puzzle.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default PuzzleLandingPage;
