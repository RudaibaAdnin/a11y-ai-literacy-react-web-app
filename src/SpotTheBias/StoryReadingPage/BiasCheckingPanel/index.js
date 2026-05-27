import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import CraftPromptRephrasePanel from "../CraftPromptRephrase";
import {
  setSelectedCheckingParagraph,
  setCurrentFocusedPanel,
  addDetectedStoryBias,
  addFlaggedStoryParagraph,
} from "../../SpotTheBiasReducer";

const BiasCheckingPanel = () => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const confirmRef = useRef(null);
  const feedbackRef = useRef(null);
  const openedParagraphRef = useRef(null);
  const feedbackFromActionRef = useRef(false);

  const [feedback, setFeedback] = useState("");
  const [showMarkButton, setShowMarkButton] = useState(false);
  const [showCraftPromptButton, setShowCraftPromptButton] = useState(false);

  const {
    selectedCheckingParagraph,
    biasedParagraphPlan,
    detectedStoryBias,
    flaggedStoryParagraph,
    currentFocusedPanel,
  } = useSelector((state) => state.SpotTheBiasReducer);

  const isPanelOpen = selectedCheckingParagraph.index !== null;
  const paragraphIndex = selectedCheckingParagraph.index;
  const paragraphNumber = paragraphIndex + 1;

  const allBiasesDetected =
    biasedParagraphPlan.length > 0 &&
    detectedStoryBias.count === biasedParagraphPlan.length;

  const detectedItem = detectedStoryBias.storyBiasItems.find(
    (item) => item.paragraphIndex === paragraphIndex,
  );

  const alreadyMarked = flaggedStoryParagraph.flaggedStoryParagraphItems.some(
    (item) => item.paragraphIndex === paragraphIndex,
  );

  const alreadyHandled = detectedItem || alreadyMarked;

  const getBiasName = (biasCategory) =>
    typeof biasCategory === "string" ? biasCategory : biasCategory?.name || "";

  const focusFeedback = () => {
    requestAnimationFrame(() => feedbackRef.current?.focus());
  };

  const focusConfirm = () => {
    requestAnimationFrame(() => confirmRef.current?.focus());
  };

  const setFeedbackWithFocus = (message) => {
    setFeedback(message);
    focusFeedback();
  };

  const setFeedbackWithCraft = (message, fromAction = false) => {
    feedbackFromActionRef.current = fromAction;
    setFeedback(message);
    setShowCraftPromptButton(true);
    focusFeedback();
  };

  const closePanel = () => {
    openedParagraphRef.current = null;
    feedbackFromActionRef.current = false;
    setFeedback("");
    setShowMarkButton(false);
    setShowCraftPromptButton(false);
    dispatch(setSelectedCheckingParagraph({ index: null, paragraph: "" }));
    dispatch(setCurrentFocusedPanel("miaPanel"));
  };

  useEffect(() => {
    if (!isPanelOpen) {
      openedParagraphRef.current = null;
      feedbackFromActionRef.current = false;
      return;
    }

    if (openedParagraphRef.current !== paragraphIndex) {
      openedParagraphRef.current = paragraphIndex;
      feedbackFromActionRef.current = false;
      setFeedback("");
      setShowMarkButton(false);
      setShowCraftPromptButton(false);
      dispatch(setCurrentFocusedPanel("biasCheckingPanel"));
      panelRef.current?.focus();
    }

    if (feedbackFromActionRef.current) return;

    if (detectedItem) {
      setFeedbackWithCraft(
        `You already detected paragraph ${paragraphNumber} as biased. This paragraph has ${getBiasName(
          detectedItem.biasCategory,
        )}.`,
      );
      return;
    }

    if (alreadyMarked) {
      setFeedbackWithCraft(
        `You already marked paragraph ${paragraphNumber} for later.`,
      );
      return;
    }

    if (allBiasesDetected) {
      setFeedbackWithFocus(
        `You have already detected all biases. Do you want to mark paragraph ${paragraphNumber} as biased and review it later?`,
      );
      setShowMarkButton(true);
      return;
    }

    focusConfirm();
  }, [
    isPanelOpen,
    paragraphIndex,
    paragraphNumber,
    detectedItem,
    alreadyMarked,
    allBiasesDetected,
    dispatch,
  ]);

  const markParagraph = () => {
    if (alreadyMarked) {
      setFeedbackWithCraft(
        `You already marked paragraph ${paragraphNumber} for later.`,
      );
      return;
    }

    dispatch(
      addFlaggedStoryParagraph({
        paragraphIndex,
        paragraph: selectedCheckingParagraph.paragraph,
      }),
    );

    setShowMarkButton(false);
    setFeedbackWithCraft(
      `Marked paragraph ${paragraphNumber}! You can review it later.`,
      true,
    );
  };

  const checkBias = () => {
    const matchedPlan = biasedParagraphPlan.find(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    setShowMarkButton(false);
    setShowCraftPromptButton(false);

    if (!matchedPlan) {
      setFeedbackWithFocus(
        `Good try! Paragraph ${paragraphNumber} might not be a biased paragraph. Do you still want to mark it as biased and review it later?`,
      );
      setShowMarkButton(true);
      return;
    }

    dispatch(
      addDetectedStoryBias({
        paragraphIndex,
        paragraph: selectedCheckingParagraph.paragraph,
        biasCategory: matchedPlan.biasCategory,
      }),
    );

    const nextCount = detectedStoryBias.count + 1;
    const leftCount = biasedParagraphPlan.length - nextCount;
    const biasName = getBiasName(matchedPlan.biasCategory);

    setFeedbackWithCraft(
      leftCount === 0
        ? `Correct guess! Paragraph ${paragraphNumber} has ${biasName}. You detected all ${nextCount} biases.`
        : `Correct guess! Paragraph ${paragraphNumber} has ${biasName}. You detected ${nextCount} biases. You need to detect ${leftCount} more ${
            leftCount === 1 ? "bias" : "biases"
          }.`,
      true,
    );
  };

  if (!isPanelOpen) return null;

  return (
    <div className="bias-check-rephrase-sidebar-panel">
      <section
        className="bias-check-sidebar-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="bias-check-title"
        onMouseEnter={() =>
          dispatch(setCurrentFocusedPanel("biasCheckingPanel"))
        }
        onFocusCapture={() =>
          dispatch(setCurrentFocusedPanel("biasCheckingPanel"))
        }
      >
        <h2 id="bias-check-title" className="panel-title">
          Bias Check Panel
        </h2>

        {!alreadyHandled && !allBiasesDetected && (
          <>
            <p ref={confirmRef} tabIndex={-1} className="bias-feedback">
              Do you want to confirm paragraph {paragraphNumber} has bias?
            </p>

            <div
              className="bias-checking-buttons"
              role="group"
              aria-label="Bias checking choices"
            >
              <button type="button" className="page-button" onClick={checkBias}>
                Yes
              </button>

              <button
                type="button"
                className="page-button"
                onClick={closePanel}
              >
                Close
              </button>
            </div>
          </>
        )}

        <p
          ref={feedbackRef}
          tabIndex={-1}
          className="bias-feedback"
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>

        {showMarkButton && (
          <div
            className="bias-checking-buttons"
            role="group"
            aria-label="Mark paragraph choices"
          >
            <button
              type="button"
              className="page-button"
              onClick={markParagraph}
            >
              Mark this paragraph
            </button>

            <button type="button" className="page-button" onClick={closePanel}>
              Close
            </button>
          </div>
        )}
      </section>

      {showCraftPromptButton && <CraftPromptRephrasePanel />}
    </div>
  );
};

export default BiasCheckingPanel;
