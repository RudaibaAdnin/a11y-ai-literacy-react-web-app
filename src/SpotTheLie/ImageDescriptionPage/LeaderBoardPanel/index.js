import React from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheLieReducer";

const LeaderBoardPanel = () => {
  const dispatch = useDispatch();

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  const selectedImageHallucinations = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageHallucinations,
  );

  const detectedImageHallucination = useSelector(
    (state) => state.SpotTheLieReducer.detectedImageHallucination,
  );

  const detectedItems = detectedImageHallucination.imageHallucinationItems;

  const focusLeaderBoardPanel = () => {
    dispatch(setCurrentFocusedPanel("leaderBoardPanel"));
  };

  return (
    <section
      className={
        currentFocusedPanel === "leaderBoardPanel"
          ? "leaderboard-panel current-focused-panel"
          : "leaderboard-panel"
      }
      // Accessibility change: labels the section using the visible heading.
      aria-labelledby="detective-scoreboard-title"
      onMouseEnter={focusLeaderBoardPanel}
      onFocusCapture={focusLeaderBoardPanel}
    >
      <h2 id="detective-scoreboard-title" className="panel-title" tabIndex={0}>
        Detective Score Board
      </h2>

      <p className="leaderboard-count-details">
        You have found {detectedImageHallucination.count} out of{" "}
        {selectedImageHallucinations.length} lies.
      </p>

      {detectedItems.length === 0 ? (
        <p className="leaderboard-empty">No lies detected yet.</p>
      ) : (
        <>
          <p className="keyboard-instructions">
            List of lies you have found. Review each one to learn why it is a
            lie and what type of lie it is.
          </p>
          <ol
            className="leaderboard-list"
            // Accessibility change: gives the list a clear purpose.
            aria-label="Detected lies"
          >
            {detectedItems.map((item, index) => (
              <li
                key={item.hallucinatedLine}
                className="leaderboard-item"
                // Accessibility change: connects each list item to its heading.
                aria-labelledby={`detected-lie-${index + 1}`}
              >
                <p
                  id={`detected-lie-${index + 1}`}
                  className="leaderboard-item-title"
                >
                  Lie {index + 1}
                </p>

                <p className="leaderboard-item-text">
                  The sentence{" "}
                  <span className="hallucinated-line-text">
                    {item.hallucinatedLine
                      .replace(/\.$/, "")
                      .toLowerCase()}{" "}
                  </span>
                  has a lie because {item.cause.toLowerCase()}
                </p>

                <p>
                  <strong>Type of lie:</strong> {item.type}
                </p>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
};

export default LeaderBoardPanel;
