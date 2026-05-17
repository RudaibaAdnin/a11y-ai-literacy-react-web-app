import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../SpotTheLieReducer";
import * as client from "./client.js";

const ReviewDetectiveFollowUpsPanel = () => {
  const dispatch = useDispatch();
  const followUpsPanelRef = useRef(null);

  const [questionHelp, setQuestionHelp] = useState({});
  const [replyHelp, setReplyHelp] = useState({});

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  const followUpsHistorySara = useSelector(
    (state) => state.SpotTheLieReducer.followUpsHistorySara,
  );

  const selectedImageDescription = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageDescription,
  );

  const focusReviewFollowUpsPanel = () => {
    dispatch(setCurrentFocusedPanel("reviewFollowUpsPanel"));
  };

  const toggleQuestionHelp = (index) => {
    setQuestionHelp((previousHelp) => {
      const updatedHelp = { ...previousHelp };
      delete updatedHelp[index];
      return updatedHelp;
    });
  };

  const fetchWhyThisQuestionHelps = async (
    index,
    followUpQuestionType,
    followUpQuestionCategory,
    followUpQuestion,
  ) => {
    if (questionHelp[index]) {
      toggleQuestionHelp(index);
      return;
    }

    setQuestionHelp((previousHelp) => ({
      ...previousHelp,
      [index]: { isLoading: true },
    }));

    try {
      const data = await client.whyQuestionHelps(
        followUpQuestionType,
        followUpQuestionCategory,
        followUpQuestion,
      );

      setQuestionHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { data },
      }));
    } catch (error) {
      console.error("Could not explain question:", error);
      setQuestionHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { isLoading: true },
      }));
    }
  };

  const fetchHowToImproveFollowUpQuestion = async (index, followUpQuestion) => {
    if (questionHelp[index]) {
      toggleQuestionHelp(index);
      return;
    }

    setQuestionHelp((previousHelp) => ({
      ...previousHelp,
      [index]: { isLoading: true },
    }));

    try {
      const data = await client.improveFollowupQuestion(followUpQuestion);

      setQuestionHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { data },
      }));
    } catch (error) {
      console.error("Could not improve question:", error);
      setQuestionHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { isLoading: true },
      }));
    }
  };

  const fetchWhyThisReplyIsWrong = async (index, replyType, replyText) => {
    if (replyHelp[index]) {
      setReplyHelp((previousHelp) => {
        const updatedHelp = { ...previousHelp };
        delete updatedHelp[index];
        return updatedHelp;
      });
      return;
    }

    setReplyHelp((previousHelp) => ({
      ...previousHelp,
      [index]: { isLoading: true },
    }));

    try {
      const data = await client.explainReplyType(
        replyType,
        replyText,
        selectedImageDescription,
      );

      setReplyHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { data },
      }));
    } catch (error) {
      console.error("Could not explain reply:", error);
      setReplyHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { error: "Sorry, I could not get the explanation." },
      }));
    }
  };

  useEffect(() => {
    const handleFollowUpsFocusKey = (event) => {
      if (event.key !== "=") return;

      event.preventDefault();
      dispatch(setCurrentFocusedPanel("reviewFollowUpsPanel"));
      followUpsPanelRef.current?.focus();
    };

    window.addEventListener("keydown", handleFollowUpsFocusKey);

    return () => {
      window.removeEventListener("keydown", handleFollowUpsFocusKey);
    };
  }, [dispatch]);

  return (
    <section
      ref={followUpsPanelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "reviewFollowUpsPanel"
          ? "review-panel current-focused-panel"
          : "review-panel"
      }
      aria-labelledby="review-followups-title"
      onMouseEnter={focusReviewFollowUpsPanel}
      onFocusCapture={focusReviewFollowUpsPanel}
    >
      <h2 id="review-followups-title" className="panel-title" tabIndex={0}>
        Detective Follow-up Questions You Asked Sara
      </h2>

      {followUpsHistorySara.length === 0 ? (
        <p className="question-empty">No follow-up questions asked yet.</p>
      ) : (
        <>
          <p className="keyboard-instructions">
            Look back at the detective questions you asked Sara and Sara's
            replies. For each detective question, select Explain How This
            Question Helps or Explain How to Improve This Question to learn
            more. If Sara's reply seems fishy, select Explain This Reply button.
          </p>

          <ol
            className="question-list"
            aria-label="Detective follow-up questions"
          >
            {followUpsHistorySara.map((item, index) => {
              const questionExplanation = questionHelp[index];
              const replyExplanation = replyHelp[index];
              const isManualQuestion = item.followUpQuestionType === "manual";

              return (
                <li key={index} className="lie-item">
                  <p className="question-text">
                    <strong>Detective question:</strong> {item.followUpQuestion}
                  </p>

                  <button
                    type="button"
                    className="page-button"
                    onClick={() =>
                      isManualQuestion
                        ? fetchHowToImproveFollowUpQuestion(
                            index,
                            item.followUpQuestion,
                          )
                        : fetchWhyThisQuestionHelps(
                            index,
                            item.followUpQuestionType,
                            item.followUpQuestionCategory,
                            item.followUpQuestion,
                          )
                    }
                    aria-expanded={Boolean(questionExplanation)}
                    aria-label={
                      questionExplanation
                        ? `Hide explanation for detective question ${index + 1}`
                        : isManualQuestion
                          ? `Explain how to improve detective question ${index + 1}`
                          : `Explain how detective question ${index + 1} helps`
                    }
                  >
                    {questionExplanation
                      ? "Hide Explanation"
                      : isManualQuestion
                        ? "Explain How to Improve This Question"
                        : "Explain How This Question Helps"}
                  </button>

                  {questionExplanation?.isLoading && (
                    <p
                      className="question-type-explanation"
                      role="status"
                      aria-live="polite"
                    >
                      Loading explanation...
                    </p>
                  )}

                  {questionExplanation?.error && (
                    <p
                      className="question-type-explanation"
                      role="status"
                      aria-live="polite"
                    >
                      {questionExplanation.error}
                    </p>
                  )}

                  {questionExplanation?.data && (
                    <div
                      className="question-type-explanation"
                      aria-live="polite"
                    >
                      {isManualQuestion ? (
                        <>
                          <p>
                            <strong>You can ask:</strong>{" "}
                            {questionExplanation.data.improvedQuestionOption1}
                          </p>
                          <p>
                            <strong>You can ask:</strong>{" "}
                            {questionExplanation.data.improvedQuestionOption2}
                          </p>
                          <ul>
                            {questionExplanation.data.tips?.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <>
                          <p>{questionExplanation.data.why}</p>
                          <p>
                            <strong>Another Example:</strong>{" "}
                            {questionExplanation.data.example}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="reply-sara">
                    {item.followUpReply ? (
                      <>
                        <p className="question-reply-text">
                          <strong>Sara's reply:</strong> {item.followUpReply}
                        </p>

                        {(item.followUpReplyType === "irrelevance" ||
                          item.followUpReplyType === "misfocus") && (
                          <>
                            <p className="reply-type-instruction">
                              Do you find anything wrong with this reply? Select
                              the button below for an explanation.
                            </p>

                            <button
                              type="button"
                              className="page-button"
                              onClick={() =>
                                fetchWhyThisReplyIsWrong(
                                  index,
                                  item.followUpReplyType,
                                  item.followUpReply,
                                )
                              }
                              aria-expanded={Boolean(replyExplanation)}
                              aria-label={
                                replyExplanation
                                  ? `Hide explanation for Sara's reply to question ${index + 1}`
                                  : `Explain Sara's reply to question ${index + 1}`
                              }
                            >
                              {replyExplanation
                                ? "Hide explanation"
                                : "Explain This Reply"}
                            </button>

                            {replyExplanation?.isLoading && (
                              <p
                                className="reply-type-explanation"
                                role="status"
                                aria-live="polite"
                              >
                                Loading explanation...
                              </p>
                            )}

                            {replyExplanation?.error && (
                              <p
                                className="reply-type-explanation"
                                role="status"
                                aria-live="polite"
                              >
                                {replyExplanation.error}
                              </p>
                            )}

                            {replyExplanation?.data && (
                              <div
                                className="reply-type-explanation"
                                aria-live="polite"
                              >
                                <p>{replyExplanation.data.explanation}</p>
                                <p>
                                  <strong>Tip:</strong>{" "}
                                  {replyExplanation.data.tip}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <p className="question-empty">
                        This question does not have a reply.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
};

export default ReviewDetectiveFollowUpsPanel;
