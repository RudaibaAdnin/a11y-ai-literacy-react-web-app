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
      aria-label="Detected lies leaderboard"
      onMouseEnter={focusLeaderBoardPanel}
      onFocusCapture={focusLeaderBoardPanel}
    >
      <h2 className="panel-title" tabIndex={0}>
        Leader Board
      </h2>

      <p className="leaderboard-count-details">
        You have found {detectedImageHallucination.count} out of{" "}
        {selectedImageHallucinations.length} lies.
      </p>

      {detectedItems.length === 0 ? (
        <p className="leaderboard-empty">No lies detected yet.</p>
      ) : (
        <ol className="leaderboard-list">
          {detectedItems.map((item, index) => (
            <li key={item.hallucinatedLine} className="leaderboard-item">
              <h3 className="leaderboard-item-title">Lie {index + 1}</h3>

              <p className="leaderboard-item-text">
                The sentence{" "}
                <span className="hallucinated-line-text">
                  {item.hallucinatedLine.replace(/\.$/, "").toLowerCase()}{" "}
                </span>
                {"  "}
                has a lie because {item.cause.toLowerCase()}
              </p>

              <p>
                <strong>Type of lie:</strong> {item.type}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default LeaderBoardPanel;
