import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { imageDescriptions } from "../../util/imageDescriptions.js";
import {
  setCurrentFocusedPanel,
  addFollowUpsHistorySara,
} from "../../SpotTheLieReducer";
import * as client from "./client.js";

const AgentSaraPanel = () => {
  const { imagename } = useParams();
  const dispatch = useDispatch();

  const selectedImageDescription = imageDescriptions[imagename] || [];

  const selectedImageHallucinations = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageHallucinations,
  );

  const detectedImageHallucination = useSelector(
    (state) => state.SpotTheLieReducer.detectedImageHallucination,
  );

  const currentImageDescriptionLineIndex = useSelector(
    (state) => state.SpotTheLieReducer.currentImageDescriptionLineIndex,
  );

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  const currentImageDescriptionLine =
    selectedImageDescription[currentImageDescriptionLineIndex] || "";

  const [chatFlow, setChatFlow] = useState([]);
  const [manualFollowUpQuestion, setManualFollowUpQuestion] = useState("");

  const firstFollowUpQuestionButtonRef = useRef(null);
  const latestReplyRef = useRef(null);
  const messageRef = useRef(null);
  const clueTextRef = useRef(null);
  const replyTurnIndexRef = useRef(null);
  const nextFocusRef = useRef(null);
  const followUpQuestionModeRef = useRef("entireDescription");
  const clueRef = useRef("");
  const clueHallucinationLineRef = useRef("");

  useEffect(() => {
    const hasQuestions = chatFlow.some((item) => item.options?.length > 0);

    if (nextFocusRef.current === "questions" && hasQuestions) {
      firstFollowUpQuestionButtonRef.current?.focus();
      nextFocusRef.current = null;
    }

    if (nextFocusRef.current === "reply") {
      latestReplyRef.current?.focus();
      nextFocusRef.current = null;
    }

    if (nextFocusRef.current === "message") {
      messageRef.current?.focus();
      nextFocusRef.current = null;
    }

    if (nextFocusRef.current === "clue") {
      clueTextRef.current?.focus();
      nextFocusRef.current = null;
    }
  }, [chatFlow]);

  const focusSaraFollowupSectionPanel = () => {
    dispatch(setCurrentFocusedPanel("saraFollowupSectionPanel"));
  };

  const createTurn = (extra = {}) => ({
    type: "",
    line: "",
    clue: "",
    message: "",
    options: [],
    selectedQuestion: "",
    reply: "",
    replyType: "",
    loading: "",
    ...extra,
  });

  const updateTurn = (turnIndex, updates) => {
    setChatFlow((previousFlow) =>
      previousFlow.map((turn, index) =>
        index === turnIndex ? { ...turn, ...updates } : turn,
      ),
    );
  };

  const formatFollowUpQuestions = (data) =>
    (data.followUpQuestions || []).map((question, index) => ({
      question,
      category: data.followUpQuestionCategories?.[index] || "",
      type: data.followUpQuestionType || "",
    }));

  const findFirstMissingHallucinationLine = () => {
    const detectedLines =
      detectedImageHallucination.imageHallucinationItems.map(
        (item) => item.hallucinatedLine,
      );

    return (
      selectedImageHallucinations.find(
        (item) => !detectedLines.includes(item.hallucinatedLine),
      )?.hallucinatedLine || ""
    );
  };

  const clearFollowupChat = () => {
    setChatFlow([]);
    setManualFollowUpQuestion("");
    nextFocusRef.current = null;
    replyTurnIndexRef.current = null;
  };

  const fetchQuestionsForMode = async () => {
    if (followUpQuestionModeRef.current === "currentLine") {
      return client.getFollowupQuestionsForCurrentLine(
        currentImageDescriptionLine,
        selectedImageDescription,
      );
    }

    if (followUpQuestionModeRef.current === "clue") {
      return client.getFollowupQuestionsForClue(
        selectedImageDescription,
        clueHallucinationLineRef.current,
        clueRef.current,
      );
    }

    return client.getFollowupQuestionsForEntireDescription(
      selectedImageDescription,
    );
  };

  const handleGetFollowupQuestionsForCurrentLine = async () => {
    clearFollowupChat();
    followUpQuestionModeRef.current = "currentLine";

    setChatFlow([
      createTurn({
        type: "currentLine",
        line: currentImageDescriptionLine,
        loading: "questions",
      }),
    ]);

    try {
      const data = await fetchQuestionsForMode();
      nextFocusRef.current = "questions";

      setChatFlow([
        createTurn({
          type: "currentLine",
          line: currentImageDescriptionLine,
          options: formatFollowUpQuestions(data),
        }),
      ]);
    } catch (error) {
      console.error("Could not get follow-up questions:", error);
    } finally {
      setChatFlow((previousFlow) =>
        previousFlow.map((turn) => ({ ...turn, loading: "" })),
      );
    }
  };

  const handleGetFollowupQuestionsForEntireDescription = async () => {
    clearFollowupChat();
    followUpQuestionModeRef.current = "entireDescription";

    setChatFlow([
      createTurn({
        type: "entireDescription",
        loading: "questions",
      }),
    ]);

    try {
      const data = await fetchQuestionsForMode();
      nextFocusRef.current = "questions";

      setChatFlow([
        createTurn({
          type: "entireDescription",
          options: formatFollowUpQuestions(data),
        }),
      ]);
    } catch (error) {
      console.error("Could not get follow-up questions:", error);
    } finally {
      setChatFlow((previousFlow) =>
        previousFlow.map((turn) => ({ ...turn, loading: "" })),
      );
    }
  };

  const handleGetFollowupQuestionsForClue = async () => {
    clearFollowupChat();

    const imageHallucinationLine = findFirstMissingHallucinationLine();

    if (!imageHallucinationLine) {
      nextFocusRef.current = "message";

      setChatFlow([
        createTurn({
          type: "message",
          message: "All hallucinations have been detected.",
        }),
      ]);
      return;
    }

    followUpQuestionModeRef.current = "clue";
    clueHallucinationLineRef.current = imageHallucinationLine;

    setChatFlow([
      createTurn({
        type: "clue",
        loading: "clue",
      }),
    ]);

    try {
      const clueData = await client.getClue(
        selectedImageDescription,
        imageHallucinationLine,
      );

      const clue = clueData.clue || "";
      clueRef.current = clue;
      nextFocusRef.current = "clue";

      setChatFlow([
        createTurn({
          type: "clue",
          clue,
          loading: "questions",
        }),
      ]);

      const data = await fetchQuestionsForMode();

      setChatFlow([
        createTurn({
          type: "clue",
          clue,
          options: formatFollowUpQuestions(data),
        }),
      ]);
    } catch (error) {
      console.error("Could not get clue:", error);
    } finally {
      setChatFlow((previousFlow) =>
        previousFlow.map((turn) => ({ ...turn, loading: "" })),
      );
    }
  };

  const appendNextQuestionTurn = async () => {
    setChatFlow((previousFlow) => [
      ...previousFlow,
      createTurn({
        type: followUpQuestionModeRef.current,
        loading: "questions",
      }),
    ]);

    try {
      const data = await fetchQuestionsForMode();

      setChatFlow((previousFlow) => {
        const copy = [...previousFlow];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          options: formatFollowUpQuestions(data),
          loading: "",
        };
        return copy;
      });
    } catch (error) {
      console.error("Could not get new follow-up questions:", error);
    } finally {
      setChatFlow((previousFlow) =>
        previousFlow.map((turn) => ({ ...turn, loading: "" })),
      );
    }
  };

  const handleGetFollowUpReply = async (
    turnIndex,
    selectedFollowUpQuestionItem,
  ) => {
    const selectedFollowUpQuestion =
      selectedFollowUpQuestionItem.question.trim();

    if (!selectedFollowUpQuestion) return;

    updateTurn(turnIndex, {
      selectedQuestion: selectedFollowUpQuestion,
      options: [],
      loading: "reply",
    });

    try {
      const data = await client.getFollowUpReply(
        selectedImageDescription,
        selectedFollowUpQuestion,
      );

      nextFocusRef.current = "reply";
      replyTurnIndexRef.current = turnIndex;

      updateTurn(turnIndex, {
        reply: data.followUpReply || "",
        replyType: data.replyType || "",
        loading: "",
      });

      dispatch(
        addFollowUpsHistorySara({
          followUpQuestion: selectedFollowUpQuestion,
          followUpQuestionType: selectedFollowUpQuestionItem.type || "",
          followUpQuestionCategory: selectedFollowUpQuestionItem.category || "",
          followUpReply: data.followUpReply || "",
          followUpReplyType: data.replyType || "",
        }),
      );

      await appendNextQuestionTurn();
    } catch (error) {
      console.error("Could not get Sara reply:", error);

      nextFocusRef.current = "reply";
      replyTurnIndexRef.current = turnIndex;

      updateTurn(turnIndex, {
        reply: "Sorry, I could not get Sara's reply.",
        replyType: "",
        loading: "",
      });
    }
  };

  const handleManualFollowUpQuestion = () => {
    const question = manualFollowUpQuestion.trim();
    if (!question || chatFlow.length === 0) return;

    setChatFlow((previousFlow) => [
      ...previousFlow,
      createTurn({
        type: followUpQuestionModeRef.current,
      }),
    ]);

    handleGetFollowUpReply(chatFlow.length, {
      question,
      category: "User-written question",
      type: "manual",
    });

    setManualFollowUpQuestion("");
  };

  const canAskManualQuestion =
    chatFlow.length > 0 && chatFlow[0].type !== "message";

  return (
    <section
      className={
        currentFocusedPanel === "saraFollowupSectionPanel"
          ? "sara-followup-section current-focused-panel"
          : "sara-followup-section"
      }
      aria-label="Follow-up questioning"
      onMouseEnter={focusSaraFollowupSectionPanel}
      onFocusCapture={focusSaraFollowupSectionPanel}
    >
      <h2 className="panel-title">Ask Follow-up Questions</h2>

      <p className="keyboard-instructions">
        Select the buttons below to ask Sara detective questions.
      </p>

      <div className="sara-followupsection-buttons">
        <button
          type="button"
          className="page-button"
          onClick={handleGetFollowupQuestionsForCurrentLine}
          aria-label={`Ask about current line: ${currentImageDescriptionLine}`}
        >
          Ask about current line
        </button>

        <button
          type="button"
          className="page-button"
          onClick={handleGetFollowupQuestionsForEntireDescription}
        >
          Ask about entire description
        </button>

        <button
          type="button"
          className="page-button"
          onClick={handleGetFollowupQuestionsForClue}
        >
          Get Clues
        </button>

        <button
          type="button"
          className="page-button"
          onClick={clearFollowupChat}
        >
          Clear Chat
        </button>
      </div>

      <div aria-live="polite">
        {chatFlow.map((turn, turnIndex) => (
          <div key={turnIndex} className="sara-chat-history-item">
            {turn.type === "message" && (
              <p
                ref={messageRef}
                tabIndex={-1}
                className="clue-text"
                role="status"
              >
                {turn.message}
              </p>
            )}

            {turn.type === "currentLine" && turn.line && (
              <p className="selected-line-preview">
                Selected line: {turn.line}
              </p>
            )}

            {turn.type === "clue" && turn.clue && (
              <p ref={clueTextRef} tabIndex={-1} className="clue-text">
                Clue: {turn.clue}
              </p>
            )}

            {turn.loading === "clue" && (
              <p className="followup-loading" role="status">
                Loading clue from Sara...
              </p>
            )}

            {turn.loading === "questions" && (
              <p className="followup-loading" role="status">
                Loading follow-up questions from Sara...
              </p>
            )}

            {turn.options.length > 0 && (
              <ol className="sara-generated-question-list">
                {turn.options.map((item, index) => (
                  <li key={index} className="sara-generated-question">
                    <button
                      ref={index === 0 ? firstFollowUpQuestionButtonRef : null}
                      type="button"
                      className="followup-question-button"
                      onClick={() => handleGetFollowUpReply(turnIndex, item)}
                    >
                      {item.question}
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {turn.selectedQuestion && (
              <>
                <p className="followup-question-text">
                  {turn.selectedQuestion}
                </p>

                {turn.loading === "reply" ? (
                  <p className="followup-loading" role="status">
                    Loading reply from Sara...
                  </p>
                ) : (
                  <p
                    ref={
                      turnIndex === replyTurnIndexRef.current
                        ? latestReplyRef
                        : null
                    }
                    tabIndex={-1}
                    className="followup-question-reply"
                  >
                    {turn.reply}
                  </p>
                )}
              </>
            )}
          </div>
        ))}

        {canAskManualQuestion && (
          <div className="manual-followup-question-pane">
            <textarea
              className="manual-followup-question-input"
              value={manualFollowUpQuestion}
              onChange={(event) =>
                setManualFollowUpQuestion(event.target.value)
              }
              aria-label="Type your own follow-up question for Sara"
              placeholder="Type your own question for Sara..."
            />

            <button
              type="button"
              className="page-button"
              onClick={handleManualFollowUpQuestion}
            >
              Ask Sara
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AgentSaraPanel;
