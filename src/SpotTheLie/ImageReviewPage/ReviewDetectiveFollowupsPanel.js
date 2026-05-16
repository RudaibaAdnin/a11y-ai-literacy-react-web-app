import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../SpotTheLieReducer";

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

  const focusReviewFollowUpsPanel = () => {
    dispatch(setCurrentFocusedPanel("reviewFollowUpsPanel"));
  };

  const fetchWhyThisQuestionHelps = (
    index,
    followUpQuestionType,
    followUpQuestionCategory,
  ) => {
    setQuestionHelp((previousHelp) => {
      if (previousHelp[index]) {
        const updatedHelp = { ...previousHelp };
        delete updatedHelp[index];
        return updatedHelp;
      }

      return {
        ...previousHelp,
        [index]: `This question helps because it asks about ${
          followUpQuestionCategory || "a clue"
        } and helps you check whether Sara's description might be a ${
          followUpQuestionType || "mistake"
        }.`,
      };
    });
  };

  const fetchHowToImproveFollowUpQuestion = (index, followUpQuestion) => {
    setQuestionHelp((previousHelp) => {
      if (previousHelp[index]) {
        const updatedHelp = { ...previousHelp };
        delete updatedHelp[index];
        return updatedHelp;
      }

      return {
        ...previousHelp,
        [index]: `You can improve this question by asking for clearer clues, asking Sara to explain the evidence, or checking one specific detail from the image description.`,
      };
    });
  };

  const fetchWhyThisReplyIsWrong = (index, replyType) => {
    setReplyHelp((previousHelp) => {
      if (previousHelp[index]) {
        const updatedHelp = { ...previousHelp };
        delete updatedHelp[index];
        return updatedHelp;
      }

      return {
        ...previousHelp,
        [index]:
          replyType === "irrelevance"
            ? "This reply may be wrong because it does not answer the detective question directly."
            : "This reply may be wrong because it talks about a smaller detail instead of the main thing the question asks.",
      };
    });
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
            replies. Select the Explain how this question helps button to learn
            why each question was useful. If Sara's reply feels fishy, select
            Explain this reply.
          </p>
          <ol
            className="question-list"
            aria-label="Detective follow-up questions"
          >
            {followUpsHistorySara.map((item, index) => (
              <li key={index} className="lie-item">
                <p className="question-text">
                  <strong>Detective question:</strong> {item.followUpQuestion}
                </p>

                <button
                  type="button"
                  className="page-button"
                  onClick={() =>
                    item.followUpQuestionType === "manual"
                      ? fetchHowToImproveFollowUpQuestion(
                          index,
                          item.followUpQuestion,
                        )
                      : fetchWhyThisQuestionHelps(
                          index,
                          item.followUpQuestionType,
                          item.followUpQuestionCategory,
                        )
                  }
                >
                  {questionHelp[index]
                    ? "Hide Explanation"
                    : item.followUpQuestionType === "manual"
                      ? "Explain how to improve this question"
                      : "Explain how this question helps"}
                </button>

                {questionHelp[index] && (
                  <p className="question-type-explanation">
                    {questionHelp[index]}
                  </p>
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
                              )
                            }
                          >
                            {replyHelp[index]
                              ? "Hide explanation"
                              : "Explain this reply"}
                          </button>

                          {replyHelp[index] && (
                            <p className="reply-type-explanation">
                              {replyHelp[index]}
                            </p>
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
            ))}
          </ol>
        </>
      )}
    </section>
  );
};

export default ReviewDetectiveFollowUpsPanel;
