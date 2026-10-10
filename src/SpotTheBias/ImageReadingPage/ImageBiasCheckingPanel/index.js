import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  setSelectedCheckingImageDescriptionParagraph,
  setCurrentFocusedImagePanel,
  addDetectedImageDescriptionBiasParagraph,
  addFlaggedImageDescriptionParagraph,
} from "../../ImageBiasReducer";

import "./index.css";

import * as client from "./client.js";

const ImageBiasCheckingPanel = () => {
  const dispatch = useDispatch();

  const panelRef = useRef(null);
  const confirmRef = useRef(null);
  const feedbackRef = useRef(null);
  const optionsStatusRef = useRef(null);
  const resultRef = useRef(null);
  const openedParagraphRef = useRef(null);
  const feedbackFromActionRef = useRef(false);

  const [feedback, setFeedback] = useState("");
  const [showMarkButton, setShowMarkButton] = useState(false);
  const [showYesButton, setShowYesButton] = useState(true);

  const [biasCheckOptions, setBiasCheckOptions] = useState([]);
  const [selectedBiasCheckOptions, setSelectedBiasCheckOptions] = useState([]);
  const [customBiasAnswer, setCustomBiasAnswer] = useState("");
  const [showBiasCheckOptions, setShowBiasCheckOptions] = useState(false);
  const [loadingBiasCheckOptions, setLoadingBiasCheckOptions] = useState(false);
  const [checkingBiasAnswer, setCheckingBiasAnswer] = useState(false);

  const {
    selectedCheckingImageDescriptionParagraph,
    biasedImageDescriptionParagraphPlan,
    detectedImageDescriptionBiasParagraph,
    flaggedImageDescriptionParagraph,
    currentFocusedImagePanel,
  } = useSelector((state) => state.ImageBiasReducer);

  const isPanelOpen = selectedCheckingImageDescriptionParagraph?.index != null;

  const paragraphIndex = selectedCheckingImageDescriptionParagraph?.index;

  const paragraphNumber = paragraphIndex != null ? paragraphIndex + 1 : 0;

  const detectedItem =
    detectedImageDescriptionBiasParagraph.imageDescriptionBiasItems.find(
      (item) => item.imageDescriptionParagraphIndex === paragraphIndex,
    );

  const alreadyMarked =
    flaggedImageDescriptionParagraph.flaggedImageDescriptionParagraphItems.some(
      (item) => item.imageDescriptionParagraphIndex === paragraphIndex,
    );

  const allBiasesDetected =
    biasedImageDescriptionParagraphPlan.length > 0 &&
    detectedImageDescriptionBiasParagraph.count ===
      biasedImageDescriptionParagraphPlan.length;

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

  const resetBiasCheckOptions = () => {
    setBiasCheckOptions([]);
    setSelectedBiasCheckOptions([]);
    setCustomBiasAnswer("");
    setShowBiasCheckOptions(false);
    setLoadingBiasCheckOptions(false);
    setCheckingBiasAnswer(false);
  };

  const closePanel = () => {
    openedParagraphRef.current = null;
    feedbackFromActionRef.current = false;

    setFeedback("");
    setShowMarkButton(false);
    setShowYesButton(true);

    resetBiasCheckOptions();

    dispatch(setSelectedCheckingImageDescriptionParagraph(null));

    dispatch(setCurrentFocusedImagePanel("miaImagePanel"));
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

      resetBiasCheckOptions();

      dispatch(setCurrentFocusedImagePanel("imageBiasCheckingPanel"));

      panelRef.current?.focus();
    }

    if (feedbackFromActionRef.current) return;

    if (detectedItem) {
      setShowYesButton(false);

      setFeedbackWithFocus(
        `You already detected paragraph ${paragraphNumber} as biased. This paragraph has ${getBiasName(
          detectedItem.biasCategory,
        )}.`,
      );

      return;
    }

    if (alreadyMarked) {
      setShowYesButton(false);

      setFeedbackWithFocus(
        `You already marked paragraph ${paragraphNumber} for later.`,
      );

      return;
    }

    if (allBiasesDetected) {
      setShowYesButton(false);
      setShowMarkButton(true);

      setFeedbackWithFocus(
        `You have already detected the image bias. Do you want to mark paragraph ${paragraphNumber} and review it later?`,
      );

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
      setFeedbackWithFocus(
        `You already marked paragraph ${paragraphNumber} for later.`,
      );

      return;
    }

    dispatch(
      addFlaggedImageDescriptionParagraph({
        imageDescriptionParagraphIndex: paragraphIndex,

        paragraph:
          selectedCheckingImageDescriptionParagraph.originalImageDescriptionParagraph,
      }),
    );

    feedbackFromActionRef.current = true;

    setShowMarkButton(false);
    setShowYesButton(false);

    setFeedbackWithFocus(
      `Marked paragraph ${paragraphNumber}! You can review it later.`,
    );
  };

  /*
   * STEP 1:
   * User says Yes.
   *
   * Load reflection choices from backend.
   */
  const checkBias = async () => {
    setShowYesButton(false);
    setShowMarkButton(false);

    setFeedback("");
    setBiasCheckOptions([]);
    setSelectedBiasCheckOptions([]);
    setCustomBiasAnswer("");

    setShowBiasCheckOptions(true);
    setLoadingBiasCheckOptions(true);

    try {
      const data = await client.getImageBiasCheckOptions({
        paragraph:
          selectedCheckingImageDescriptionParagraph.originalImageDescriptionParagraph,
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
      console.error("Could not load image bias checking options:", error);

      setLoadingBiasCheckOptions(false);
      setShowBiasCheckOptions(false);
      setShowYesButton(true);

      setFeedbackWithFocus(
        "Sorry, the image bias checking options could not be loaded right now.",
      );
    }
  };

  const removeStatementFromAnswer = (text, statement) => {
    return text.replace(statement, "").replace(/\s+/g, " ").trim();
  };

  /*
   * Checkbox interaction:
   * selecting adds statement to textbox
   * unselecting removes it
   */
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

  /*
   * STEP 2:
   * Check Answer.
   *
   * The frontend finds the hidden planned bias
   * and sends it to backend.
   *
   * Backend returns:
   * {
   *   correct,
   *   explanation
   * }
   */
  const checkBiasAnswer = async () => {
    if (selectedBiasCheckOptions.length === 0 && !customBiasAnswer.trim()) {
      setFeedbackWithFocus(
        "Select at least one statement or type your own answer before checking.",
      );

      return;
    }

    const matchedPlan = biasedImageDescriptionParagraphPlan.find(
      (item) => item.imageDescriptionParagraphIndex === paragraphIndex,
    );

    setCheckingBiasAnswer(true);

    try {
      const data = await client.checkImageBiasAnswer({
        paragraph:
          selectedCheckingImageDescriptionParagraph.originalImageDescriptionParagraph,

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

      /*
       * Planned biased paragraph.
       */
      if (data.correct && matchedPlan) {
        dispatch(
          addDetectedImageDescriptionBiasParagraph({
            imageDescriptionParagraphIndex: paragraphIndex,

            paragraph:
              selectedCheckingImageDescriptionParagraph.originalImageDescriptionParagraph,

            biasCategory: matchedPlan.biasCategory,
          }),
        );

        const nextCount = detectedImageDescriptionBiasParagraph.count + 1;

        const leftCount =
          biasedImageDescriptionParagraphPlan.length - nextCount;

        const biasName = getBiasName(matchedPlan.biasCategory);

        setShowBiasCheckOptions(false);
        setShowMarkButton(false);

        const resultMessage =
          leftCount === 0
            ? `Correct guess! Paragraph ${paragraphNumber} has ${biasName}. ${
                data.explanation || ""
              } You detected all image bias.`
            : `Correct guess! Paragraph ${paragraphNumber} has ${biasName}. ${
                data.explanation || ""
              } You detected ${nextCount} image bias. You need to detect ${leftCount} more ${
                leftCount === 1 ? "bias" : "biases"
              }.`;

        feedbackFromActionRef.current = true;

        setFeedback(resultMessage);

        focusResult();

        return;
      }

      /*
       * Not one of the planned biased paragraphs.
       */
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

      /*
       * Defensive fallback.
       * Normally unreachable because backend correct
       * is based on Boolean(biasCategory).
       */
      setShowBiasCheckOptions(false);

      setFeedback(`No, that was not correct. ${data.explanation || ""}`);

      focusResult();
    } catch (error) {
      console.error("Could not check image bias answer:", error);

      setCheckingBiasAnswer(false);

      setFeedbackWithFocus(
        "Sorry, your answer could not be checked right now.",
      );
    }
  };

  const handleBiasCheckingPanelKeyDown = (event) => {
    const activeElement = document.activeElement;

    const isTyping =
      activeElement?.tagName === "TEXTAREA" ||
      activeElement?.tagName === "INPUT" ||
      activeElement?.tagName === "SELECT" ||
      activeElement?.isContentEditable;

    if (isTyping) return;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closePanel();

      return;
    }

    if (event.key === "[" || event.key === "]" || event.key === "=") {
      event.preventDefault();
      event.stopPropagation();

      closePanel();
    }
  };

  const hasBiasCheckAnswer =
    selectedBiasCheckOptions.length > 0 || customBiasAnswer.trim().length > 0;

  const showConfirmButtons =
    showYesButton &&
    !detectedItem &&
    !alreadyMarked &&
    !allBiasesDetected &&
    !showBiasCheckOptions;

  const showFeedbackOnlyCloseButton =
    !showConfirmButtons && !showMarkButton && !showBiasCheckOptions;

  if (!isPanelOpen) return null;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={
        currentFocusedImagePanel === "imageBiasCheckingPanel"
          ? "image-bias-check-sidebar-panel current-focused-panel"
          : "image-bias-check-sidebar-panel"
      }
      role="dialog"
      aria-modal="false"
      aria-labelledby="image-bias-check-title"
      onMouseEnter={() =>
        dispatch(setCurrentFocusedImagePanel("imageBiasCheckingPanel"))
      }
      onFocusCapture={() =>
        dispatch(setCurrentFocusedImagePanel("imageBiasCheckingPanel"))
      }
      onKeyDown={handleBiasCheckingPanelKeyDown}
    >
      <h2 id="image-bias-check-title" className="panel-title" tabIndex={0}>
        Image Bias Checking Panel
      </h2>

      {showConfirmButtons && (
        <>
          <p ref={confirmRef} tabIndex={-1} className="bias-feedback">
            Do you want to confirm paragraph {paragraphNumber} has image bias?
          </p>

          <div
            className="bias-checking-buttons"
            role="group"
            aria-label={`Confirm whether image description paragraph ${paragraphNumber} has bias`}
          >
            <button
              type="button"
              className="page-button"
              onClick={checkBias}
              aria-label={`Yes, I think image description paragraph ${paragraphNumber} has bias`}
            >
              Yes
            </button>

            <button
              type="button"
              className="page-button"
              onClick={closePanel}
              aria-label="Close image bias checking panel"
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
          Loading image bias checking choices for paragraph {paragraphNumber}...
        </p>
      )}

      {showBiasCheckOptions &&
        !loadingBiasCheckOptions &&
        biasCheckOptions.length > 0 && (
          <div
            className="bias-check-options-section"
            role="region"
            aria-labelledby="image-bias-check-options-title"
          >
            <p
              id="image-bias-check-options-title"
              ref={optionsStatusRef}
              tabIndex={-1}
              className="keyboard-instructions"
              role="status"
              aria-live="polite"
            >
              Loaded image bias checking choices for paragraph {paragraphNumber}
              .
            </p>

            <p className="keyboard-instructions" tabIndex={0}>
              Select one or more statements that match what you notice. You can
              also type or edit your answer below.
            </p>

            <ul
              className="bias-checkbox-list"
              aria-label={`Image bias checking choices for paragraph ${paragraphNumber}`}
            >
              {biasCheckOptions.map((option, index) => {
                const optionId = `image-bias-check-option-${paragraphIndex}-${index}`;

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
              htmlFor="custom-image-bias-answer"
              className="manual-followup-question-label"
              tabIndex={0}
            >
              Type or edit your answer:
            </label>

            <div className="manual-followup-question-pane">
              <textarea
                id="custom-image-bias-answer"
                className="manual-followup-question-input"
                value={customBiasAnswer}
                onChange={(event) => setCustomBiasAnswer(event.target.value)}
                placeholder="Select statements above or type your own answer..."
                rows={5}
                aria-label={`Type or edit your image bias checking answer for paragraph ${paragraphNumber}`}
              />

              <button
                type="button"
                className="page-button"
                onClick={checkBiasAnswer}
                disabled={!hasBiasCheckAnswer || checkingBiasAnswer}
                aria-label={
                  checkingBiasAnswer
                    ? "Checking image bias answer"
                    : `Check answer for image description paragraph ${paragraphNumber}`
                }
              >
                {checkingBiasAnswer ? "Checking Answer..." : "Check Answer"}
              </button>
            </div>

            <div
              className="bias-checking-buttons"
              role="group"
              aria-label="Image bias checking panel actions"
            >
              <button
                type="button"
                className="page-button"
                onClick={closePanel}
                aria-label="Close image bias checking panel"
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

      {showFeedbackOnlyCloseButton && (
        <button type="button" className="page-button" onClick={closePanel}>
          Close
        </button>
      )}

      {showMarkButton && (
        <div
          className="bias-checking-buttons"
          role="group"
          aria-label="Mark image description paragraph choices"
        >
          <button type="button" className="page-button" onClick={markParagraph}>
            Mark this paragraph
          </button>

          <button type="button" className="page-button" onClick={closePanel}>
            Close
          </button>
        </div>
      )}
    </section>
  );
};

export default ImageBiasCheckingPanel;
