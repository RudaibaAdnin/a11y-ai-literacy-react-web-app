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

  useEffect(() => {
    const handleRephrasePromptFocusKey = (event) => {
      if (event.key !== "=") return;

      event.preventDefault();
      dispatch(setCurrentFocusedPanel("reviewRephrasePromptPanel"));
      panelRef.current?.focus();
    };

    window.addEventListener("keydown", handleRephrasePromptFocusKey);
    return () =>
      window.removeEventListener("keydown", handleRephrasePromptFocusKey);
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
        Rephrase Prompts You Used
      </h2>

      {rephrasedParagraphHistory.length === 0 ? (
        <p className="question-empty">No rephrase prompts used yet.</p>
      ) : (
        <>
          <p className="keyboard-instructions">
            Review the prompts you used to rephrase paragraphs. Select Explain
            How This Prompt Helps to learn why the prompt can improve a biased
            paragraph.
          </p>

          <ol className="question-list" aria-label="Rephrase prompts">
            {rephrasedParagraphHistory.map((item, index) => {
              const explanation = promptHelp[index];
              const isActive = activeHelpIndex === index;

              return (
                <li key={index} className="lie-item">
                  <p className="question-text">
                    <strong>Prompt:</strong> {item.promptUsedForRephrase}
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
                  >
                    {explanation
                      ? "Hide Explanation"
                      : "Explain How This Prompt Helps"}
                  </button>

                  {explanation?.isLoading && (
                    <p
                      ref={isActive ? loadingRef : null}
                      tabIndex={-1}
                      className="question-type-explanation"
                      role="status"
                      aria-live="polite"
                    >
                      Loading explanation...
                    </p>
                  )}

                  {explanation?.error && (
                    <p
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
                    <div
                      ref={isActive ? explanationRef : null}
                      tabIndex={-1}
                      className="question-type-explanation"
                      aria-live="polite"
                    >
                      <p>{explanation.data.explanation}</p>
                    </div>
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
