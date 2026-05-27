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
  const [showCraftPromptButton, setShowCraftPromptButton] = useState(false);

  const {
    selectedCheckingParagraph,
    biasedParagraphPlan,
    detectedStoryBias,
    flaggedStoryParagraph,
    currentFocusedPanel,
  } = useSelector((state) => state.SpotTheBiasReducer);

  const isPanelOpen = selectedCheckingParagraph.index !== null;

  const closePanel = () => {
    dispatch(setSelectedCheckingParagraph({ index: null, paragraph: "" }));
    setFeedback("");
    setShowMarkButton(false);
    setShowCraftPromptButton(false);
  };

  const showCraftPromptOption = (message) => {
    setFeedback(message);
    setShowCraftPromptButton(true);
  };

  const getBiasName = (biasCategory) =>
    typeof biasCategory === "string" ? biasCategory : biasCategory?.name || "";

  useEffect(() => {
    if (!isPanelOpen) return;

    setFeedback("");
    setShowMarkButton(false);
    setShowCraftPromptButton(false);
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

    if (currentFocusedPanel !== "biasCheckingPanel") closePanel();
  }, [currentFocusedPanel, isPanelOpen]);

  const markParagraph = () => {
    const paragraphIndex = selectedCheckingParagraph.index;

    const alreadyMarked = flaggedStoryParagraph.flaggedStoryParagraphItems.some(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    if (alreadyMarked) {
      showCraftPromptOption("You have marked this paragraph for later review.");
      return;
    }

    dispatch(
      addFlaggedStoryParagraph({
        paragraphIndex,
        paragraph: selectedCheckingParagraph.paragraph,
      }),
    );

    setShowMarkButton(false);
    showCraftPromptOption("Marked! You can review this paragraph later.");
  };

  const checkBias = () => {
    const paragraphIndex = selectedCheckingParagraph.index;
    const totalBiasCount = biasedParagraphPlan.length;

    const matchedPlan = biasedParagraphPlan.find(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    const detectedItem = detectedStoryBias.storyBiasItems.find(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    const alreadyMarked = flaggedStoryParagraph.flaggedStoryParagraphItems.some(
      (item) => item.paragraphIndex === paragraphIndex,
    );

    setShowMarkButton(false);
    setShowCraftPromptButton(false);

    if (detectedItem) {
      showCraftPromptOption(
        `Already detected. This paragraph has ${getBiasName(
          detectedItem.biasCategory,
        )}.`,
      );
      return;
    }

    if (alreadyMarked) {
      showCraftPromptOption("You already marked this paragraph for later.");
      return;
    }

    if (detectedStoryBias.count === totalBiasCount) {
      setFeedback(
        "Great job! You already found all the biased paragraphs. Do you still want to mark this paragraph as biased and review it later?",
      );
      setShowMarkButton(true);
      return;
    }

    if (!matchedPlan) {
      setFeedback(
        "Good try! This might not be a biased paragraph. Do you still want to mark it as biased and review it later?",
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
    const leftCount = totalBiasCount - nextCount;
    const biasName = getBiasName(matchedPlan.biasCategory);

    showCraftPromptOption(
      leftCount === 0
        ? `Correct guess! You detected all ${nextCount} biases. This paragraph has ${biasName}.`
        : `Correct guess! You detected ${nextCount} biases. This paragraph has ${biasName}. You need to detect ${leftCount} more ${
            leftCount === 1 ? "bias" : "biases"
          }.`,
    );
  };

  const craftPrompt = () => {
    dispatch(setCurrentFocusedPanel("craftPromptPanel"));
  };

  if (!isPanelOpen) return null;

  return (
    <>
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
        onMouseEnter={() =>
          dispatch(setCurrentFocusedPanel("biasCheckingPanel"))
        }
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
            Mark this paragraph
          </button>
        )}
        {showCraftPromptButton && (
          <section
            className="craft-prompt-option"
            aria-labelledby="craft-prompt-title"
          >
            <h3 id="craft-prompt-title" className="bias-checking-title">
              Do you want to rephrase this paragraph?
            </h3>

            <button type="button" className="page-button" onClick={craftPrompt}>
              Craft Prompt to Rephrase this Paragraph
            </button>
          </section>
        )}
      </section>
    </>
  );
};

export default BiasCheckingPanel;
