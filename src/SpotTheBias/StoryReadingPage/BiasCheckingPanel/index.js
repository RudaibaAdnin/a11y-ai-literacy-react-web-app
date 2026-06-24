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
  const originalParagraphRef = useRef(null);
  const openedParagraphRef = useRef(null);
  const feedbackFromActionRef = useRef(false);

  const [feedback, setFeedback] = useState("");
  const [showMarkButton, setShowMarkButton] = useState(false);
  const [showYesButton, setShowYesButton] = useState(true);
  const [showCraftPromptButton, setShowCraftPromptButton] = useState(false);
  const [showOriginalParagraph, setShowOriginalParagraph] = useState(false);

  const {
    selectedCheckingParagraph,
    biasedParagraphPlan,
    detectedStoryBias,
    flaggedStoryParagraph,
    currentFocusedPanel,
  } = useSelector((state) => state.SpotTheBiasReducer);

  const isPanelOpen = selectedCheckingParagraph?.index != null;
  const paragraphIndex = selectedCheckingParagraph?.index;
  const paragraphNumber = paragraphIndex + 1;
  const isRephrased = selectedCheckingParagraph?.rephrasedFlag === true;

  const detectedItem = detectedStoryBias.storyBiasItems.find(
    (item) => item.paragraphIndex === paragraphIndex,
  );

  const alreadyMarked = flaggedStoryParagraph.flaggedStoryParagraphItems.some(
    (item) => item.paragraphIndex === paragraphIndex,
  );

  const alreadyHandled = detectedItem || alreadyMarked;

  const allBiasesDetected =
    biasedParagraphPlan.length > 0 &&
    detectedStoryBias.count === biasedParagraphPlan.length;

  const getBiasName = (biasCategory) =>
    typeof biasCategory === "string" ? biasCategory : biasCategory?.name || "";

  const focusConfirm = () =>
    requestAnimationFrame(() => confirmRef.current?.focus());

  const focusFeedback = () =>
    requestAnimationFrame(() => feedbackRef.current?.focus());

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

  const toggleOriginalText = () => {
    setShowOriginalParagraph((showing) => {
      const next = !showing;

      if (next) {
        requestAnimationFrame(() => originalParagraphRef.current?.focus());
      }

      return next;
    });
  };

  const closePanel = () => {
    openedParagraphRef.current = null;
    feedbackFromActionRef.current = false;
    setFeedback("");
    setShowMarkButton(false);
    setShowYesButton(true);
    setShowCraftPromptButton(false);
    setShowOriginalParagraph(false);
    dispatch(setSelectedCheckingParagraph(null));
    dispatch(setCurrentFocusedPanel("miaPanel"));
  };

  useEffect(() => {
    if (!isPanelOpen) {
      openedParagraphRef.current = null;
      feedbackFromActionRef.current = false;
      return;
    }

    const openedNewParagraph = openedParagraphRef.current !== paragraphIndex;

    if (openedNewParagraph) {
      openedParagraphRef.current = paragraphIndex;
      feedbackFromActionRef.current = false;
      setFeedback("");
      setShowMarkButton(false);
      setShowYesButton(true);
      setShowCraftPromptButton(false);
      setShowOriginalParagraph(false);
      dispatch(setCurrentFocusedPanel("biasCheckingPanel"));
      panelRef.current?.focus();

      if (isRephrased) {
        setShowMarkButton(false);
        setShowYesButton(false);
        setFeedback("This is a rephrased paragraph. You can rephrase more.");
        setShowCraftPromptButton(true);
        focusFeedback();
        return;
      }
    }

    if (feedbackFromActionRef.current) return;

    if (detectedItem) {
      setShowYesButton(false);
      setFeedbackWithCraft(
        `You already detected paragraph ${paragraphNumber} as biased. This paragraph has ${getBiasName(
          detectedItem.biasCategory,
        )}.`,
      );
      return;
    }

    if (alreadyMarked) {
      setShowYesButton(false);
      setFeedbackWithCraft(
        `You already marked paragraph ${paragraphNumber} for later.`,
      );
      return;
    }

    if (allBiasesDetected) {
      setShowYesButton(false);
      setShowMarkButton(true);
      setFeedbackWithFocus(
        `You have already detected all biases. Do you want to mark paragraph ${paragraphNumber} as biased and review it later?`,
      );
      return;
    }

    if (!isRephrased) focusConfirm();
  }, [
    isPanelOpen,
    paragraphIndex,
    paragraphNumber,
    isRephrased,
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
        paragraph: selectedCheckingParagraph.originalStoryParagraph,
      }),
    );

    setShowMarkButton(false);
    setShowYesButton(false);
    setFeedbackWithCraft(
      `Marked paragraph ${paragraphNumber}! You can review it later.`,
      true,
    );
  };

  const checkBias = () => {
    const matchedPlan = biasedParagraphPlan.find(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    setShowYesButton(false);
    setShowMarkButton(false);
    setShowCraftPromptButton(false);

    if (!matchedPlan) {
      setShowMarkButton(true);
      setFeedbackWithFocus(
        `Good try! Paragraph ${paragraphNumber} might not be a biased paragraph. Do you still want to mark it as biased and review it later?`,
      );
      return;
    }

    dispatch(
      addDetectedStoryBias({
        paragraphIndex,
        paragraph: selectedCheckingParagraph.originalStoryParagraph,
        biasCategory: matchedPlan.biasCategory,
      }),
    );

    const nextCount = detectedStoryBias.count + 1;
    const leftCount = biasedParagraphPlan.length - nextCount;
    const biasName = getBiasName(matchedPlan.biasCategory);

    setFeedbackWithCraft(
      leftCount === 0
        ? `Correct guess! Paragraph ${paragraphNumber} has ${biasName}. You detected all ${nextCount} biases.`
        : `Correct guess! Paragraph ${paragraphNumber} has ${biasName}. You detected ${nextCount} bias. You need to detect ${leftCount} more ${
            leftCount === 1 ? "bias" : "biases"
          }.`,
      true,
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
      closePanel();
      return;
    }

    if (event.key === "[" || event.key === "]" || event.key === "=") {
      closePanel();
    }
  };

  if (!isPanelOpen) return null;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "biasCheckingPanel"
          ? "bias-check-rephrase-sidebar-wrapper current-focused-panel"
          : "bias-check-rephrase-sidebar-wrapper"
      }
      role="dialog"
      aria-labelledby="bias-check-title"
      onMouseEnter={() => dispatch(setCurrentFocusedPanel("biasCheckingPanel"))}
      onFocusCapture={() =>
        dispatch(setCurrentFocusedPanel("biasCheckingPanel"))
      }
      onKeyDown={handleCheckingPanelKeyDown}
    >
      <h2 id="bias-check-title" className="panel-title">
        Bias Checking and Fixing Modal
      </h2>

      {!isRephrased &&
        !alreadyHandled &&
        !allBiasesDetected &&
        showYesButton && (
          <>
            <p ref={confirmRef} tabIndex={-1} className="bias-feedback">
              Do you want to confirm paragraph {paragraphNumber} has bias?
            </p>

            <div
              className="bias-checking-buttons"
              role="group"
              aria-label={`Confirm if paragraph ${paragraphNumber} has bias`}
            >
              <button
                type="button"
                className="page-button"
                aria-label={`Yes, paragraph ${paragraphNumber} has bias`}
                onClick={checkBias}
              >
                Yes
              </button>

              <button
                type="button"
                className="page-button"
                onClick={closePanel}
                aria-label="Close bias checking modal"
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

      {isRephrased && (
        <>
          <button
            type="button"
            className="page-button"
            onClick={toggleOriginalText}
            aria-expanded={showOriginalParagraph}
            aria-controls="previous-story-paragraph-text"
          >
            {showOriginalParagraph
              ? "Hide previous paragraph text"
              : "Read previous paragraph text"}
          </button>

          {showOriginalParagraph && (
            <p
              id="previous-story-paragraph-text"
              ref={originalParagraphRef}
              tabIndex={-1}
              className="story-paragraph-text"
            >
              Previous paragraph text:{" "}
              {selectedCheckingParagraph.originalStoryParagraph}
            </p>
          )}
        </>
      )}

      {!isRephrased && showMarkButton && (
        <div
          className="bias-checking-buttons"
          role="group"
          aria-label="Mark paragraph choices"
        >
          <button
            type="button"
            className="page-button"
            onClick={markParagraph}
            aria-label={`Mark paragraph ${paragraphNumber} for later review`}
          >
            Mark this paragraph
          </button>

          <button
            type="button"
            className="page-button"
            onClick={closePanel}
            aria-label="Close bias checking modal"
          >
            Close
          </button>
        </div>
      )}
      {showCraftPromptButton && (
        <>
          <CraftPromptRephrasePanel />

          <button
            type="button"
            className="page-button"
            onClick={closePanel}
            aria-label="Close bias checking modal"
          >
            Close
          </button>
        </>
      )}
    </section>
  );
};

export default BiasCheckingPanel;
