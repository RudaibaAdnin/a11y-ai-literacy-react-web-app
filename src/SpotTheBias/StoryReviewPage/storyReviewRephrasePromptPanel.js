import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../SpotTheBiasReducer";
import * as client from "./client.js";

const StoryReviewRephrasePromptPanel = () => {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const loadingRef = useRef(null);
  const explanationRef = useRef(null);

  const [promptHelp, setPromptHelp] = useState({});
  const [activeHelpIndex, setActiveHelpIndex] = useState(null);

  const { currentFocusedPanel, rephrasedParagraphHistory } = useSelector(
    (state) => state.SpotTheBiasReducer,
  );

  const activeExplanation =
    activeHelpIndex !== null ? promptHelp[activeHelpIndex] : null;

  useEffect(() => {
    if (!activeExplanation) return;

    requestAnimationFrame(() => {
      if (activeExplanation.isLoading) loadingRef.current?.focus();
      else explanationRef.current?.focus();
    });
  }, [activeExplanation]);

  // useEffect(() => {
  //   const handleRephrasePromptFocusKey = (event) => {
  //     if (event.key !== "=") return;

  //     event.preventDefault();
  //     dispatch(setCurrentFocusedPanel("reviewRephrasePromptPanel"));
  //     panelRef.current?.focus();
  //   };

  //   window.addEventListener("keydown", handleRephrasePromptFocusKey);
  //   return () =>
  //     window.removeEventListener("keydown", handleRephrasePromptFocusKey);
  // }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;

      const isTyping =
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "SELECT" ||
        activeElement?.isContentEditable;

      if (isTyping || event.key !== "=") return;

      event.preventDefault();
      dispatch(setCurrentFocusedPanel("reviewRephrasePromptPanel"));
      panelRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const focusPanel = () => {
    dispatch(setCurrentFocusedPanel("reviewRephrasePromptPanel"));
  };

  const togglePromptHelp = (index) => {
    setActiveHelpIndex(null);

    setPromptHelp((previousHelp) => {
      const updatedHelp = { ...previousHelp };
      delete updatedHelp[index];
      return updatedHelp;
    });
  };

  const fetchHowThisPromptHelps = async (index, rephrasePrompt) => {
    if (promptHelp[index]) {
      togglePromptHelp(index);
      return;
    }

    setActiveHelpIndex(index);
    setPromptHelp((previousHelp) => ({
      ...previousHelp,
      [index]: { isLoading: true },
    }));

    try {
      const data = await client.explainPromptHelpsRephrase({
        rephrasePrompt,
      });

      setPromptHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { data },
      }));
    } catch (error) {
      console.error("Could not explain rephrase prompt:", error);

      setPromptHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { error: "Sorry, I could not get the explanation." },
      }));
    }
  };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "reviewRephrasePromptPanel"
          ? "review-panel current-focused-panel"
          : "review-panel"
      }
      aria-labelledby="review-rephrase-prompts-title"
      onMouseEnter={focusPanel}
      onFocusCapture={focusPanel}
    >
      <h2
        id="review-rephrase-prompts-title"
        className="panel-title"
        tabIndex={0}
      >
        List of Bias-Fixing Prompts You Approved to Rewrite Biased Paragraphs
      </h2>

      {rephrasedParagraphHistory.length === 0 ? (
        <p className="question-empty">
          No prompts used yet to rewrite and fix biased paragraphs.
        </p>
      ) : (
        <>
          <p className="keyboard-instructions">
            Review the prompts you used to rewrite and fix biased paragraphs.
            Select Explain How This Prompt Helps button to learn how each prompt
            can help make a biased paragraph fairer.
          </p>

          <ol className="question-list" aria-label="Rephrase paragraph prompts">
            {rephrasedParagraphHistory.map((item, index) => {
              const explanation = promptHelp[index];
              const isActive = activeHelpIndex === index;
              const explanationId = `rephrase-paragraph-prompt-${index}-explanation`;

              return (
                <li key={index} className="lie-item">
                  <p className="question-text">
                    <strong>Prompt:</strong>{" "}
                    {item.promptUsedForRephraseCategory}
                    {": "} {item.promptUsedForRephrase}
                  </p>

                  <p className="question-reply-text">
                    <strong>Rephrased paragraph:</strong>{" "}
                    {item.rephrasedParagraph}
                  </p>

                  <button
                    type="button"
                    className="page-button"
                    onClick={() =>
                      fetchHowThisPromptHelps(index, item.promptUsedForRephrase)
                    }
                    aria-expanded={Boolean(explanation)}
                    aria-controls={explanationId}
                  >
                    {explanation
                      ? "Hide Explanation"
                      : "Explain How This Prompt Helps"}
                  </button>

                  {explanation?.isLoading && (
                    <p
                      id={explanationId}
                      ref={isActive ? loadingRef : null}
                      tabIndex={-1}
                      className="question-type-explanation"
                      role="status"
                      aria-live="polite"
                    >
                      Loading explanation on how this prompt helps rephrase a
                      paragraph to be fairer...
                    </p>
                  )}

                  {explanation?.error && (
                    <p
                      id={explanationId}
                      ref={isActive ? explanationRef : null}
                      tabIndex={-1}
                      className="question-type-explanation"
                      role="status"
                      aria-live="polite"
                    >
                      {explanation.error}
                    </p>
                  )}

                  {explanation?.data && (
                    <p
                      id={explanationId}
                      ref={isActive ? explanationRef : null}
                      tabIndex={-1}
                      className="question-type-explanation"
                      role="status"
                      aria-live="polite"
                    >
                      {explanation.data.explanation}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
};

export default StoryReviewRephrasePromptPanel;
