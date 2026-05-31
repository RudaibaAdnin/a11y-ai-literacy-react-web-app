import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setSelectedCheckingImageDescriptionParagraph,
  setCurrentFocusedImagePanel,
  addDetectedImageDescriptionBiasParagraph,
  addFlaggedImageDescriptionParagraph,
} from "../../ImageBiasReducer";
import "./index.css";

const ImageBiasCheckingPanel = () => {
  const dispatch = useDispatch();

  const panelRef = useRef(null);
  const confirmRef = useRef(null);
  const feedbackRef = useRef(null);
  const openedParagraphRef = useRef(null);
  const feedbackFromActionRef = useRef(false);

  const [feedback, setFeedback] = useState("");
  const [showMarkButton, setShowMarkButton] = useState(false);
  const [showYesButton, setShowYesButton] = useState(true);

  const {
    selectedCheckingImageDescriptionParagraph,
    biasedImageDescriptionParagraphPlan,
    detectedImageDescriptionBiasParagraph,
    flaggedImageDescriptionParagraph,
    currentFocusedImagePanel,
  } = useSelector((state) => state.ImageBiasReducer);

  const isPanelOpen = selectedCheckingImageDescriptionParagraph.index !== null;
  const paragraphIndex = selectedCheckingImageDescriptionParagraph.index;
  const paragraphNumber = paragraphIndex + 1;

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

  const showConfirmButtons =
    showYesButton && !detectedItem && !alreadyMarked && !allBiasesDetected;

  const showFeedbackOnlyCloseButton = !showConfirmButtons && !showMarkButton;

  const getBiasName = (biasCategory) =>
    typeof biasCategory === "string" ? biasCategory : biasCategory?.name || "";

  const setFeedbackWithFocus = (message) => {
    setFeedback(message);
    requestAnimationFrame(() => feedbackRef.current?.focus());
  };

  const closePanel = () => {
    openedParagraphRef.current = null;
    feedbackFromActionRef.current = false;
    setFeedback("");
    setShowMarkButton(false);
    setShowYesButton(true);
    dispatch(setSelectedCheckingImageDescriptionParagraph(null));
    dispatch(setCurrentFocusedImagePanel("miaImagePanel"));
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
      setShowYesButton(true);
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
        `You have already detected all image biases. Do you want to mark paragraph ${paragraphNumber} and review it later?`,
      );
      return;
    }

    requestAnimationFrame(() => confirmRef.current?.focus());
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

  const checkBias = () => {
    const matchedPlan = biasedImageDescriptionParagraphPlan.find(
      (item) => item.imageDescriptionParagraphIndex === paragraphIndex,
    );

    setShowYesButton(false);
    setShowMarkButton(false);

    if (!matchedPlan) {
      setShowMarkButton(true);
      setFeedbackWithFocus(
        `Good try! Paragraph ${paragraphNumber} might not be a biased image description paragraph. Do you still want to mark it for later?`,
      );
      return;
    }

    dispatch(
      addDetectedImageDescriptionBiasParagraph({
        imageDescriptionParagraphIndex: paragraphIndex,
        paragraph:
          selectedCheckingImageDescriptionParagraph.originalImageDescriptionParagraph,
        biasCategory: matchedPlan.biasCategory,
      }),
    );

    feedbackFromActionRef.current = true;

    setFeedbackWithFocus(
      detectedImageDescriptionBiasParagraph.count + 1 ===
        biasedImageDescriptionParagraphPlan.length
        ? `Correct guess! Paragraph ${paragraphNumber} has ${getBiasName(
            matchedPlan.biasCategory,
          )}. You detected all image biases.`
        : `Correct guess! Paragraph ${paragraphNumber} has ${getBiasName(
            matchedPlan.biasCategory,
          )}.`,
    );
  };

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
    >
      <h2 id="image-bias-check-title" className="panel-title">
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
            aria-label="Image bias checking choices"
          >
            <button type="button" className="page-button" onClick={checkBias}>
              Yes
            </button>

            <button type="button" className="page-button" onClick={closePanel}>
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
        >
          {feedback}
        </p>
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
