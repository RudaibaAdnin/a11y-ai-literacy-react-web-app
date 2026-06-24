import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCurrentFocusedImagePanel } from "../ImageBiasReducer";
import * as client from "./client.js";
import "./index.css";

const ImageReviewRephrasePromptPanel = () => {
  const dispatch = useDispatch();

  const promptPanelRef = useRef(null);
  const loadingRef = useRef(null);
  const explanationRef = useRef(null);

  const [promptHelp, setPromptHelp] = useState({});
  const [activeHelpIndex, setActiveHelpIndex] = useState(null);

  const { currentFocusedImagePanel, rephrasedPromptHistoryImage } = useSelector(
    (state) => state.ImageBiasReducer,
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
    const handleFollowUpsFocusKey = (event) => {
      if (event.key !== "=") return;

      event.preventDefault();
      dispatch(setCurrentFocusedImagePanel("imageReviewRephrasePromptPanel"));
      promptPanelRef.current?.focus();
    };

    window.addEventListener("keydown", handleFollowUpsFocusKey);
    return () => window.removeEventListener("keydown", handleFollowUpsFocusKey);
  }, [dispatch]);

  const focusReviewPromptPanel = () => {
    dispatch(setCurrentFocusedImagePanel("imageReviewRephrasePromptPanel"));
  };

  const togglePromptHelp = (index) => {
    setActiveHelpIndex(null);
    setPromptHelp((previousHelp) => {
      const updatedHelp = { ...previousHelp };
      delete updatedHelp[index];
      return updatedHelp;
    });
  };

  const fetchWhyThisPromptHelps = async (index, item) => {
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
      const data = await client.explainSuggestionsHelpsRephrasePromptImage({
        displayedPromptImage: item.displayedPromptImage,
        rephrasedPromptImage: item.rephrasedPromptImage,
      });

      setPromptHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { data },
      }));
    } catch (error) {
      console.error("Could not explain image prompt:", error);
      setPromptHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { error: "Sorry, I could not get the explanation." },
      }));
    }
  };

  return (
    <section
      ref={promptPanelRef}
      tabIndex={-1}
      className={
        currentFocusedImagePanel === "imageReviewRephrasePromptPanel"
          ? "review-panel current-focused-panel"
          : "review-panel"
      }
      aria-labelledby="image-review-rephrase-prompt-title"
      onMouseEnter={focusReviewPromptPanel}
      onFocusCapture={focusReviewPromptPanel}
    >
      <h2
        id="image-review-rephrase-prompt-title"
        className="panel-title"
        tabIndex={0}
      >
        List of Image Prompts You Approved to Fix the Image
      </h2>

      {rephrasedPromptHistoryImage.length === 0 ? (
        <p className="question-empty">No image prompt rewrites yet.</p>
      ) : (
        <>
          <p className="keyboard-instructions">
            Review the image prompts you approved. Select Explain How This
            Prompt Helps to learn how your prompt can help to make the image
            fairer.
          </p>

          <ol
            className="question-list"
            aria-label="Mia image prompt rewrite history"
          >
            {rephrasedPromptHistoryImage.map((item, index) => {
              const explanation = promptHelp[index];
              const isActive = activeHelpIndex === index;

              return (
                <li key={index} className="lie-item">
                  <p className="question-text">
                    <strong>Original prompt:</strong>{" "}
                    {item.displayedPromptImage}
                  </p>

                  {/* <p>
                    <strong>Prompt help used:</strong>{" "}
                    {item.promptUsedForRephraseImage}
                  </p>

                  <p>
                    <strong>Prompt help type:</strong>{" "}
                    {item.promptUsedForRephraseCategoryImage}
                  </p> */}

                  <p>
                    <strong>Rewritten prompt:</strong>{" "}
                    {item.rephrasedPromptImage}
                  </p>

                  <button
                    type="button"
                    className="page-button"
                    onClick={() => fetchWhyThisPromptHelps(index, item)}
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

                      {explanation.data.example && (
                        <p>
                          <strong>Another Example:</strong>{" "}
                          {explanation.data.example}
                        </p>
                      )}
                      {explanation.data.originalPromptLimitation && (
                        <p>
                          <strong>
                            What could be missing in the original prompt:
                          </strong>{" "}
                          {explanation.data.originalPromptLimitation}
                        </p>
                      )}
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

export default ImageReviewRephrasePromptPanel;
