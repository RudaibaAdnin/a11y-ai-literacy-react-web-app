import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheLieReducer";

const AgentAdamPanel = () => {
  const dispatch = useDispatch();

  const [adamDescription, setAdamDescription] = useState([]);
  const [differenceText, setDifferenceText] = useState("");

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  const selectedImageDescription = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageDescription,
  );

  const selectedImageHallucinations = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageHallucinations,
  );

  const focusAdamPanel = () => {
    dispatch(setCurrentFocusedPanel("adamDescriptionPanel"));
  };

  const generateNewDescription = () => {
    const newDescription = selectedImageDescription.map((line) => {
      const matchedLie = selectedImageHallucinations.find(
        (item) => item.hallucinatedLine === line,
      );

      return matchedLie?.accurateLine || line;
    });

    setAdamDescription(newDescription);
    setDifferenceText("");
  };

  const clearDescription = () => {
    setAdamDescription([]);
    setDifferenceText("");
  };

  const generateSummaryOfDifferences = () => {
    setDifferenceText(
      `Adam's description changes ${selectedImageHallucinations.length} parts from Sara's description. These changes fix details that Sara may have described incorrectly.`,
    );
  };

  const generateLineByLineDifferences = () => {
    setDifferenceText(
      selectedImageHallucinations
        .map(
          (item, index) =>
            `Difference ${index + 1}: Sara said "${item.hallucinatedLine}" Adam says "${item.accurateLine}".`,
        )
        .join(" "),
    );
  };

  return (
    <section
      className={
        currentFocusedPanel === "adamDescriptionPanel"
          ? "adam-description-section current-focused-panel"
          : "adam-description-section"
      }
      aria-labelledby="adam-description-title"
      onMouseEnter={focusAdamPanel}
      onFocusCapture={focusAdamPanel}
    >
      <h2 id="adam-description-title" className="panel-title" tabIndex={0}>
        Adam: New AI Image Description
      </h2>

      <p className="keyboard-instructions">
        Ask Adam for another image description and compare it with Sara's
        description.
      </p>

      <div className="adam-description-buttons">
        <button
          type="button"
          className="page-button"
          onClick={generateNewDescription}
        >
          Generate New Description
        </button>

        <button
          type="button"
          className="page-button"
          onClick={clearDescription}
        >
          Clear Description
        </button>
      </div>

      {adamDescription.length > 0 && (
        <>
          <p className="adam-description-text">{adamDescription.join(" ")}</p>

          <div className="adam-description-buttons">
            <button
              type="button"
              className="page-button"
              onClick={generateSummaryOfDifferences}
            >
              Generate Summary of Differences
            </button>

            <button
              type="button"
              className="page-button"
              onClick={generateLineByLineDifferences}
            >
              Generate Line-by-Line Differences
            </button>
          </div>
        </>
      )}

      {differenceText && (
        <p className="adam-difference-text">{differenceText}</p>
      )}
    </section>
  );
};

export default AgentAdamPanel;
