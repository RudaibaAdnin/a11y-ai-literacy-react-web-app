import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setCurrentFocusedImagePanel,
  setSelectedCheckingImageDescriptionParagraph,
  addFollowUpsHistoryAliceImage,
} from "../../ImageBiasReducer";
import * as client from "./client.js";
import "./index.css";

const ImageAgentAlicePanel = () => {
  const dispatch = useDispatch();

  const panelRef = useRef(null);
  const statusRef = useRef(null);
  const replyRef = useRef(null);
  const nextFocusRef = useRef(null);

  const [chatFlow, setChatFlow] = useState([]);
  const [manualQuestion, setManualQuestion] = useState("");

  const {
    imageDescriptionParagraphs,
    biasedImageDescriptionParagraphPlan,
    detectedImageDescriptionBiasParagraph,
    currentFocusedImagePanel,
  } = useSelector((state) => state.ImageBiasReducer);

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
      dispatch(setSelectedCheckingImageDescriptionParagraph(null));
      dispatch(setCurrentFocusedImagePanel("imageAlicePanel"));
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
    imageDescriptionParagraphIndex: null,
    imageDescriptionParagraph: "",
    biasCategoryImage: null,
    clueImage: "",
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
    dispatch(setCurrentFocusedImagePanel("imageAlicePanel"));
  };

  const clearChat = () => {
    setChatFlow([]);
    setManualQuestion("");
    nextFocusRef.current = null;
  };

  const getTarget = () => {
    const detectedIndices =
      detectedImageDescriptionBiasParagraph.imageDescriptionBiasItems.map(
        (item) => item.imageDescriptionParagraphIndex,
      );

    const targets = biasedImageDescriptionParagraphPlan
      .map((item) => ({
        imageDescriptionParagraphIndex: item.imageDescriptionParagraphIndex,
        imageDescriptionParagraph:
          imageDescriptionParagraphs[item.imageDescriptionParagraphIndex]
            ?.originalImageDescriptionParagraph || "",
        biasCategoryImage: item.biasCategory,
      }))
      .filter(
        (item) =>
          !detectedIndices.includes(item.imageDescriptionParagraphIndex) &&
          item.imageDescriptionParagraph &&
          item.biasCategoryImage,
      );

    return targets.length
      ? targets[Math.floor(Math.random() * targets.length)]
      : null;
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
    clueImage,
    type = "questions",
    loadedMessage,
    append = true,
    focusAfterLoad = true,
  }) => {
    const newTurn = createTurn({
      ...target,
      clueImage,
      type,
      loading: "questions",
    });

    setChatFlow((flow) => (append ? [...flow, newTurn] : [newTurn]));

    try {
      const data = await client.getImageBiasFollowupQuestions({
        imageDescriptionParagraph: target.imageDescriptionParagraph,
        biasCategoryImage: target.biasCategoryImage,
        clueImage,
      });

      if (focusAfterLoad) nextFocusRef.current = "status";

      updateLastTurn({
        loading: "",
        loadedMessage,
        options: (data.followUpQuestionsImage || []).map((question, index) => ({
          question,
          category: data.followUpQuestionCategoriesImage?.[index] || "",
        })),
      });
    } catch (error) {
      console.error("Could not get Alice image questions:", error);
      updateLastTurn({
        loading: "",
        message: "Sorry, Alice could not load questions right now.",
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
          message:
            "Great job! You already found the biased image description paragraph.",
        }),
      ]);
      return;
    }

    nextFocusRef.current = "status";
    setChatFlow([createTurn({ ...target, loading: "clue" })]);

    try {
      const data = await client.getImageBiasClue(target);

      await loadQuestions({
        target,
        clueImage: data.clueImage || "",
        type: "clueQuestions",
        append: false,
        loadedMessage:
          "Loaded clue and suggested follow-up questions are below.",
      });
    } catch (error) {
      console.error("Could not get Alice image clue:", error);
      setChatFlow([
        createTurn({ message: "Sorry, Alice could not get a clue right now." }),
      ]);
    }
  };

  const saveAliceHistory = (question, category, reply) => {
    dispatch(
      addFollowUpsHistoryAliceImage({
        followUpQuestionImage: question,
        followUpQuestionCategoryImage: category,
        followUpReplyImage: reply,
      }),
    );
  };

  const askQuestion = async (turnIndex, option) => {
    const turn = chatFlow[turnIndex];

    nextFocusRef.current = "status";

    setChatFlow((flow) =>
      flow.map((item, index) =>
        index === turnIndex
          ? {
              ...item,
              selectedQuestion: option.question,
              selectedQuestionCategory: option.category,
              options: [],
              loading: "reply",
            }
          : item,
      ),
    );

    try {
      const data = await client.getImageBiasFollowupReply({
        imageDescriptionParagraph: turn.imageDescriptionParagraph,
        biasCategoryImage: turn.biasCategoryImage,
        clueImage: turn.clueImage,
        followUpQuestionImage: option.question,
      });

      const reply = data.followUpReplyImage || "";
      saveAliceHistory(option.question, option.category, reply);
      nextFocusRef.current = "reply";

      setChatFlow((flow) =>
        flow.map((item, index) =>
          index === turnIndex ? { ...item, reply, loading: "" } : item,
        ),
      );

      await loadQuestions({
        target: turn,
        clueImage: turn.clueImage,
        loadedMessage: "Loaded suggested follow-up questions are below.",
        focusAfterLoad: false,
      });
    } catch (error) {
      console.error("Could not get Alice image reply:", error);
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
    const turn = [...chatFlow].reverse().find((item) => item.clueImage);

    if (!question || !turn) return;

    const turnIndex = chatFlow.length;
    nextFocusRef.current = "status";
    setManualQuestion("");

    setChatFlow((flow) => [
      ...flow,
      createTurn({
        ...turn,
        selectedQuestion: question,
        selectedQuestionCategory: "My own question",
        loading: "reply",
        options: [],
      }),
    ]);

    try {
      const data = await client.getImageBiasFollowupReply({
        imageDescriptionParagraph: turn.imageDescriptionParagraph,
        biasCategoryImage: turn.biasCategoryImage,
        clueImage: turn.clueImage,
        followUpQuestionImage: question,
      });

      const reply = data.followUpReplyImage || "";
      saveAliceHistory(question, "My own question", reply);
      nextFocusRef.current = "reply";

      setChatFlow((flow) =>
        flow.map((item, index) =>
          index === turnIndex ? { ...item, reply, loading: "" } : item,
        ),
      );

      await loadQuestions({
        target: turn,
        clueImage: turn.clueImage,
        loadedMessage: "Loaded suggested follow-up questions are below.",
        focusAfterLoad: false,
      });
    } catch (error) {
      console.error("Could not get Alice image reply:", error);
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

  const canAskManualQuestion = chatFlow.some((turn) => turn.clueImage);

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={
        currentFocusedImagePanel === "imageAlicePanel"
          ? "alice-panel current-focused-panel"
          : "alice-panel"
      }
      aria-labelledby="image-alice-panel-title"
      onMouseEnter={focusPanel}
      onFocusCapture={focusPanel}
    >
      <h2 id="image-alice-panel-title" className="panel-title" tabIndex={0}>
        Ask Alice for Image Clues
      </h2>

      <p className="keyboard-instructions">
        Ask Alice for clues about sneaky image bias.
      </p>

      <div
        className="sara-followupsection-buttons"
        role="group"
        aria-label="Alice image clue options"
      >
        <button type="button" className="page-button" onClick={getClues}>
          Get Clues
        </button>

        <button type="button" className="page-button" onClick={clearChat}>
          Close Chat
        </button>
      </div>

      <div role="region" aria-live="polite" aria-label="Alice image clue chat">
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
              >
                Loading clue and follow-up question suggestions from Alice...
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

            {turn.type === "clueQuestions" && turn.clueImage && (
              <p className="clue-text">Clue: {turn.clueImage}</p>
            )}

            {turn.loading === "questions" && (
              <p className="keyboard-instructions" role="status">
                Loading follow-up question suggestions from Alice...
              </p>
            )}

            {turn.options.length > 0 && (
              <ol
                className="sara-generated-question-list"
                aria-label="Alice image follow-up questions"
              >
                {turn.options.map((option, index) => (
                  <li key={index} className="sara-generated-question">
                    <button
                      type="button"
                      className="followup-question-button"
                      onClick={() => askQuestion(turnIndex, option)}
                    >
                      <strong>{option.category}</strong>: {option.question}
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

export default ImageAgentAlicePanel;
