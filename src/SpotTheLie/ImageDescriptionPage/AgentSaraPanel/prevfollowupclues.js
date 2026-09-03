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
  // Gets the image name from the URL.
  const { imagename } = useParams();

  // Sends actions to the Redux reducer.
  const dispatch = useDispatch();

  // Gets the selected image description.
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

  // Stores the current line index from the image description.
  const currentImageDescriptionLineIndex = useSelector(
    (state) => state.SpotTheLieReducer.currentImageDescriptionLineIndex,
  );

  // Gets the current line text from the image description.
  const currentImageDescriptionLine =
    selectedImageDescription[currentImageDescriptionLineIndex] || "";

  // Stores which panel is currently focused.
  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  // Stores generated follow-up questions.
  const [followUpQuestions, setFollowUpQuestions] = useState([]);

  // Stores the user's manually typed follow-up question.
  const [manualFollowUpQuestion, setManualFollowUpQuestion] = useState("");

  // Stores the full chat history.
  const [chatHistory, setChatHistory] = useState([]);

  // Tracks whether follow-up questions are loading.
  const [isLoadingFollowUpQuestions, setIsLoadingFollowUpQuestions] =
    useState(false);

  // Focuses the first generated follow-up question.
  const firstFollowUpQuestionButtonRef = useRef(null);

  // Focuses the newest Sara reply.
  const latestReplyRef = useRef(null);

  // Stores what should receive focus next.
  const nextFocusRef = useRef(null);

  // Stores whether follow-up questions are for current line or whole description.
  const followUpQuestionModeRef = useRef("entireDescription");

  const clueRef = useRef("");
  const clueHallucinationLineRef = useRef("");

  // Moves focus to questions or reply after the UI updates.
  useEffect(() => {
    if (nextFocusRef.current === "questions" && followUpQuestions.length > 0) {
      firstFollowUpQuestionButtonRef.current?.focus();
      nextFocusRef.current = null;
    }

    if (nextFocusRef.current === "reply" && chatHistory.length > 0) {
      latestReplyRef.current?.focus();
      nextFocusRef.current = null;
    }
  }, [followUpQuestions, chatHistory]);

  // Marks Sara's follow-up panel as focused.
  const focusSaraFollowupSectionPanel = () => {
    dispatch(setCurrentFocusedPanel("saraFollowupSectionPanel"));
  };

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

  const formatFollowUpQuestions = (data) =>
    (data.followUpQuestions || []).map((question, index) => ({
      question,
      category: data.followUpQuestionCategories?.[index] || "",
      type: data.followUpQuestionType || "",
    }));

  // Fetches follow-up questions for the whole description.
  const fetchFollowupQuestionsForEntireDescription = async (
    shouldFocusQuestions = false,
  ) => {
    setIsLoadingFollowUpQuestions(true);

    try {
      const data = await client.getFollowupQuestionsForEntireDescription(
        getRandomImageDescriptionForSara(), //selectedImageDescription,
      );

      if (shouldFocusQuestions) {
        nextFocusRef.current = "questions";
      }

      const formattedFollowUpQuestions = (data.followUpQuestions || []).map(
        (question, index) => ({
          question,
          category: data.followUpQuestionCategories?.[index] || "",
          type: data.followUpQuestionType || "",
        }),
      );

      setFollowUpQuestions(formattedFollowUpQuestions);
      setIsLoadingFollowUpQuestions(false);
    } catch (error) {
      console.error("Could not get follow-up questions:", error);
      setIsLoadingFollowUpQuestions(false);
    }
  };

  // Fetches follow-up questions for the current selected line.
  const fetchFollowupQuestionsForCurrentLine = async (
    shouldFocusQuestions = false,
  ) => {
    setIsLoadingFollowUpQuestions(true);

    try {
      const data = await client.getFollowupQuestionsForCurrentLine(
        currentImageDescriptionLine,
        getRandomImageDescriptionForSara(), //selectedImageDescription,
      );

      if (shouldFocusQuestions) {
        nextFocusRef.current = "questions";
      }

      const formattedFollowUpQuestions = (data.followUpQuestions || []).map(
        (question, index) => ({
          question,
          category: data.followUpQuestionCategories?.[index] || "",
          type: data.followUpQuestionType || "",
        }),
      );

      setFollowUpQuestions(formattedFollowUpQuestions);
      setIsLoadingFollowUpQuestions(false);
    } catch (error) {
      console.error("Could not get follow-up questions:", error);
      setIsLoadingFollowUpQuestions(false);
    }
  };

  // Handles the button for asking about the current selected line.
  const handleGetFollowupQuestionsForCurrentLine = async () => {
    clearFollowupChat();
    followUpQuestionModeRef.current = "currentLine";

    setChatHistory((previousHistory) => [
      ...previousHistory,
      {
        type: "currentLine",
        line: currentImageDescriptionLine,
      },
    ]);

    await fetchFollowupQuestionsForCurrentLine(true);
  };

  // Handles the button for asking about the whole description.
  const handleGetFollowupQuestionsForEntireDescription = async () => {
    clearFollowupChat();
    followUpQuestionModeRef.current = "entireDescription";

    await fetchFollowupQuestionsForEntireDescription(true);
  };

  const handleGetFollowupQuestionsForClue = async () => {
    clearFollowupChat();

    const imageHallucinationLine = findFirstMissingHallucinationLine();

    if (!imageHallucinationLine) {
      setChatHistory([
        {
          type: "message",
          message: "All hallucinations have been detected.",
        },
      ]);
      return;
    }
    followUpQuestionModeRef.current = "clue";
    clueHallucinationLineRef.current = imageHallucinationLine;

    setIsLoadingFollowUpQuestions(true);

    try {
      const clueData = await client.getClue(
        getRandomImageDescriptionForSara(), // selectedImageDescription,
        imageHallucinationLine,
      );

      const clue = clueData.clue || "";
      clueRef.current = clue;

      setChatHistory([
        {
          type: "clue",
          clue,
        },
      ]);

      const data = await client.getFollowupQuestionsForClue(
        getRandomImageDescriptionForSara(), // selectedImageDescription,
        imageHallucinationLine,
        clue,
      );

      nextFocusRef.current = "questions";
      setFollowUpQuestions(formatFollowUpQuestions(data));
      setIsLoadingFollowUpQuestions(false);
    } catch (error) {
      console.error("Could not get clue:", error);
      setIsLoadingFollowUpQuestions(false);
    }
  };

  // Fetches Sara's reply for the selected follow-up question.
  const handleGetFollowUpReply = async (selectedFollowUpQuestionItem) => {
    const selectedFollowUpQuestion =
      selectedFollowUpQuestionItem.question.trim();

    if (!selectedFollowUpQuestion) return;

    setFollowUpQuestions([]);

    setChatHistory((previousHistory) => [
      ...previousHistory,
      {
        question: selectedFollowUpQuestion,
        reply: "",
        isLoading: true,
      },
    ]);

    try {
      const data = await client.getFollowUpReply(
        getRandomImageDescriptionForSara(), // selectedImageDescription,
        selectedFollowUpQuestion,
      );

      nextFocusRef.current = "reply";

      setChatHistory((previousHistory) =>
        previousHistory.map((item, index) =>
          index === previousHistory.length - 1
            ? {
                ...item,
                reply: data.followUpReply || "",
                replyType: data.replyType || "",
                isLoading: false,
              }
            : item,
        ),
      );

      dispatch(
        addFollowUpsHistorySara({
          followUpQuestion: selectedFollowUpQuestion,
          followUpQuestionType: selectedFollowUpQuestionItem.type || "",
          followUpQuestionCategory: selectedFollowUpQuestionItem.category || "",
          followUpReply: data.followUpReply || "",
          followUpReplyType: data.replyType || "",
        }),
      );

      // if (followUpQuestionModeRef.current === "currentLine") {
      //   await fetchFollowupQuestionsForCurrentLine(false);
      // } else {
      //   await fetchFollowupQuestionsForEntireDescription(false);
      // }
      if (followUpQuestionModeRef.current === "currentLine") {
        await fetchFollowupQuestionsForCurrentLine(false);
      } else if (followUpQuestionModeRef.current === "clue") {
        const data = await client.getFollowupQuestionsForClue(
          getRandomImageDescriptionForSara(), //selectedImageDescription,
          clueHallucinationLineRef.current,
          clueRef.current,
        );

        setFollowUpQuestions(formatFollowUpQuestions(data));
      } else {
        await fetchFollowupQuestionsForEntireDescription(false);
      }
    } catch (error) {
      console.error("Could not get Sara reply:", error);

      nextFocusRef.current = "reply";

      setChatHistory((previousHistory) =>
        previousHistory.map((item, index) =>
          index === previousHistory.length - 1
            ? {
                ...item,
                reply: "Sorry, I could not get Sara's reply.",
                isLoading: false,
              }
            : item,
        ),
      );
    }
  };

  // Clears the chat and follow-up questions.
  const clearFollowupChat = () => {
    setChatHistory([]);
    setFollowUpQuestions([]);
    setManualFollowUpQuestion("");
    setIsLoadingFollowUpQuestions(false);
    nextFocusRef.current = null;
  };

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
        {chatHistory.map((item, index) => (
          <div key={index} className="sara-chat-history-item">
            {item.type === "message" ? (
              <p className="clue-text" role="status">
                {item.message}
              </p>
            ) : item.type === "currentLine" ? (
              <p className="selected-line-preview">
                Selected line: {item.line}
              </p>
            ) : item.type === "clue" ? (
              <p className="clue-text">Clue: {item.clue}</p>
            ) : (
              <>
                <p className="followup-question-text">{item.question}</p>

                {item.isLoading ? (
                  <p className="followup-loading" role="status">
                    Loading reply from Sara...
                  </p>
                ) : (
                  <p
                    ref={
                      index === chatHistory.length - 1 ? latestReplyRef : null
                    }
                    tabIndex={-1}
                    className="followup-question-reply"
                  >
                    {item.reply}
                  </p>
                )}
              </>
            )}
          </div>
        ))}

        {isLoadingFollowUpQuestions && (
          <p className="followup-loading" role="status">
            Loading follow-up questions from Sara...
          </p>
        )}

        {followUpQuestions.length > 0 && (
          <>
            <ol className="sara-generated-question-list">
              {followUpQuestions.map((item, index) => (
                <li key={index} className="sara-generated-question">
                  <button
                    ref={index === 0 ? firstFollowUpQuestionButtonRef : null}
                    type="button"
                    className="followup-question-button"
                    onClick={() => handleGetFollowUpReply(item)}
                  >
                    {item.question}
                  </button>
                </li>
              ))}
            </ol>

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
                onClick={() => {
                  handleGetFollowUpReply({
                    question: manualFollowUpQuestion,
                    category: "User-written question",
                    type: "manual",
                  });
                  setManualFollowUpQuestion("");
                }}
              >
                Ask Sara
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AgentSaraPanel;
