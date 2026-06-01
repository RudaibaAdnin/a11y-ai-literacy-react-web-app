import React from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheBiasReducer";

const LeaderBoardPanel = () => {
  const dispatch = useDispatch();

  const {
    currentFocusedPanel,
    biasedParagraphPlan,
    detectedStoryBias,
    flaggedStoryParagraph,
  } = useSelector((state) => state.SpotTheBiasReducer);

  const detectedItems = detectedStoryBias.storyBiasItems;
  const flaggedItems = flaggedStoryParagraph.flaggedStoryParagraphItems;

  const focusPanel = () => {
    dispatch(setCurrentFocusedPanel("biasLeaderBoardPanel"));
  };

  return (
    <section
      className={
        currentFocusedPanel === "biasLeaderBoardPanel"
          ? "leaderboard-panel current-focused-panel"
          : "leaderboard-panel"
      }
      aria-labelledby="bias-scoreboard-title"
      onMouseEnter={focusPanel}
      onFocusCapture={focusPanel}
    >
      <h2 id="bias-scoreboard-title" className="panel-title" tabIndex={0}>
        Score Board
      </h2>

      <p className="leaderboard-count-details">
        You have found {detectedStoryBias.count} out of{" "}
        {biasedParagraphPlan.length} biased story paragraphs.
      </p>

      <p className="leaderboard-count-details">
        You marked {flaggedStoryParagraph.count} story paragraphs to review
        later.
      </p>

      {detectedItems.length > 0 && (
        <>
          <h3 className="leaderboard-section-title">List of Spotted Biases</h3>

          <ol
            className="leaderboard-list"
            aria-label="Detected biased paragraphs"
          >
            {detectedItems.map((item, index) => (
              <li
                key={item.paragraphIndex}
                className="leaderboard-item"
                aria-labelledby={`detected-bias-${index + 1}`}
              >
                <p
                  id={`detected-bias-${index + 1}`}
                  className="leaderboard-item-title"
                >
                  Paragraph {item.paragraphIndex + 1} shows{" "}
                  {item.biasCategory.name}.
                </p>

                <p className="leaderboard-item-text">{item.paragraph}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      {flaggedItems.length > 0 && (
        <>
          <h3 className="leaderboard-section-title">
            List of Marked Paragraphs
          </h3>

          <ol className="leaderboard-list" aria-label="Marked paragraphs">
            {flaggedItems.map((item, index) => (
              <li
                key={item.paragraphIndex}
                className="leaderboard-item"
                aria-labelledby={`marked-paragraph-${index + 1}`}
              >
                <p
                  id={`marked-paragraph-${index + 1}`}
                  className="leaderboard-item-title"
                >
                  Marked Paragraph {item.paragraphIndex + 1}
                </p>

                <p className="leaderboard-item-text">{item.paragraph}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      {detectedItems.length === 0 && flaggedItems.length === 0 && (
        <p className="leaderboard-empty">No paragraphs found or marked yet.</p>
      )}
    </section>
  );
};

export default LeaderBoardPanel;
