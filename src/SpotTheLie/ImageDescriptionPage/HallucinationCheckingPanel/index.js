import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import {
  setSelectedCheckingLine,
  setCurrentFocusedPanel,
  addDetectedImageHallucination,
} from "../../SpotTheLieReducer";

const HallucinationCheckingPanel = () => {
  const dispatch = useDispatch();
  const [feedback, setFeedback] = useState("");

  const selectedCheckingLine = useSelector(
    (state) => state.SpotTheLieReducer.selectedCheckingLine,
  );

  const selectedImageHallucinations = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageHallucinations,
  );

  const detectedImageHallucination = useSelector(
    (state) => state.SpotTheLieReducer.detectedImageHallucination,
  );

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  /* this code closes the window when focus moves or when the use navigate to a new line */
  useEffect(() => {
    if (
      selectedCheckingLine &&
      currentFocusedPanel !== "hallucinationCheckingPanel"
    ) {
      dispatch(setSelectedCheckingLine(""));
      setFeedback("");
    }
  }, [currentFocusedPanel, selectedCheckingLine, dispatch]);

  const focusHallucinationCheckingPanel = () => {
    dispatch(setCurrentFocusedPanel("hallucinationCheckingPanel"));
  };

  const closeHallucinationDetectionCheckSideBar = () => {
    dispatch(setSelectedCheckingLine(""));
    setFeedback("");
  };

  const checkHallucinationDetection = () => {
    if (
      detectedImageHallucination.count === selectedImageHallucinations.length
    ) {
      setFeedback("All hallucinations already detected.");
      return;
    }

    const alreadyDetected =
      detectedImageHallucination.imageHallucinationItems.some(
        (item) => item.hallucinatedLine === selectedCheckingLine,
      );

    if (alreadyDetected) {
      setFeedback("Already detected.");
      return;
    }

    const matchedHallucinationLine = selectedImageHallucinations.find(
      (item) => item.hallucinatedLine === selectedCheckingLine,
    );

    if (!matchedHallucinationLine) {
      setFeedback("Not correct. Try another line.");
      return;
    }

    dispatch(addDetectedImageHallucination(matchedHallucinationLine));
    const nextCount = detectedImageHallucination.count + 1;
    setFeedback(
      `Correct guess! You have detected ${nextCount} ${nextCount === 1 ? "lie" : "lies"}.`,
    );
  };

  if (!selectedCheckingLine) {
    return null;
  }

  return (
    <section
      className={
        currentFocusedPanel === "hallucinationCheckingPanel"
          ? "hallucination-check-sidebar-panel current-focused-panel"
          : "hallucination-check-sidebar-panel"
      }
      aria-label="Lie detection check"
      aria-live="polite"
      onMouseEnter={focusHallucinationCheckingPanel}
      onFocusCapture={focusHallucinationCheckingPanel}
    >
      <h2 className="hallucination-checking-title">
        Do you want to confirm this line as lie? If yes, select from the buttons
        below.
      </h2>

      <p className="selected-line-preview">{selectedCheckingLine}</p>

      <div className="hallucination-checking-buttons">
        <button
          type="button"
          className="page-button"
          onClick={checkHallucinationDetection}
        >
          Yes
        </button>

        <button
          type="button"
          className="page-button"
          onClick={closeHallucinationDetectionCheckSideBar}
        >
          Close
        </button>
      </div>
      <p className="hallucination-feedback" role="status" aria-live="polite">
        {feedback}
      </p>
    </section>
  );
};

export default HallucinationCheckingPanel;
