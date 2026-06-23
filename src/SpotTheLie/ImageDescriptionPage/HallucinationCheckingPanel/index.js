import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import {
  setSelectedCheckingLine,
  setCurrentFocusedPanel,
  addDetectedImageHallucination,
} from "../../SpotTheLieReducer";

const HallucinationCheckingPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { imagecategory, imagename } = useParams();

  const [feedback, setFeedback] = useState("");
  const [showReviewButton, setShowReviewButton] = useState(false);

  const panelRef = useRef(null);
  const feedbackRef = useRef(null);

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

  //const justOpenedPanelRef = useRef(false);

  useEffect(() => {
    if (selectedCheckingLine) {
      // justOpenedPanelRef.current = true;
      dispatch(setCurrentFocusedPanel("hallucinationCheckingPanel"));
      panelRef.current?.focus();
    }
  }, [selectedCheckingLine, dispatch]);

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  // useEffect(() => {
  //   if (!selectedCheckingLine) return;

  //   if (justOpenedPanelRef.current) {
  //     justOpenedPanelRef.current = false;
  //     return;
  //   }

  //   if (currentFocusedPanel !== "hallucinationCheckingPanel") {
  //     dispatch(setSelectedCheckingLine(""));
  //     setFeedback("");
  //     setShowReviewButton(false);
  //   }
  // }, [currentFocusedPanel, selectedCheckingLine, dispatch]);

  const focusHallucinationCheckingPanel = () => {
    dispatch(setCurrentFocusedPanel("hallucinationCheckingPanel"));
  };

  const closeHallucinationDetectionCheckSideBar = () => {
    dispatch(setSelectedCheckingLine(""));
    setFeedback("");
    setShowReviewButton(false);
    dispatch(setCurrentFocusedPanel("saraImageDescriptionPanel"));
  };

  const goToReviewPage = () => {
    navigate(`/spot-the-lie/${imagecategory}/${imagename}/review-page`);
  };

  const checkHallucinationDetection = () => {
    if (
      detectedImageHallucination.count === selectedImageHallucinations.length
    ) {
      setFeedback(
        "Great job! You have detected all lies. You can now review your detective moves.",
      );
      setShowReviewButton(true);
      return;
    }

    const matchedHallucinationLine = selectedImageHallucinations.find(
      (item) => item.hallucinatedLine === selectedCheckingLine,
    );

    if (!matchedHallucinationLine) {
      setFeedback("Not correct. Try another line.");
      setShowReviewButton(false);
      return;
    }

    const alreadyDetected =
      detectedImageHallucination.imageHallucinationItems.some(
        (item) => item.hallucinatedLine === selectedCheckingLine,
      );

    if (alreadyDetected) {
      const currentCount = detectedImageHallucination.count;
      const leftCount = selectedImageHallucinations.length - currentCount;

      setShowReviewButton(leftCount === 0);

      setFeedback(
        `Already detected. ${
          matchedHallucinationLine.cause
            ? `This is a lie because ${matchedHallucinationLine.cause.toLowerCase()}`
            : "This is a lie."
        } You have detected ${currentCount} ${
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
    const lieReason = matchedHallucinationLine.cause
      ? `This is a lie because ${matchedHallucinationLine.cause.toLowerCase()}`
      : "This is a lie.";

    setShowReviewButton(leftCount === 0);

    setFeedback(
      leftCount === 0
        ? `Correct guess! You have detected all ${nextCount} ${
            nextCount === 1 ? "lie" : "lies"
          }. ${lieReason}`
        : `Correct guess! You have detected ${nextCount} ${
            nextCount === 1 ? "lie" : "lies"
          }. ${lieReason} You need to detect ${leftCount} ${
            leftCount === 1 ? "more lie" : "more lies"
          }.`,
    );
  };

  const handleCheckingPanelKeyDown = (event) => {
    const activeElement = document.activeElement;

    const isTyping =
      activeElement?.tagName === "TEXTAREA" ||
      activeElement?.tagName === "INPUT" ||
      activeElement?.isContentEditable;

    if (isTyping) return;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeHallucinationDetectionCheckSideBar();
      return;
    }

    if (
      event.key === "[" ||
      event.key === "]" ||
      event.key === "/" ||
      event.key === "?"
    ) {
      closeHallucinationDetectionCheckSideBar();
    }
  };

  if (!selectedCheckingLine) return null;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "hallucinationCheckingPanel"
          ? "hallucination-check-sidebar-panel current-focused-panel"
          : "hallucination-check-sidebar-panel"
      }
      role="dialog"
      aria-modal="false"
      aria-labelledby="lie-detection-title"
      onMouseEnter={focusHallucinationCheckingPanel}
      onFocusCapture={focusHallucinationCheckingPanel}
      onKeyDown={handleCheckingPanelKeyDown}
    >
      <h2 id="lie-detection-title" className="hallucination-checking-title">
        Do you want to confirm this line as a lie?
      </h2>

      <p
        className="selected-line-preview"
        aria-label={`Selected line to check: ${selectedCheckingLine}`}
      >
        {selectedCheckingLine}
      </p>

      <button
        type="button"
        className="page-button"
        onClick={checkHallucinationDetection}
        aria-label="Yes, confirm this line as a lie"
      >
        Yes
      </button>

      {feedback && (
        <p
          ref={feedbackRef}
          tabIndex={-1}
          className="hallucination-feedback"
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}
      {showReviewButton && (
        <button
          type="button"
          className="page-button"
          onClick={goToReviewPage}
          aria-label="Go to review page to look back at the lies you found"
        >
          Review Your Detective Moves
        </button>
      )}

      <button
        type="button"
        className="page-button"
        onClick={closeHallucinationDetectionCheckSideBar}
        aria-label="Close lie detection check window"
      >
        Close
      </button>
    </section>
  );
};

export default HallucinationCheckingPanel;
