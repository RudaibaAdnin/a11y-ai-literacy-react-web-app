import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import "./index.css";

import {
  setCurrentFocusedImagePanel,
  updateImagePrompt,
  addRephrasedPromptHistoryImage,
} from "../../ImageBiasReducer";

import * as client from "./client.js";

const ImageCraftPromptRephrase = ({ onClose }) => {
  const dispatch = useDispatch();

  const feedbackRef = useRef(null);
  const statusRef = useRef(null);
  const approvedRef = useRef(null);
  const nextFocusRef = useRef(null);

  const [turns, setTurns] = useState([]);
  const [manualPrompt, setManualPrompt] = useState("");
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [approved, setApproved] = useState(false);

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
    if (!hasDetectedBias) {
      setTurns([]);
      setManualPrompt("");
      setSelectedSuggestions([]);
      setApproved(false);
    }
  }, [hasDetectedBias]);

  useEffect(() => {
    if (nextFocusRef.current === "status") {
      statusRef.current?.focus();
    }

    if (nextFocusRef.current === "approved") {
      approvedRef.current?.focus();
    }

    nextFocusRef.current = null;
  }, [turns, approved]);

  const createTurn = (extra = {}) => ({
    loading: "",
    loadedMessage: "",
    options: [],
    message: "",
    ...extra,
  });

  const closePanel = () => {
    setTurns([]);
    setManualPrompt("");
    setSelectedSuggestions([]);
    setApproved(false);

    if (onClose) {
      onClose();
      return;
    }

    dispatch(setCurrentFocusedImagePanel("miaImagePanel"));
  };

  const updateLastTurn = (updates) => {
    setTurns((flow) => {
      const copy = [...flow];

      if (copy.length === 0) {
        return [createTurn(updates)];
      }

      copy[copy.length - 1] = {
        ...copy[copy.length - 1],
        ...updates,
      };

      return copy;
    });
  };

  const removeSuggestionFromPrompt = (text, suggestion) => {
    return text.replace(suggestion, "").replace(/\s+/g, " ").trim();
  };

  /*
   * Backend call only for getting prompt suggestions.
   */
  const getSuggestions = async () => {
    nextFocusRef.current = "status";

    /*
     * Remove previously selected suggestion text
     * from the textbox before loading fresh suggestions.
     *
     * Anything manually typed by the user stays.
     */
    setManualPrompt((current) => {
      let updated = current;

      selectedSuggestions.forEach((item) => {
        updated = removeSuggestionFromPrompt(updated, item.suggestion);
      });

      return updated;
    });

    setSelectedSuggestions([]);
    setApproved(false);

    /*
     * Clear:
     * - old suggestion checkboxes
     * - old "Loaded prompt suggestions..." text
     *
     * Then create a fresh loading turn.
     */
    setTurns((flow) => [
      ...flow.map((turn) => ({
        ...turn,
        options: [],
        loadedMessage: "",
      })),

      createTurn({
        loading: "suggestions",
      }),
    ]);

    try {
      const data = await client.getImageCraftPromptSuggestions({
        originalPrompt,
        biasedOriginalParagraph,
        selectedImageBiasCategories,
      });

      nextFocusRef.current = "status";

      updateLastTurn({
        loading: "",

        loadedMessage: "Loaded prompt suggestions to rewrite the image prompt.",

        options: (data.promptSuggestions || []).map((suggestion, index) => ({
          suggestion,

          category: data.promptSuggestionCategories?.[index] || "",
        })),
      });
    } catch (error) {
      console.error("Could not get image prompt suggestions:", error);

      updateLastTurn({
        loading: "",

        loadedMessage: "",

        message:
          "Sorry, prompt suggestions could not load right now. You can still type your own prompt.",
      });
    }
  };

  /*
   * Selecting a suggestion adds it to the textbox.
   * Unselecting removes it.
   */
  const toggleSuggestion = (option) => {
    const suggestion = option.suggestion;

    const alreadySelected = selectedSuggestions.some(
      (item) => item.suggestion === suggestion,
    );

    if (alreadySelected) {
      setSelectedSuggestions((current) =>
        current.filter((item) => item.suggestion !== suggestion),
      );

      setManualPrompt((current) =>
        removeSuggestionFromPrompt(current, suggestion),
      );

      setApproved(false);

      return;
    }

    setSelectedSuggestions((current) => [...current, option]);

    setManualPrompt((current) =>
      `${current} ${suggestion}`.replace(/\s+/g, " ").trim(),
    );

    setApproved(false);
  };

  /*
   * No backend call for rephrasing.
   *
   * Whatever is in the textbox becomes
   * the new image prompt.
   */
  const approvePrompt = () => {
    const rephrasedPrompt = manualPrompt.trim();

    if (!rephrasedPrompt) return;

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
          selectedSuggestions.length > 0
            ? selectedSuggestions.map((item) => item.suggestion).join(" ")
            : rephrasedPrompt,

        promptUsedForRephraseCategoryImage:
          selectedSuggestions.length > 0
            ? "Selected prompt suggestions"
            : "My Own Prompt",

        rephrasedPromptImage: rephrasedPrompt,
      }),
    );

    /*
     * After approval:
     * - clear textbox
     * - clear checkbox selections
     * - hide suggestion options
     * - hide "Loaded prompt suggestions..." text
     */
    setManualPrompt("");
    setSelectedSuggestions([]);

    setTurns((flow) =>
      flow.map((turn) => ({
        ...turn,
        options: [],
        loadedMessage: "",
      })),
    );

    nextFocusRef.current = "approved";

    setApproved(true);
  };

  const handlePromptPanelKeyDown = (event) => {
    const activeElement = document.activeElement;

    const isTyping =
      activeElement?.tagName === "TEXTAREA" ||
      (activeElement?.tagName === "INPUT" &&
        !["checkbox", "radio", "button"].includes(activeElement.type)) ||
      activeElement?.tagName === "SELECT" ||
      activeElement?.isContentEditable;

    if (isTyping) return;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      closePanel();

      return;
    }

    if (
      event.key === "[" ||
      event.key === "]" ||
      event.key === "?" ||
      event.key === "/"
    ) {
      event.preventDefault();
      event.stopPropagation();

      closePanel();
    }
  };

  return (
    <section
      className={
        currentFocusedImagePanel === "imageCraftPromptRephrasePanel"
          ? "rephrase-sidebar-wrapper current-focused-panel"
          : "rephrase-sidebar-wrapper"
      }
      role="dialog"
      aria-modal="false"
      aria-labelledby="image-craft-prompt-title"
      onMouseEnter={() =>
        dispatch(setCurrentFocusedImagePanel("imageCraftPromptRephrasePanel"))
      }
      onFocusCapture={() =>
        dispatch(setCurrentFocusedImagePanel("imageCraftPromptRephrasePanel"))
      }
      onKeyDown={handlePromptPanelKeyDown}
    >
      <h2 id="image-craft-prompt-title" className="panel-title" tabIndex={0}>
        Rewrite the Image Prompt
      </h2>

      <p ref={feedbackRef} tabIndex={-1} className="keyboard-instructions">
        {hasDetectedBias
          ? "You found a biased image description paragraph. Get prompt suggestions to rewrite the image prompt. Select one or more suggestions below. You can also type or edit your own prompt."
          : "Find the biased image description paragraph first. Then you can rewrite the image prompt to make it better."}
      </p>

      {hasDetectedBias && (
        <div
          className="sara-followupsection-buttons"
          role="group"
          aria-label="Image prompt rewrite actions"
        >
          <button
            type="button"
            className="page-button"
            aria-label="Get Prompt Suggestions"
            onClick={getSuggestions}
          >
            Get Prompt Suggestions
          </button>
        </div>
      )}

      <div role="region" aria-label="Craft prompt to rewrite image prompt">
        {turns.map((turn, turnIndex) => (
          <div key={turnIndex} className="sara-chat-history-item">
            {turn.message && <p className="clue-text">{turn.message}</p>}

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
              <fieldset className="craft-prompt-suggestion-fieldset">
                <legend className="craft-prompt-suggestion-legend">
                  Select prompt suggestions to use
                </legend>

                <ul
                  className="bias-checkbox-list"
                  aria-label="Image prompt suggestions"
                >
                  {turn.options.map((option, index) => {
                    const optionId = `image-craft-prompt-option-${turnIndex}-${index}`;

                    const checked = selectedSuggestions.some(
                      (item) => item.suggestion === option.suggestion,
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
                            onChange={() => toggleSuggestion(option)}
                          />

                          <span className="bias-checkbox-text">
                            {option.category && (
                              <strong>
                                {" "}
                                <span
                                  className={
                                    [
                                      "blue-parallelogram",
                                      "green-parallelogram",
                                      "purple-parallelogram",
                                    ][index % 3]
                                  }
                                >
                                  {option.category}:
                                </span>{" "}
                              </strong>
                            )}

                            {option.suggestion}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}
          </div>
        ))}

        {hasDetectedBias && (
          <>
            <label
              htmlFor="image-rephrase-prompt"
              className="manual-followup-question-label"
              tabIndex={0}
            >
              Type or edit your prompt to rewrite the image prompt:
            </label>

            <div className="manual-followup-question-pane">
              <textarea
                id="image-rephrase-prompt"
                className="manual-followup-question-input"
                value={manualPrompt}
                onChange={(event) => {
                  setManualPrompt(event.target.value);

                  setApproved(false);
                }}
                placeholder="Select suggestions above or type your own prompt..."
                rows={5}
                aria-label="Type or edit your image prompt"
              />

              <button
                type="button"
                className="page-button"
                onClick={approvePrompt}
                disabled={!manualPrompt.trim()}
                aria-label="Approve Rephrase"
              >
                Approve Rephrase
              </button>
            </div>
          </>
        )}

        {approved && (
          <p
            ref={approvedRef}
            tabIndex={-1}
            className="keyboard-instructions"
            role="status"
            aria-live="polite"
          >
            Rephrase approved. The image prompt is now updated.
          </p>
        )}

        {hasDetectedBias && turns.length > 0 && (
          <div
            className="sara-followupsection-buttons"
            role="group"
            aria-label="Next image prompt options"
          >
            <button
              type="button"
              className="page-button"
              onClick={getSuggestions}
              aria-label="Regenerate Prompt Suggestions"
            >
              Regenerate Prompt Suggestions
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        className="page-button"
        onClick={closePanel}
        aria-label="Close image prompt rewrite panel"
      >
        Close
      </button>
    </section>
  );
};

export default ImageCraftPromptRephrase;
