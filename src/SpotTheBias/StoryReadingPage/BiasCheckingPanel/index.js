import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import {
  setSelectedCheckingParagraph,
  setCurrentFocusedPanel,
  addDetectedStoryBias,
  addFlaggedStoryParagraph,
} from "../../SpotTheBiasReducer";

const BiasCheckingPanel = () => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const justOpenedPanelRef = useRef(false);
  const [feedback, setFeedback] = useState("");
  const [showMarkButton, setShowMarkButton] = useState(false);

  const {
    selectedCheckingParagraph,
    selectedBiasCategories,
    biasedParagraphIndices,
    detectedStoryBias,
    flaggedStoryParagraph,
    currentFocusedPanel,
  } = useSelector((state) => state.SpotTheBiasReducer);

  const isPanelOpen = selectedCheckingParagraph.index !== null;

  useEffect(() => {
    if (!isPanelOpen) return;

    setFeedback("");
    setShowMarkButton(false);
    justOpenedPanelRef.current = true;
    dispatch(setCurrentFocusedPanel("biasCheckingPanel"));
    panelRef.current?.focus();
  }, [isPanelOpen, dispatch]);

  useEffect(() => {
    if (!isPanelOpen) return;

    if (justOpenedPanelRef.current) {
      justOpenedPanelRef.current = false;
      return;
    }

    if (currentFocusedPanel !== "biasCheckingPanel") {
      closePanel();
    }
  }, [currentFocusedPanel, isPanelOpen]);

  const closePanel = () => {
    dispatch(setSelectedCheckingParagraph({ index: null, paragraph: "" }));
    setFeedback("");
    setShowMarkButton(false);
  };

  const markParagraph = () => {
    const paragraphIndex = selectedCheckingParagraph.index;

    const alreadyMarked = flaggedStoryParagraph.flaggedStoryParagraphItems.some(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    if (alreadyMarked) {
      setFeedback("You have marked this paragraph for later review.");
      return;
    }

    dispatch(
      addFlaggedStoryParagraph({
        paragraphIndex,
        paragraph: selectedCheckingParagraph.paragraph,
      }),
    );

    setFeedback("Marked! You can review this paragraph later.");
    setShowMarkButton(false);
  };

  const checkBias = () => {
    const paragraphIndex = selectedCheckingParagraph.index;
    const totalBiasCount = biasedParagraphIndices.length;
    const biasIndex = biasedParagraphIndices.indexOf(paragraphIndex);

    const alreadyDetected = detectedStoryBias.storyBiasItems.some(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    const alreadyMarked = flaggedStoryParagraph.flaggedStoryParagraphItems.some(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    setShowMarkButton(false);

    if (alreadyDetected) {
      const biasCategory = selectedBiasCategories[biasIndex];

      setFeedback(`Already detected. This paragraph has ${biasCategory.name}.`);
      return;
    }

    if (alreadyMarked) {
      setFeedback("You already marked this paragraph for later.");
      return;
    }

    if (detectedStoryBias.count === totalBiasCount) {
      setFeedback(
        "Great job! You already found all the biased paragraphs. Do you still want to mark this paragraph as biased and review it later?",
      );
      setShowMarkButton(true);
      return;
    }

    if (biasIndex === -1) {
      setFeedback(
        "Good try! This might not be a biased paragraph. Do you still want to mark it as biased and review it later?",
      );
      setShowMarkButton(true);
      return;
    }

    const biasCategory = selectedBiasCategories[biasIndex];

    dispatch(
      addDetectedStoryBias({
        paragraphIndex,
        paragraph: selectedCheckingParagraph.paragraph,
        biasCategory,
      }),
    );

    const nextCount = detectedStoryBias.count + 1;
    const leftCount = totalBiasCount - nextCount;

    setFeedback(
      leftCount === 0
        ? `Correct guess! You detected all ${nextCount} biases. This paragraph has ${biasCategory.name}.`
        : `Correct guess! You detected ${nextCount} biases. This paragraph has ${biasCategory.name}. You need to detect ${leftCount} more ${
            leftCount === 1 ? "bias" : "biases"
          }.`,
    );
  };

  if (!isPanelOpen) return null;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "biasCheckingPanel"
          ? "bias-check-sidebar-panel current-focused-panel"
          : "bias-check-sidebar-panel"
      }
      role="dialog"
      aria-modal="false"
      aria-labelledby="bias-check-title"
      onMouseEnter={() => dispatch(setCurrentFocusedPanel("biasCheckingPanel"))}
      onFocusCapture={() =>
        dispatch(setCurrentFocusedPanel("biasCheckingPanel"))
      }
    >
      <h2 id="bias-check-title" className="bias-checking-title">
        Do you want to confirm paragraph {selectedCheckingParagraph.index + 1}{" "}
        has bias?
      </h2>

      <div
        className="bias-checking-buttons"
        role="group"
        aria-label="Bias checking choices"
      >
        <button type="button" className="page-button" onClick={checkBias}>
          Yes
        </button>

        <button type="button" className="page-button" onClick={closePanel}>
          Close
        </button>
      </div>

      <p className="bias-feedback" role="status" aria-live="polite">
        {feedback}
      </p>

      {showMarkButton && (
        <button type="button" className="page-button" onClick={markParagraph}>
          Mark this para
        </button>
      )}
    </section>
  );
};

export default BiasCheckingPanel;
