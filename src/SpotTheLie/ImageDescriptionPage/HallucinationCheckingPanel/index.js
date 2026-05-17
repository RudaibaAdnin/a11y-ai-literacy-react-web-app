import React, { useEffect, useRef, useState } from "react";
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

  // Accessibility change: stores the panel so focus can move here when it opens.
  const panelRef = useRef(null);

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

  // Accessibility change: when the panel opens, move keyboard focus to it.
  useEffect(() => {
    if (selectedCheckingLine) {
      panelRef.current?.focus();
    }
  }, [selectedCheckingLine]);

  /* this code closes the window when focus moves or when the user navigates to a new line */
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

    const matchedHallucinationLine = selectedImageHallucinations.find(
      (item) => item.hallucinatedLine === selectedCheckingLine,
    );

    if (!matchedHallucinationLine) {
      setFeedback("Not correct. Try another line.");
      return;
    }

    const alreadyDetected =
      detectedImageHallucination.imageHallucinationItems.some(
        (item) => item.hallucinatedLine === selectedCheckingLine,
      );

    if (alreadyDetected) {
      const currentCount = detectedImageHallucination.count;
      const leftCount = selectedImageHallucinations.length - currentCount;

      const lieReason = `This is a lie because ${matchedHallucinationLine.cause.toLowerCase()}`;

      setFeedback(
        `Already detected. ${lieReason} You have detected ${currentCount} ${
          currentCount === 1 ? "lie" : "lies"
        }. You need to detect ${leftCount} ${
          leftCount === 1 ? "more lie" : "more lies"
        }.`,
      );

      return;
    }

    dispatch(addDetectedImageHallucination(matchedHallucinationLine));
    const nextCount = detectedImageHallucination.count + 1;
    const leftCount = selectedImageHallucinations.length - nextCount;

    const lieReason = `This is a lie because ${matchedHallucinationLine.cause.toLowerCase()}`;

    if (leftCount === 0) {
      setFeedback(
        `Correct guess! You have detected all ${nextCount} ${
          nextCount === 1 ? "lie" : "lies"
        }. ${lieReason}`,
      );
    } else {
      setFeedback(
        `Correct guess! You have detected ${nextCount} ${
          nextCount === 1 ? "lie" : "lies"
        }. ${lieReason} You need to detect ${leftCount} ${
          leftCount === 1 ? "more lie" : "more lies"
        }.`,
      );
    }
  };

  if (!selectedCheckingLine) {
    return null;
  }

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "hallucinationCheckingPanel"
          ? "hallucination-check-sidebar-panel current-focused-panel"
          : "hallucination-check-sidebar-panel"
      }
      // Accessibility change: label the section using the visible heading.
      aria-labelledby="lie-detection-title"
      onMouseEnter={focusHallucinationCheckingPanel}
      onFocusCapture={focusHallucinationCheckingPanel}
    >
      <h2 id="lie-detection-title" className="hallucination-checking-title">
        Do you want to confirm this line as a lie?
      </h2>

      <p
        className="selected-line-preview"
        // Accessibility change: gives screen reader users context for the line.
        aria-label={`Selected line to check: ${selectedCheckingLine}`}
      >
        {selectedCheckingLine}
      </p>

      <div
        className="hallucination-checking-buttons"
        // Accessibility change: groups the Yes and Close buttons together.
        role="group"
        aria-label="Lie detection choices: Yes or Close"
      >
        <button
          type="button"
          className="page-button"
          onClick={checkHallucinationDetection}
          // Accessibility change: makes the Yes button action clearer.
          aria-label="Yes, confirm this line as a lie"
        >
          Yes
        </button>

        <button
          type="button"
          className="page-button"
          onClick={closeHallucinationDetectionCheckSideBar}
          aria-label="Close lie detection check"
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
