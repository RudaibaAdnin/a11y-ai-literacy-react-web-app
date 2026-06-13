import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import {
  setCurrentFocusedImagePanel,
  updateImagePrompt,
  addRephrasedPromptHistoryImage,
} from "../../ImageBiasReducer";
import * as client from "./client.js";

const createTurn = (extra = {}) => ({
  loading: "",
  loadedMessage: "",
  options: [],
  selectedSuggestions: [],
  draftPrompt: "",
  approved: false,
  ...extra,
});

const removeSuggestions = (text, suggestions) =>
  suggestions
    .reduce((result, suggestion) => result.replace(suggestion, ""), text)
    .replace(/\s+/g, " ")
    .trim();

const ImageCraftPromptRephrase = () => {
  const dispatch = useDispatch();

  const feedbackRef = useRef(null);
  const statusRef = useRef(null);
  const approvedRef = useRef(null);
  const nextFocusRef = useRef(null);

  const [turns, setTurns] = useState([]);

  const {
    imagePrompt,
    selectedImageBiasCategories,
    detectedImageDescriptionBiasParagraph,
    currentFocusedImagePanel,
  } = useSelector((state) => state.ImageBiasReducer);

  const detectedItems =
    detectedImageDescriptionBiasParagraph.imageDescriptionBiasItems;

  const latestDetectedItem = detectedItems[detectedItems.length - 1];
  const hasDetectedBias = detectedItems.length > 0;
  const originalPrompt =
    imagePrompt.originalPrompt || imagePrompt.displayedPrompt;
  const biasedOriginalParagraph = latestDetectedItem?.paragraph || "";

  useEffect(() => {
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }, []);

  useEffect(() => {
    if (hasDetectedBias && turns.length === 0) setTurns([createTurn()]);
    if (!hasDetectedBias && turns.length > 0) setTurns([]);
  }, [hasDetectedBias, turns.length]);

  useEffect(() => {
    if (nextFocusRef.current === "status") statusRef.current?.focus();
    if (nextFocusRef.current === "approved") approvedRef.current?.focus();
    nextFocusRef.current = null;
  }, [turns]);

  const closePanel = () => {
    setTurns([]);
    dispatch(setCurrentFocusedImagePanel("miaImagePanel"));
  };

  const updateTurn = (updates) => {
    setTurns((flow) => [{ ...(flow[0] || createTurn()), ...updates }]);
  };

  const getSuggestions = async () => {
    nextFocusRef.current = "status";

    setTurns((flow) => {
      const turn = flow[0] || createTurn();
      return [
        {
          ...turn,
          loading: "suggestions",
          loadedMessage: "",
          options: [],
          selectedSuggestions: [],
          draftPrompt: removeSuggestions(
            turn.draftPrompt,
            turn.selectedSuggestions,
          ),
          approved: false,
        },
      ];
    });

    try {
      const data = await client.getImageCraftPromptSuggestions({
        originalPrompt,
        biasedOriginalParagraph,
        selectedImageBiasCategories,
      });

      nextFocusRef.current = "status";
      updateTurn({
        loading: "",
        loadedMessage:
          "Loaded prompt suggestions. Select one or more, or write your own prompt.",
        options: (data.promptSuggestions || []).map((suggestion, index) => ({
          suggestion,
          category: data.promptSuggestionCategories?.[index] || "",
        })),
      });
    } catch (error) {
      console.error("Could not get image prompt suggestions:", error);
      updateTurn({
        loading: "",
        loadedMessage:
          "Prompt suggestions could not load. You can still write your own prompt.",
      });
    }
  };

  const toggleSuggestion = (suggestion) => {
    setTurns((flow) => {
      const turn = flow[0] || createTurn();
      const isSelected = turn.selectedSuggestions.includes(suggestion);

      const selectedSuggestions = isSelected
        ? turn.selectedSuggestions.filter((item) => item !== suggestion)
        : [...turn.selectedSuggestions, suggestion];

      const draftPrompt = isSelected
        ? removeSuggestions(turn.draftPrompt, [suggestion])
        : `${turn.draftPrompt} ${suggestion}`.replace(/\s+/g, " ").trim();

      return [{ ...turn, selectedSuggestions, draftPrompt, approved: false }];
    });
  };

  const approvePrompt = (turn) => {
    const rephrasedPrompt = turn.draftPrompt.trim();
    if (!rephrasedPrompt) return;

    nextFocusRef.current = "approved";

    dispatch(
      updateImagePrompt({
        rephrasedPrompt,
        isRephrased: true,
      }),
    );

    dispatch(
      addRephrasedPromptHistoryImage({
        displayedPromptImage: imagePrompt.displayedPrompt,
        promptUsedForRephraseImage:
          turn.selectedSuggestions.join(" ") || rephrasedPrompt,
        promptUsedForRephraseCategoryImage:
          turn.selectedSuggestions.length > 0
            ? "Selected prompt suggestions"
            : "My Own Prompt",
        rephrasedPromptImage: rephrasedPrompt,
      }),
    );

    updateTurn({ approved: true });
  };

  const turn = turns[0];

  return (
    <section
      className={
        currentFocusedImagePanel === "imageCraftPromptRephrasePanel"
          ? "rephrase-sidebar-wrapper current-focused-panel"
          : "rephrase-sidebar-wrapper"
      }
      role="dialog"
      aria-labelledby="image-craft-prompt-title"
      onMouseEnter={() =>
        dispatch(setCurrentFocusedImagePanel("imageCraftPromptRephrasePanel"))
      }
      onFocusCapture={() =>
        dispatch(setCurrentFocusedImagePanel("imageCraftPromptRephrasePanel"))
      }
    >
      <h2 id="image-craft-prompt-title" className="panel-title">
        Rewrite the Image Prompt
      </h2>

      <p ref={feedbackRef} tabIndex={-1} className="keyboard-instructions">
        {hasDetectedBias
          ? "You found a biased image description paragraph. Now, get prompt suggestions to rewrite the image prompt. You can also write your own prompt."
          : "Find the biased image description paragraph first. Then you can rewrite the image prompt to make it better."}
      </p>

      <div
        className="sara-followupsection-buttons"
        role="group"
        aria-label="Image prompt rewrite actions"
      >
        {hasDetectedBias && (
          <button
            type="button"
            className="page-button"
            onClick={getSuggestions}
            disabled={turn?.loading === "suggestions"}
          >
            Get Suggestions
          </button>
        )}

        <button type="button" className="page-button" onClick={closePanel}>
          Close
        </button>
      </div>

      {turn && (
        <div role="region" aria-label="Image prompt rewrite chat">
          {turn.loading === "suggestions" && (
            <p
              ref={statusRef}
              tabIndex={-1}
              className="keyboard-instructions"
              role="status"
              aria-live="polite"
            >
              Loading prompt suggestions to rewrite the image prompt...
            </p>
          )}

          {turn.loadedMessage && (
            <p
              ref={statusRef}
              tabIndex={-1}
              className="keyboard-instructions"
              role="status"
              aria-live="polite"
            >
              {turn.loadedMessage}
            </p>
          )}

          {turn.options.length > 0 && (
            <fieldset className="prompt-suggestion-fieldset">
              <legend className="prompt-suggestion-legend">
                Select prompt suggestions to use
              </legend>

              {turn.options.map((option, index) => (
                <label key={index} className="prompt-suggestion-checkbox">
                  <input
                    type="checkbox"
                    checked={turn.selectedSuggestions.includes(
                      option.suggestion,
                    )}
                    onChange={() => toggleSuggestion(option.suggestion)}
                  />

                  <span>
                    {option.category && <strong>{option.category}: </strong>}
                    {option.suggestion}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {hasDetectedBias && (
            <>
              <label
                htmlFor="image-rephrase-prompt"
                className="manual-followup-question-label"
              >
                Type or edit your rewritten image prompt:
              </label>

              <div className="manual-followup-question-pane">
                <textarea
                  id="image-rephrase-prompt"
                  className="manual-followup-question-input"
                  value={turn.draftPrompt}
                  onChange={(event) =>
                    updateTurn({
                      draftPrompt: event.target.value,
                      approved: false,
                    })
                  }
                  placeholder="Type your improved image prompt..."
                  rows={6}
                />

                <button
                  type="button"
                  className="page-button"
                  onClick={() => approvePrompt(turn)}
                  disabled={!turn.draftPrompt.trim() || turn.approved}
                >
                  {turn.approved ? "Prompt Approved" : "Approve Rephrase"}
                </button>
              </div>

              {turn.approved && (
                <p
                  ref={approvedRef}
                  tabIndex={-1}
                  className="keyboard-instructions"
                  role="status"
                  aria-live="polite"
                >
                  Prompt approved. The image prompt is now updated.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default ImageCraftPromptRephrase;
