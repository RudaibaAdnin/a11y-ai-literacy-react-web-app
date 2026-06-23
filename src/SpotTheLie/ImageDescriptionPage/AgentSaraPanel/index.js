import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { imageDescriptions } from "../../util/imageDescriptions.js";
import { accurateImageDescriptions } from "../../util/accurateImageDescriptions.js";

import {
  setCurrentFocusedPanel,
  addFollowUpsHistorySara,
} from "../../SpotTheLieReducer";
import * as client from "./client.js";

const AgentSaraPanel = () => {
  const { imagename } = useParams();
  const dispatch = useDispatch();

  const selectedImageDescription = imageDescriptions[imagename] || [];

  const accurateImageDescription = accurateImageDescriptions[imagename] || [];

  const getRandomImageDescriptionForSara = () => {
    const descriptions = [selectedImageDescription, accurateImageDescription];

    const randomIndex = Math.floor(Math.random() * descriptions.length);

    return descriptions[randomIndex];
  };

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

  const saraFollowupPanelRef = useRef(null);

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

  useEffect(() => {
    const handleSaraPanelFocusKey = (event) => {
      const activeElement = document.activeElement;

      const isTyping =
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "INPUT" ||
        activeElement?.isContentEditable;

      if (isTyping || event.key !== "=") return;

      event.preventDefault();
      dispatch(setCurrentFocusedPanel("saraFollowupSectionPanel"));
      saraFollowupPanelRef.current?.focus();
    };

    window.addEventListener("keydown", handleSaraPanelFocusKey);

    return () => {
      window.removeEventListener("keydown", handleSaraPanelFocusKey);
    };
  }, [dispatch]);

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
        getRandomImageDescriptionForSara(),
        //selectedImageDescription,
      );
    }

    if (followUpQuestionModeRef.current === "clue") {
      return client.getFollowupQuestionsForClue(
        getRandomImageDescriptionForSara(), //selectedImageDescription,
        clueHallucinationLineRef.current,
        clueRef.current,
      );
    }

    return client.getFollowupQuestionsForEntireDescription(
      //selectedImageDescription,
      getRandomImageDescriptionForSara(),
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
        getRandomImageDescriptionForSara(),
        //selectedImageDescription,
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
        line:
          followUpQuestionModeRef.current === "currentLine"
            ? currentImageDescriptionLine
            : "",
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
        getRandomImageDescriptionForSara(), //selectedImageDescription,
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
      ref={saraFollowupPanelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "saraFollowupSectionPanel"
          ? "sara-followup-section current-focused-panel"
          : "sara-followup-section"
      }
      aria-label="Ask Sara detective follow-up questions"
      onMouseEnter={focusSaraFollowupSectionPanel}
      onFocusCapture={focusSaraFollowupSectionPanel}
    >
      <h2 className="panel-title" tabIndex={0}>
        Ask Detective Follow-up Questions
      </h2>

      <p className="keyboard-instructions">
        Select the buttons below to ask Sara detective questions.
      </p>

      <div
        className="sara-followupsection-buttons"
        aria-label="Sara follow-up question options"
      >
        <button
          type="button"
          className="page-button"
          onClick={handleGetFollowupQuestionsForCurrentLine}
          aria-label={`Ask Sara detective follow-up questions about the current line: ${currentImageDescriptionLine}`}
        >
          Ask About Current Line
        </button>

        <button
          type="button"
          className="page-button"
          onClick={handleGetFollowupQuestionsForEntireDescription}
          aria-label="Ask Sara detective follow-up questions about entire image description"
        >
          Ask About Entire Description
        </button>

        <button
          type="button"
          className="page-button"
          onClick={handleGetFollowupQuestionsForClue}
          aria-label="Get clues and ask Sara detective follow-up questions"
        >
          Get Clues
        </button>

        <button
          type="button"
          className="page-button"
          onClick={clearFollowupChat}
          aria-label="Clear Chat"
        >
          Clear Chat
        </button>
      </div>

      <div
        role="region"
        aria-live="polite"
        aria-label="Sara follow-up conversation"
      >
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
            {turn.type === "currentLine" &&
              turn.line &&
              turn.loading === "questions" && (
                <p className="selected-line-preview" role="status">
                  Loading follow-up questions from Sara about selected line:{" "}
                  {turn.line}...
                </p>
              )}

            {/* {turn.type === "currentLine" && turn.line && turn.loading !== "questions" && (
  <p className="selected-line-preview">
    Selected line: {turn.line}
  </p>
)} */}
            {turn.type === "clue" && turn.clue && (
              <p
                ref={clueTextRef}
                tabIndex={-1}
                className="clue-text"
                aria-label={`Clue: ${turn.clue}`}
              >
                Clue: {turn.clue}
              </p>
            )}

            {turn.loading === "clue" && (
              <p className="followup-loading" role="status">
                Loading clue from Sara...
              </p>
            )}

            {turn.loading === "questions" && turn.type !== "currentLine" && (
              <p className="followup-loading" role="status">
                Loading follow-up questions from Sara...
              </p>
            )}

            {turn.options.length > 0 && (
              <ol
                className="sara-generated-question-list"
                aria-label="Suggested follow-up questions"
              >
                {turn.options.map((item, index) => (
                  <li key={index} className="sara-generated-question">
                    <button
                      ref={index === 0 ? firstFollowUpQuestionButtonRef : null}
                      type="button"
                      className="followup-question-button"
                      onClick={() => handleGetFollowUpReply(turnIndex, item)}
                      aria-label={`${item.question}`}
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
                    aria-label={`Reply: ${turn.reply}`}
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
