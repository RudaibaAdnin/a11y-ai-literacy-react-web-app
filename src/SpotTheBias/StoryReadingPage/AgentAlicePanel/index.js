import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import {
  setCurrentFocusedPanel,
  addFollowUpsHistoryAlice,
  setSelectedCheckingParagraph,
} from "../../SpotTheBiasReducer";
import * as client from "./client.js";

const AgentAlicePanel = () => {
  const dispatch = useDispatch();

  const panelRef = useRef(null);
  const statusRef = useRef(null);
  const replyRef = useRef(null);
  const nextFocusRef = useRef(null);

  const [chatFlow, setChatFlow] = useState([]);
  const [manualQuestion, setManualQuestion] = useState("");

  const {
    storyParagraphs,
    biasedParagraphPlan,
    detectedStoryBias,
    currentFocusedPanel,
  } = useSelector((state) => state.SpotTheBiasReducer);

  useEffect(() => {
    const jumpToAlice = (event) => {
      const tagName = event.target.tagName;
      const isTyping =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        event.target.isContentEditable;

      const isEqualKey =
        event.key === "=" || event.key === "+" || event.code === "Equal";

      if (!isEqualKey || isTyping) return;

      event.preventDefault();
      dispatch(setSelectedCheckingParagraph(null));
      dispatch(setCurrentFocusedPanel("alicePanel"));

      requestAnimationFrame(() => panelRef.current?.focus());
    };

    window.addEventListener("keydown", jumpToAlice, true);
    return () => window.removeEventListener("keydown", jumpToAlice, true);
  }, [dispatch]);

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
    selectedQuestionCategory: "",
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

    const remainingTargets = biasedParagraphPlan
      .map((item) => ({
        paragraphIndex: item.paragraphIndex,
        paragraph:
          storyParagraphs[item.paragraphIndex]?.originalStoryParagraph || "",
        biasCategory: item.biasCategory,
      }))
      .filter(
        (item) =>
          !detectedIndices.includes(item.paragraphIndex) &&
          item.paragraph &&
          item.biasCategory,
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
    const newTurn = createTurn({
      paragraphIndex: target.paragraphIndex,
      paragraph: target.paragraph,
      biasCategory: target.biasCategory,
      clue,
      type,
      loading: "questions",
    });

    setChatFlow((flow) => (append ? [...flow, newTurn] : [newTurn]));

    try {
      const data = await client.getBiasFollowupQuestions({ ...target, clue });

      if (focusAfterLoad) nextFocusRef.current = "status";

      updateLastTurn({
        loading: "",
        loadedMessage,
        options: (data.followUpQuestions || []).map((question, index) => ({
          question,
          category: data.followUpQuestionCategories?.[index] || "",
        })),
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
      nextFocusRef.current = "status";
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

      await loadQuestions({
        target,
        clue: clueData.clue || "",
        type: "clueQuestions",
        append: false,
        loadedMessage:
          "Loaded clue and suggested follow-up questions are below.",
      });
    } catch (error) {
      console.error("Could not get Alice clue:", error);
      setChatFlow([
        createTurn({ message: "Sorry, Alice could not get a clue right now." }),
      ]);
    }
  };

  const saveAliceHistory = (question, category, reply) => {
    dispatch(
      addFollowUpsHistoryAlice({
        followUpQuestion: question,
        followUpQuestionCategory: category,
        followUpReply: reply,
      }),
    );
  };

  const askQuestion = async (turnIndex, option) => {
    const turn = chatFlow[turnIndex];
    const question = option.question;
    const category = option.category;

    nextFocusRef.current = "status";

    setChatFlow((flow) =>
      flow.map((item, index) =>
        index === turnIndex
          ? {
              ...item,
              selectedQuestion: question,
              selectedQuestionCategory: category,
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

      const reply = data.followUpReply || "";
      saveAliceHistory(question, category, reply);
      nextFocusRef.current = "reply";

      setChatFlow((flow) =>
        flow.map((item, index) =>
          index === turnIndex ? { ...item, reply, loading: "" } : item,
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
    setManualQuestion("");

    setChatFlow((flow) => [
      ...flow,
      createTurn({
        paragraphIndex: lastTurn.paragraphIndex,
        paragraph: lastTurn.paragraph,
        biasCategory: lastTurn.biasCategory,
        clue: lastTurn.clue,
        selectedQuestion: question,
        selectedQuestionCategory: "My own question",
        loading: "reply",
      }),
    ]);

    try {
      const data = await client.getBiasFollowupReply({
        paragraph: lastTurn.paragraph,
        biasCategory: lastTurn.biasCategory,
        clue: lastTurn.clue,
        followUpQuestion: question,
      });

      const reply = data.followUpReply || "";
      saveAliceHistory(question, "My own question", reply);
      nextFocusRef.current = "reply";

      setChatFlow((flow) =>
        flow.map((item, index) =>
          index === newTurnIndex ? { ...item, reply, loading: "" } : item,
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
      ref={panelRef}
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
        Select the button below to ask Alice for clues about sneaky biased
        paragraphs. You can also ask Alice follow-up questions. Press the equal
        key{" "}
        <span className="kbd" aria-hidden="true">
          =
        </span>{" "}
        to jump to this panel.
      </p>

      <div
        className="sara-followupsection-buttons"
        role="group"
        aria-label="Alice chat actions"
      >
        <button type="button" className="page-button" onClick={getClues}>
          Get Clues
        </button>

        <button type="button" className="page-button" onClick={clearChat}>
          Close Chat
        </button>
      </div>

      <div role="region" aria-label="Alice clue chat messages">
        {chatFlow.map((turn, turnIndex) => (
          <div key={turnIndex} className="sara-chat-history-item">
            {turn.message && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className="clue-text"
                role="status"
                aria-live="polite"
              >
                {turn.message}
              </p>
            )}

            {turn.loading === "clue" && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className="keyboard-instructions"
                role="status"
                aria-live="polite"
              >
                Loading clue and follow-up question suggestions from Alice...
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

            {turn.type === "clueQuestions" && turn.clue && (
              <p className="clue-text">Clue: {turn.clue}</p>
            )}

            {turn.loading === "questions" && (
              <p className="keyboard-instructions">
                Loading follow-up question suggestions from Alice...
              </p>
            )}

            {turn.options.length > 0 && (
              <ol
                className="sara-generated-question-list"
                aria-label="Alice follow-up questions"
              >
                {turn.options.map((option, index) => (
                  <li key={index} className="sara-generated-question">
                    <button
                      type="button"
                      className="followup-question-button"
                      onClick={() => askQuestion(turnIndex, option)}
                    >
                      <strong>{option.category}:</strong> {option.question}
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {turn.selectedQuestion && (
              <p className="followup-question-text">
                {" "}
                <strong>{turn.selectedQuestionCategory}:</strong>{" "}
                {turn.selectedQuestion}
              </p>
            )}

            {turn.loading === "reply" && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className="keyboard-instructions"
                role="status"
                aria-live="polite"
              >
                Loading reply from Alice...
              </p>
            )}

            {turn.reply && (
              <p
                ref={replyRef}
                tabIndex={-1}
                className="followup-question-reply"
                role="status"
                aria-live="polite"
              >
                {turn.reply}
              </p>
            )}
          </div>
        ))}

        {canAskManualQuestion && (
          <>
            <label
              htmlFor="manual-alice-question"
              className="manual-followup-question-label"
            >
              Type your own follow-up question for Alice:
            </label>
            <div className="manual-followup-question-pane">
              <textarea
                id="manual-alice-question"
                className="manual-followup-question-input"
                value={manualQuestion}
                onChange={(event) => setManualQuestion(event.target.value)}
                placeholder="Type your own question for Alice..."
                rows={3}
              />

              <button
                type="button"
                className="page-button"
                onClick={askManualQuestion}
                disabled={!manualQuestion.trim()}
              >
                Ask Alice
              </button>
            </div>
            <button type="button" className="page-button" onClick={clearChat}>
              Close Chat
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default AgentAlicePanel;
