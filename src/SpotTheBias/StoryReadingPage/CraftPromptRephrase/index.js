import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import "./index.css";

import {
  setCurrentFocusedPanel,
  setSelectedCheckingParagraph,
  addRephrasedParagraph,
  addRephrasedParagraphHistory,
} from "../../SpotTheBiasReducer";

import * as client from "./client.js";

const CraftPromptRephrasePanel = () => {
  const dispatch = useDispatch();

  const statusRef = useRef(null);
  const replyRef = useRef(null);
  const approvedRef = useRef(null);
  const nextFocusRef = useRef(null);

  const [turns, setTurns] = useState([]);
  const [manualPrompt, setManualPrompt] = useState("");
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);

  const { selectedCheckingParagraph, biasedParagraphPlan } = useSelector(
    (state) => state.SpotTheBiasReducer,
  );

  const paragraph = selectedCheckingParagraph?.originalStoryParagraph || "";
  const paragraphNumber = selectedCheckingParagraph?.index + 1;

  const biasCategory =
    biasedParagraphPlan?.find(
      (item) => item.paragraphIndex === selectedCheckingParagraph?.index,
    )?.biasCategory || null;

  useEffect(() => {
    if (nextFocusRef.current === "status") {
      statusRef.current?.focus();
    }

    if (nextFocusRef.current === "reply") {
      replyRef.current?.focus();
    }

    if (nextFocusRef.current === "approved") {
      approvedRef.current?.focus();
    }

    nextFocusRef.current = null;
  }, [turns]);

  const createTurn = (extra = {}) => ({
    loading: "",
    loadedMessage: "",
    options: [],
    selectedPrompt: "",
    selectedPromptCategory: "",
    rephrasedParagraph: "",
    approved: false,
    message: "",
    ...extra,
  });

  const closePanel = () => {
    setTurns([]);
    setManualPrompt("");
    setSelectedSuggestions([]);

    dispatch(setSelectedCheckingParagraph(null));
    dispatch(setCurrentFocusedPanel("miaPanel"));
  };

  const updateLastTurn = (updates) => {
    setTurns((flow) => {
      const copy = [...flow];

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

  const getSuggestions = async () => {
    nextFocusRef.current = "status";

    setSelectedSuggestions([]);

    setTurns((flow) => [
      ...flow.map((turn) => ({
        ...turn,
        options: [],
      })),

      createTurn({
        loading: "suggestions",
      }),
    ]);

    try {
      const data = await client.getCraftPromptSuggestions({
        paragraph,
        biasCategory,
      });

      nextFocusRef.current = "status";

      updateLastTurn({
        loading: "",

        loadedMessage: `Loaded prompt suggestions to rewrite story paragraph ${paragraphNumber}.`,

        options: (data.promptSuggestions || []).map((suggestion, index) => ({
          suggestion,
          category: data.promptSuggestionCategories?.[index] || "",
        })),
      });
    } catch (error) {
      console.error("Could not get prompt suggestions:", error);

      updateLastTurn({
        loading: "",
        message: "Sorry, prompt suggestions could not load right now.",
      });
    }
  };

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

      return;
    }

    setSelectedSuggestions((current) => [...current, option]);

    setManualPrompt((current) =>
      `${current} ${suggestion}`.replace(/\s+/g, " ").trim(),
    );
  };

  const rephraseParagraph = async () => {
    const prompt = manualPrompt.trim();

    if (!prompt) return;

    const category =
      selectedSuggestions.length > 0
        ? "Selected prompt suggestions"
        : "My Own Prompt";

    const turnIndex = turns.length;

    nextFocusRef.current = "status";

    setTurns((flow) => [
      ...flow.map((turn) => ({
        ...turn,
        options: [],
      })),

      createTurn({
        selectedPrompt: prompt,
        selectedPromptCategory: category,
        loading: "rephrase",
      }),
    ]);

    try {
      const data = await client.getRephrasedParagraph({
        paragraph,
        prompt,
        category,
      });

      const rephrasedParagraph = data.rephrasedParagraph || "";

      /*
       * Clear the editable prompt and checkbox selections
       * after the backend reply arrives.
       */
      setManualPrompt("");
      setSelectedSuggestions([]);

      nextFocusRef.current = "reply";

      setTurns((flow) =>
        flow.map((turn, index) =>
          index === turnIndex
            ? {
                ...turn,
                rephrasedParagraph,
                loading: "",
              }
            : turn,
        ),
      );
    } catch (error) {
      console.error("Could not rephrase paragraph:", error);

      setTurns((flow) =>
        flow.map((turn, index) =>
          index === turnIndex
            ? {
                ...turn,

                rephrasedParagraph:
                  "Sorry, this paragraph could not be rephrased right now.",

                loading: "",
              }
            : turn,
        ),
      );
    }
  };

  const approveRephrase = (turnIndex, rephrasedParagraph) => {
    nextFocusRef.current = "approved";

    const approvedTurn = turns[turnIndex];

    dispatch(
      addRephrasedParagraph({
        paragraphIndex: selectedCheckingParagraph.index,

        rephrasedStoryParagraph: rephrasedParagraph,
      }),
    );

    dispatch(
      addRephrasedParagraphHistory({
        promptUsedForRephrase: approvedTurn.selectedPrompt,

        promptUsedForRephraseCategory: approvedTurn.selectedPromptCategory,

        rephrasedParagraph,
      }),
    );

    setTurns((flow) =>
      flow.map((turn, index) =>
        index === turnIndex
          ? {
              ...turn,
              approved: true,
            }
          : turn,
      ),
    );
  };

  if (!paragraph) return null;

  return (
    <div>
      <p className="keyboard-instructions" tabIndex={0}>
        Get prompt suggestions to rewrite story paragraph {paragraphNumber}.
        Select one or more suggestions below. You can also type or edit your own
        prompt.
      </p>

      <div
        className="sara-followupsection-buttons"
        role="group"
        aria-label="Craft prompt options"
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

      <div role="region" aria-label="Craft prompt to rewrite paragraph chat">
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
                Loading prompt suggestions to rewrite story paragraph{" "}
                {paragraphNumber}...
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
                  aria-label="Prompt suggestions"
                >
                  {turn.options.map((option, index) => {
                    const optionId = `craft-prompt-option-${turnIndex}-${index}`;

                    const checked = selectedSuggestions.some(
                      (item) => item.suggestion === option.suggestion,
                    );

                    return (
                      <li key={index} className="bias-checkbox-list-item">
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
                                      "purple-parallelogram",
                                      "green-parallelogram",
                                      "blue-parallelogram",
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

            {turn.selectedPrompt && (
              <p className="followup-question-text">{turn.selectedPrompt}</p>
            )}

            {turn.loading === "rephrase" && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className="keyboard-instructions"
                role="status"
                aria-live="polite"
              >
                Rephrasing paragraph {paragraphNumber}...
              </p>
            )}

            {turn.rephrasedParagraph && (
              <>
                <p
                  ref={replyRef}
                  tabIndex={-1}
                  className="followup-question-reply craft-prompt-response"
                  role="status"
                  aria-live="polite"
                >
                  {turn.rephrasedParagraph}
                </p>

                <div
                  className="sara-followupsection-buttons"
                  role="group"
                  aria-label="Next craft prompt options"
                >
                  {!turn.approved ? (
                    <button
                      type="button"
                      className="page-button"
                      onClick={() =>
                        approveRephrase(turnIndex, turn.rephrasedParagraph)
                      }
                      aria-label="Approve Rephrase"
                    >
                      Approve Rephrase
                    </button>
                  ) : (
                    <p
                      ref={approvedRef}
                      tabIndex={-1}
                      className="keyboard-instructions"
                      role="status"
                      aria-live="polite"
                    >
                      Rephrase approved.
                    </p>
                  )}

                  <button
                    type="button"
                    className="page-button"
                    onClick={getSuggestions}
                    aria-label="Regenerate Prompt Suggestions"
                  >
                    Regenerate Prompt Suggestions
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <label
          htmlFor="manual-rephrase-prompt"
          className="manual-followup-question-label"
          tabIndex={0}
        >
          Type or edit your prompt to rewrite the paragraph:
        </label>

        <div className="manual-followup-question-pane">
          <textarea
            id="manual-rephrase-prompt"
            className="manual-followup-question-input"
            value={manualPrompt}
            onChange={(event) => setManualPrompt(event.target.value)}
            placeholder="Select suggestions above or type your own prompt..."
            rows={5}
          />

          <button
            type="button"
            className="page-button"
            onClick={rephraseParagraph}
            disabled={!manualPrompt.trim()}
            aria-label="Rephrase"
          >
            Rephrase
          </button>
        </div>
      </div>
    </div>
  );
};

export default CraftPromptRephrasePanel;
