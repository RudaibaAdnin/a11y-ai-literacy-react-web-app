import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addAliceMessage,
  clearAliceHistory,
  setCurrentFocusedPanel,
} from "../../PuzzleReducer";

import "./index.css";

const AlicePanel = ({ onClose }) => {
  const dispatch = useDispatch();

  const puzzle = useSelector((state) => state.PuzzleReducer.currentPuzzle);

  const aliceHistory = useSelector((state) => state.PuzzleReducer.aliceHistory);

  const currentFocusedPanel = useSelector(
    (state) => state.PuzzleReducer.currentFocusedPanel,
  );

  const [question, setQuestion] = useState("");

  if (!puzzle) return null;

  const focusAlice = () => {
    dispatch(setCurrentFocusedPanel("alicePanel"));
  };

  const askAlice = (text) => {
    const trimmedQuestion = text.trim();

    if (!trimmedQuestion) return;

    dispatch(
      addAliceMessage({
        role: "user",
        text: trimmedQuestion,
      }),
    );

    dispatch(
      addAliceMessage({
        role: "alice",
        text: "I’m ready to help you explore the puzzle!",
      }),
    );

    setQuestion("");
  };

  const closeAlice = () => {
    dispatch(setCurrentFocusedPanel("aliceSection"));
    onClose();
  };

  return (
    <div className="alice-modal-backdrop">
      <section
        className={
          currentFocusedPanel === "alicePanel"
            ? "alice-panel puzzle-current-focused-panel"
            : "alice-panel"
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="alice-panel-title"
        aria-describedby="alice-panel-description"
        onFocusCapture={focusAlice}
        onMouseEnter={focusAlice}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeAlice();
          }
        }}
      >
        <div className="alice-panel-header">
          <h2 id="alice-panel-title" tabIndex={0}>
            Ask Alice
          </h2>
        </div>

        <p id="alice-panel-description" tabIndex={0}>
          Alice can help you explore the grids, understand where shapes are, and
          think about the pattern without solving it for you.
        </p>

        <div
          className="alice-question-options"
          aria-label="Suggested questions"
        >
          <button
            type="button"
            onClick={() => askAlice("Give me an overview of the puzzle.")}
          >
            Give Me an Overview
          </button>

          <button type="button" onClick={() => askAlice("Give me a clue.")}>
            Give Me a Clue
          </button>
        </div>

        <div className="alice-conversation" aria-live="polite">
          {aliceHistory.map((message, index) => (
            <div
              key={index}
              className={`alice-message ${message.role}`}
              tabIndex={0}
            >
              <strong>{message.role === "alice" ? "Alice" : "You"}:</strong>{" "}
              {message.text}
            </div>
          ))}
        </div>

        <form
          className="alice-form"
          onSubmit={(event) => {
            event.preventDefault();
            askAlice(question);
          }}
        >
          <label htmlFor="alice-question">Ask Alice a question</label>

          <div className="alice-input-row">
            <input
              id="alice-question"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about the grids..."
              autoFocus
            />

            <button type="submit">Ask</button>
          </div>
        </form>

        <div className="alice-footer">
          <button type="button" onClick={() => dispatch(clearAliceHistory())}>
            Clear Conversation
          </button>

          <button type="button" onClick={closeAlice}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
};

export default AlicePanel;
