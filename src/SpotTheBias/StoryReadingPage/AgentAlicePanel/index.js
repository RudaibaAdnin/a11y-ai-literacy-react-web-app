import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../../SpotTheBiasReducer";
import * as client from "./client.js";

const AgentAlicePanel = () => {
  const dispatch = useDispatch();
  const statusRef = useRef(null);
  const replyRef = useRef(null);
  const nextFocusRef = useRef(null);

  const [chatFlow, setChatFlow] = useState([]);
  const [manualQuestion, setManualQuestion] = useState("");

  const {
    storyParagraphs,
    selectedBiasCategories,
    biasedParagraphIndices,
    detectedStoryBias,
    currentFocusedPanel,
  } = useSelector((state) => state.SpotTheBiasReducer);

  useEffect(() => {
    if (nextFocusRef.current === "status") statusRef.current?.focus();
    if (nextFocusRef.current === "reply") replyRef.current?.focus();
    nextFocusRef.current = null;
  }, [chatFlow]);

  const createTurn = (extra = {}) => ({
    type: "",
    paragraph: "",
    biasCategory: null,
    clue: "",
    options: [],
    selectedQuestion: "",
    reply: "",
    loading: "",
    message: "",
    loadedMessage: "",
    ...extra,
  });

  const focusPanel = () => {
    dispatch(setCurrentFocusedPanel("alicePanel"));
  };

  const clearChat = () => {
    setChatFlow([]);
    setManualQuestion("");
    nextFocusRef.current = null;
  };

  const getTarget = () => {
    const detectedIndices = detectedStoryBias.storyBiasItems.map(
      (item) => item.paragraphIndex,
    );

    const remainingTargets = biasedParagraphIndices
      .map((paragraphIndex, biasIndex) => ({
        paragraphIndex,
        paragraph: storyParagraphs[paragraphIndex],
        biasCategory: selectedBiasCategories[biasIndex],
      }))
      .filter(
        (target) =>
          !detectedIndices.includes(target.paragraphIndex) &&
          target.paragraph &&
          target.biasCategory,
      );

    if (remainingTargets.length === 0) return null;

    return remainingTargets[
      Math.floor(Math.random() * remainingTargets.length)
    ];
  };

  const updateLastTurn = (updates) => {
    setChatFlow((flow) => {
      const copy = [...flow];
      copy[copy.length - 1] = { ...copy[copy.length - 1], ...updates };
      return copy;
    });
  };

  const loadQuestions = async ({
    target,
    clue,
    type = "questions",
    loadedMessage,
    append = true,
    focusAfterLoad = true,
  }) => {
    const turn = createTurn({ ...target, clue, type, loading: "questions" });
    setChatFlow((flow) => (append ? [...flow, turn] : [turn]));

    try {
      const data = await client.getBiasFollowupQuestions({ ...target, clue });
      if (focusAfterLoad) nextFocusRef.current = "status";

      updateLastTurn({
        loading: "",
        loadedMessage,
        options: data.followUpQuestions || [],
      });
    } catch (error) {
      console.error("Could not get Alice questions:", error);
      updateLastTurn({
        loading: "",
        message: "Sorry, Alice could not load suggested questions right now.",
      });
    }
  };

  const getClues = async () => {
    clearChat();

    const target = getTarget();

    if (!target) {
      setChatFlow([
        createTurn({
          message: "Great job! You already found all the biased paragraphs.",
        }),
      ]);
      return;
    }

    nextFocusRef.current = "status";
    setChatFlow([createTurn({ ...target, loading: "clue" })]);

    try {
      const clueData = await client.getBiasClue(target);
      const clue = clueData.clue || "";

      await loadQuestions({
        target,
        clue,
        type: "clueQuestions",
        append: false,
        loadedMessage: "Loaded clue and suggested questions are below.",
      });
    } catch (error) {
      console.error("Could not get Alice clue:", error);
      setChatFlow([
        createTurn({ message: "Sorry, Alice could not get a clue right now." }),
      ]);
    }
  };

  const askQuestion = async (turnIndex, question) => {
    const turn = chatFlow[turnIndex];

    nextFocusRef.current = "status";

    setChatFlow((flow) =>
      flow.map((item, index) =>
        index === turnIndex
          ? {
              ...item,
              selectedQuestion: question,
              options: [],
              loading: "reply",
            }
          : item,
      ),
    );

    try {
      const data = await client.getBiasFollowupReply({
        paragraph: turn.paragraph,
        biasCategory: turn.biasCategory,
        clue: turn.clue,
        followUpQuestion: question,
      });

      nextFocusRef.current = "reply";

      setChatFlow((flow) =>
        flow.map((item, index) =>
          index === turnIndex
            ? { ...item, reply: data.followUpReply || "", loading: "" }
            : item,
        ),
      );

      await loadQuestions({
        target: turn,
        clue: turn.clue,
        loadedMessage: "Loaded suggested follow-up questions are below.",
        focusAfterLoad: false,
      });
    } catch (error) {
      console.error("Could not get Alice reply:", error);

      setChatFlow((flow) =>
        flow.map((item, index) =>
          index === turnIndex
            ? {
                ...item,
                reply: "Sorry, Alice could not answer right now.",
                loading: "",
              }
            : item,
        ),
      );
    }
  };

  const askManualQuestion = async () => {
    const question = manualQuestion.trim();
    const lastTurn = [...chatFlow].reverse().find((turn) => turn.clue);

    if (!question || !lastTurn) return;

    const newTurnIndex = chatFlow.length;
    nextFocusRef.current = "status";

    setChatFlow((flow) => [
      ...flow,
      createTurn({
        ...lastTurn,
        options: [],
        selectedQuestion: question,
        loading: "reply",
      }),
    ]);

    setManualQuestion("");

    try {
      const data = await client.getBiasFollowupReply({
        paragraph: lastTurn.paragraph,
        biasCategory: lastTurn.biasCategory,
        clue: lastTurn.clue,
        followUpQuestion: question,
      });

      nextFocusRef.current = "reply";

      setChatFlow((flow) =>
        flow.map((item, index) =>
          index === newTurnIndex
            ? { ...item, reply: data.followUpReply || "", loading: "" }
            : item,
        ),
      );

      await loadQuestions({
        target: lastTurn,
        clue: lastTurn.clue,
        loadedMessage: "Loaded suggested follow-up questions are below.",
        focusAfterLoad: false,
      });
    } catch (error) {
      console.error("Could not get Alice reply:", error);

      setChatFlow((flow) =>
        flow.map((item, index) =>
          index === newTurnIndex
            ? {
                ...item,
                reply: "Sorry, Alice could not answer right now.",
                loading: "",
              }
            : item,
        ),
      );
    }
  };

  const canAskManualQuestion = chatFlow.some((turn) => turn.clue);

  return (
    <section
      tabIndex={-1}
      className={
        currentFocusedPanel === "alicePanel"
          ? "alice-panel current-focused-panel"
          : "alice-panel"
      }
      aria-labelledby="alice-panel-title"
      onMouseEnter={focusPanel}
      onFocusCapture={focusPanel}
    >
      <h2 id="alice-panel-title" className="panel-title" tabIndex={0}>
        Ask Alice for Clues
      </h2>

      <p className="keyboard-instructions">
        Alice can give clues about one biased paragraph you have not found yet.
      </p>

      <div
        className="sara-followupsection-buttons"
        role="group"
        aria-label="Alice clue options"
      >
        <button type="button" className="page-button" onClick={getClues}>
          Get Clues
        </button>

        <button type="button" className="page-button" onClick={clearChat}>
          Close Chat
        </button>
      </div>

      <div role="region" aria-live="polite" aria-label="Alice clue chat">
        {chatFlow.map((turn, turnIndex) => (
          <div key={turnIndex} className="sara-chat-history-item">
            {turn.message && <p className="clue-text">{turn.message}</p>}

            {turn.loading === "clue" && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className="keyboard-instructions"
                role="status"
              >
                Loading clue from Alice...
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

            {turn.type === "clueQuestions" && turn.clue && (
              <p className="clue-text">Clue: {turn.clue}</p>
            )}

            {turn.loading === "questions" && (
              <p className="keyboard-instructions" role="status">
                Loading follow-up questions from Alice...
              </p>
            )}

            {turn.options.length > 0 && (
              <ol
                className="sara-generated-question-list"
                aria-label="Alice follow-up questions"
              >
                {turn.options.map((question, index) => (
                  <li key={index} className="sara-generated-question">
                    <button
                      type="button"
                      className="followup-question-button"
                      onClick={() => askQuestion(turnIndex, question)}
                    >
                      {question}
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {turn.selectedQuestion && (
              <p className="followup-question-text">{turn.selectedQuestion}</p>
            )}

            {turn.loading === "reply" && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className="keyboard-instructions"
                role="status"
              >
                Loading reply from Alice...
              </p>
            )}

            {turn.reply && (
              <p
                ref={replyRef}
                tabIndex={-1}
                className="followup-question-reply"
              >
                {turn.reply}
              </p>
            )}
          </div>
        ))}

        {canAskManualQuestion && (
          <div className="manual-followup-question-pane">
            <textarea
              className="manual-followup-question-input"
              value={manualQuestion}
              onChange={(event) => setManualQuestion(event.target.value)}
              aria-label="Type your own follow-up question for Alice"
              placeholder="Type your own question for Alice..."
            />

            <button
              type="button"
              className="page-button"
              onClick={askManualQuestion}
            >
              Ask Alice
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AgentAlicePanel;
