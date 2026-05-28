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

  const { selectedCheckingParagraph } = useSelector(
    (state) => state.SpotTheBiasReducer,
  );

  const paragraph = selectedCheckingParagraph.originalStoryParagraph;

  useEffect(() => {
    if (nextFocusRef.current === "status") statusRef.current?.focus();
    if (nextFocusRef.current === "reply") replyRef.current?.focus();
    if (nextFocusRef.current === "approved") approvedRef.current?.focus();
    nextFocusRef.current = null;
  }, [turns]);

  const createTurn = (extra = {}) => ({
    loading: "",
    loadedMessage: "",
    options: [],
    selectedPrompt: "",
    rephrasedParagraph: "",
    approved: false,
    message: "",
    ...extra,
  });

  const closePanel = () => {
    setTurns([]);
    setManualPrompt("");
    dispatch(setSelectedCheckingParagraph(null));
    dispatch(setCurrentFocusedPanel("miaPanel"));
  };

  const updateLastTurn = (updates) => {
    setTurns((flow) => {
      const copy = [...flow];
      copy[copy.length - 1] = { ...copy[copy.length - 1], ...updates };
      return copy;
    });
  };

  const getSuggestions = async () => {
    nextFocusRef.current = "status";

    setTurns((flow) => [
      ...flow.map((turn) => ({ ...turn, options: [] })),
      createTurn({ loading: "suggestions" }),
    ]);

    try {
      const data = await client.getCraftPromptSuggestions({ paragraph });

      nextFocusRef.current = "status";
      updateLastTurn({
        loading: "",
        loadedMessage: "Loaded prompt suggestions are below.",
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

  const rephraseParagraph = async (promptOption) => {
    const prompt =
      typeof promptOption === "string" ? promptOption : promptOption.suggestion;

    if (!prompt) return;

    const turnIndex = turns.length;
    nextFocusRef.current = "status";
    setManualPrompt("");

    setTurns((flow) => [
      ...flow.map((turn) => ({ ...turn, options: [] })),
      createTurn({ selectedPrompt: prompt, loading: "rephrase" }),
    ]);

    try {
      const data = await client.getRephrasedParagraph({ paragraph, prompt });
      const rephrasedParagraph = data.rephrasedParagraph || "";

      dispatch(
        addRephrasedParagraphHistory({
          promptUsedForRephrase: prompt,
          rephrasedParagraph,
        }),
      );

      nextFocusRef.current = "reply";
      setTurns((flow) =>
        flow.map((turn, index) =>
          index === turnIndex
            ? { ...turn, rephrasedParagraph, loading: "" }
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

    dispatch(
      addRephrasedParagraph({
        paragraphIndex: selectedCheckingParagraph.index,
        rephrasedStoryParagraph: rephrasedParagraph,
      }),
    );

    setTurns((flow) =>
      flow.map((turn, index) =>
        index === turnIndex ? { ...turn, approved: true } : turn,
      ),
    );
  };

  if (!paragraph) return null;

  return (
    <div>
      <p className="keyboard-instructions">
        Get prompt ideas, then choose one to rephrase this paragraph.
      </p>

      <div
        className="sara-followupsection-buttons"
        role="group"
        aria-label="Craft prompt options"
      >
        <button type="button" className="page-button" onClick={getSuggestions}>
          Get Prompt Suggestions
        </button>

        <button type="button" className="page-button" onClick={closePanel}>
          Close
        </button>
      </div>

      <div role="region" aria-live="polite" aria-label="Craft prompt chat">
        {turns.map((turn, turnIndex) => (
          <div key={turnIndex} className="sara-chat-history-item">
            {turn.message && <p className="clue-text">{turn.message}</p>}

            {turn.loading === "suggestions" && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className="keyboard-instructions"
                role="status"
              >
                Loading prompt suggestions...
              </p>
            )}

            {turn.loadedMessage && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className="keyboard-instructions"
              >
                {turn.loadedMessage}
              </p>
            )}

            {turn.options.length > 0 && (
              <ol
                className="sara-generated-question-list"
                aria-label="Prompt suggestions"
              >
                {turn.options.map((option, index) => (
                  <li key={index} className="sara-generated-question">
                    <button
                      type="button"
                      className="followup-question-button"
                      onClick={() => rephraseParagraph(option)}
                    >
                      <strong>{option.category}: </strong>
                      {option.suggestion}
                    </button>
                  </li>
                ))}
              </ol>
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
              >
                Rephrasing paragraph...
              </p>
            )}

            {turn.rephrasedParagraph && (
              <>
                <p
                  ref={replyRef}
                  tabIndex={-1}
                  className="followup-question-reply"
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
                    >
                      Approve Rephrase
                    </button>
                  ) : (
                    <p
                      ref={approvedRef}
                      tabIndex={-1}
                      className="keyboard-instructions"
                      role="status"
                    >
                      Rephrase approved.
                    </p>
                  )}

                  <button
                    type="button"
                    className="page-button"
                    onClick={getSuggestions}
                  >
                    Get Prompt Suggestions
                  </button>

                  <button
                    type="button"
                    className="page-button"
                    onClick={closePanel}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="manual-followup-question-pane">
          <textarea
            className="manual-followup-question-input"
            value={manualPrompt}
            onChange={(event) => setManualPrompt(event.target.value)}
            aria-label="Type your own prompt to rephrase the paragraph"
            placeholder="Type your own rephrase prompt..."
          />

          <button
            type="button"
            className="page-button"
            onClick={() => rephraseParagraph(manualPrompt.trim())}
          >
            Rephrase
          </button>
        </div>
      </div>
    </div>
  );
};

export default CraftPromptRephrasePanel;
