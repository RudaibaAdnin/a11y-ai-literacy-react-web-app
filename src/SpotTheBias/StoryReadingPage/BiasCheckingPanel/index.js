import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import "./index.css";

import CraftPromptRephrasePanel from "../CraftPromptRephrase";

import * as client from "./client.js";

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
  const optionsStatusRef = useRef(null);
  const resultRef = useRef(null);
  const originalParagraphRef = useRef(null);
  const openedParagraphRef = useRef(null);
  const feedbackFromActionRef = useRef(false);

  const [feedback, setFeedback] = useState("");
  const [showMarkButton, setShowMarkButton] = useState(false);
  const [showYesButton, setShowYesButton] = useState(true);
  const [showCraftPromptButton, setShowCraftPromptButton] = useState(false);
  const [showOriginalParagraph, setShowOriginalParagraph] = useState(false);

  const [biasCheckOptions, setBiasCheckOptions] = useState([]);
  const [selectedBiasCheckOptions, setSelectedBiasCheckOptions] = useState([]);
  const [customBiasAnswer, setCustomBiasAnswer] = useState("");
  const [showBiasCheckOptions, setShowBiasCheckOptions] = useState(false);
  const [loadingBiasCheckOptions, setLoadingBiasCheckOptions] = useState(false);
  const [checkingBiasAnswer, setCheckingBiasAnswer] = useState(false);

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

  const focusResult = () =>
    requestAnimationFrame(() => resultRef.current?.focus());

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

  const resetBiasCheckOptions = () => {
    setBiasCheckOptions([]);
    setSelectedBiasCheckOptions([]);
    setCustomBiasAnswer("");
    setShowBiasCheckOptions(false);
    setLoadingBiasCheckOptions(false);
    setCheckingBiasAnswer(false);
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

    resetBiasCheckOptions();

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

      resetBiasCheckOptions();

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

    if (!isRephrased) {
      focusConfirm();
    }
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

  const checkBias = async () => {
    setShowYesButton(false);
    setShowMarkButton(false);
    setShowCraftPromptButton(false);

    setFeedback("");
    setBiasCheckOptions([]);
    setSelectedBiasCheckOptions([]);
    setCustomBiasAnswer("");
    setShowBiasCheckOptions(true);
    setLoadingBiasCheckOptions(true);

    try {
      const data = await client.getBiasCheckOptions({
        paragraph: selectedCheckingParagraph.originalStoryParagraph,
      });

      const categories = data.biasCheckCategories || [];

      const statements = data.biasCheckStatements || [];

      const options = statements.map((statement, index) => ({
        category: categories[index] || "",
        statement,
      }));

      setBiasCheckOptions(options);
      setLoadingBiasCheckOptions(false);

      requestAnimationFrame(() => optionsStatusRef.current?.focus());
    } catch (error) {
      console.error("Could not load bias checking options:", error);

      setLoadingBiasCheckOptions(false);
      setShowBiasCheckOptions(false);
      setShowYesButton(true);

      setFeedbackWithFocus(
        "Sorry, the bias checking options could not be loaded right now.",
      );
    }
  };

  const removeStatementFromAnswer = (text, statement) => {
    return text.replace(statement, "").replace(/\s+/g, " ").trim();
  };

  const toggleBiasCheckOption = (option) => {
    const alreadySelected = selectedBiasCheckOptions.some(
      (item) =>
        item.category === option.category &&
        item.statement === option.statement,
    );

    if (alreadySelected) {
      setSelectedBiasCheckOptions((current) =>
        current.filter(
          (item) =>
            !(
              item.category === option.category &&
              item.statement === option.statement
            ),
        ),
      );

      setCustomBiasAnswer((current) =>
        removeStatementFromAnswer(current, option.statement),
      );

      return;
    }

    setSelectedBiasCheckOptions((current) => [...current, option]);

    setCustomBiasAnswer((current) =>
      `${current} ${option.statement}`.replace(/\s+/g, " ").trim(),
    );
  };

  const checkBiasAnswer = async () => {
    if (selectedBiasCheckOptions.length === 0 && !customBiasAnswer.trim()) {
      setFeedbackWithFocus(
        "Select at least one statement or type your own answer before checking.",
      );

      return;
    }

    const matchedPlan = biasedParagraphPlan.find(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    setCheckingBiasAnswer(true);

    try {
      const data = await client.checkBiasAnswer({
        paragraph: selectedCheckingParagraph.originalStoryParagraph,

        biasCategory: matchedPlan?.biasCategory || null,

        selectedCategories: selectedBiasCheckOptions.map(
          (item) => item.category,
        ),

        selectedStatements: selectedBiasCheckOptions.map(
          (item) => item.statement,
        ),

        typedAnswer: customBiasAnswer.trim(),
      });

      setCheckingBiasAnswer(false);

      if (data.correct && matchedPlan) {
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

        setShowBiasCheckOptions(false);
        setShowMarkButton(false);

        const resultMessage =
          leftCount === 0
            ? `Correct guess! Paragraph ${paragraphNumber} has ${biasName}. ${
                data.explanation || ""
              } You detected all ${nextCount} biases.`
            : `Correct guess! Paragraph ${paragraphNumber} has ${biasName}. ${
                data.explanation || ""
              } You detected ${nextCount} bias. You need to detect ${leftCount} more ${
                leftCount === 1 ? "bias" : "biases"
              }.`;

        feedbackFromActionRef.current = true;

        setFeedback(resultMessage);

        setShowCraftPromptButton(true);

        focusResult();

        return;
      }

      if (!matchedPlan) {
        setShowBiasCheckOptions(false);
        setShowMarkButton(true);

        setFeedback(
          `No, that was not correct. ${
            data.explanation || ""
          } Do you still want to mark paragraph ${paragraphNumber} as biased and review it later?`,
        );

        focusResult();

        return;
      }

      setShowBiasCheckOptions(false);

      setFeedback(`No, that was not correct. ${data.explanation || ""}`);

      setShowCraftPromptButton(true);

      focusResult();
    } catch (error) {
      console.error("Could not check bias answer:", error);

      setCheckingBiasAnswer(false);

      setFeedbackWithFocus(
        "Sorry, your answer could not be checked right now.",
      );
    }
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

  const hasBiasCheckAnswer =
    selectedBiasCheckOptions.length > 0 || customBiasAnswer.trim().length > 0;

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
      aria-modal="false"
      aria-labelledby="bias-check-title"
      onMouseEnter={() => dispatch(setCurrentFocusedPanel("biasCheckingPanel"))}
      onFocusCapture={() =>
        dispatch(setCurrentFocusedPanel("biasCheckingPanel"))
      }
      onKeyDown={handleCheckingPanelKeyDown}
    >
      <h2 id="bias-check-title" className="panel-title" tabIndex={0}>
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
              aria-label={`Confirm whether paragraph ${paragraphNumber} has bias`}
            >
              <button
                type="button"
                className="page-button"
                aria-label={`Yes, I think paragraph ${paragraphNumber} has bias`}
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

      {feedback && (
        <p
          ref={feedbackRef}
          tabIndex={-1}
          className="bias-feedback"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback}
        </p>
      )}

      {loadingBiasCheckOptions && (
        <p
          ref={optionsStatusRef}
          tabIndex={-1}
          className="keyboard-instructions"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Loading bias checking choices for paragraph {paragraphNumber}...
        </p>
      )}

      {showBiasCheckOptions &&
        !loadingBiasCheckOptions &&
        biasCheckOptions.length > 0 && (
          <div
            className="bias-check-options-section"
            role="region"
            aria-labelledby="bias-check-options-title"
          >
            <p
              id="bias-check-options-title"
              ref={optionsStatusRef}
              tabIndex={-1}
              className="keyboard-instructions"
              role="status"
              aria-live="polite"
            >
              Loaded bias checking choices for paragraph {paragraphNumber}.
            </p>

            <p className="keyboard-instructions" tabIndex={0}>
              Select one or more statements that match what you notice. You can
              also type or edit your answer below.
            </p>

            <ul
              className="bias-checkbox-list"
              aria-label={`Bias checking choices for paragraph ${paragraphNumber}`}
            >
              {biasCheckOptions.map((option, index) => {
                const optionId = `bias-check-option-${paragraphIndex}-${index}`;

                const checked = selectedBiasCheckOptions.some(
                  (item) =>
                    item.category === option.category &&
                    item.statement === option.statement,
                );

                return (
                  <li
                    key={`${option.category}-${index}`}
                    className="bias-checkbox-list-item"
                  >
                    <label
                      htmlFor={optionId}
                      className={
                        checked
                          ? "bias-checkbox-option bias-checkbox-option-selected"
                          : "bias-checkbox-option"
                      }
                    >
                      <input
                        id={optionId}
                        type="checkbox"
                        className="bias-checkbox-input"
                        checked={checked}
                        onChange={() => toggleBiasCheckOption(option)}
                      />

                      <span className="bias-checkbox-text">
                        <strong>{option.category}: </strong>

                        {option.statement}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>

            <label
              htmlFor="custom-bias-answer"
              className="manual-followup-question-label"
              tabIndex={0}
            >
              Type or edit your answer:
            </label>

            <div className="manual-followup-question-pane">
              <textarea
                id="custom-bias-answer"
                className="manual-followup-question-input"
                value={customBiasAnswer}
                onChange={(event) => setCustomBiasAnswer(event.target.value)}
                placeholder="Select statements above or type your own answer..."
                rows={5}
                aria-label={`Type or edit your bias checking answer for paragraph ${paragraphNumber}`}
              />

              <button
                type="button"
                className="page-button"
                onClick={checkBiasAnswer}
                disabled={!hasBiasCheckAnswer || checkingBiasAnswer}
                aria-label={
                  checkingBiasAnswer
                    ? "Checking bias answer"
                    : `Check answer for paragraph ${paragraphNumber}`
                }
              >
                {checkingBiasAnswer ? "Checking Answer..." : "Check Answer"}
              </button>
            </div>

            <div
              className="bias-checking-buttons"
              role="group"
              aria-label="Bias checking modal actions"
            >
              <button
                type="button"
                className="page-button"
                onClick={closePanel}
                aria-label="Close bias checking modal"
              >
                Close
              </button>
            </div>
          </div>
        )}

      {feedback && !showBiasCheckOptions && (
        <span
          ref={resultRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {feedback}
        </span>
      )}

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
