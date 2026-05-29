import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../SpotTheBiasReducer";
import * as client from "./client.js";

const StoryReviewAliceFollowUpsPanel = () => {
  const dispatch = useDispatch();
  const followUpsPanelRef = useRef(null);
  const loadingRef = useRef(null);
  const explanationRef = useRef(null);

  const [questionHelp, setQuestionHelp] = useState({});
  const [activeHelpIndex, setActiveHelpIndex] = useState(null);

  const { currentFocusedPanel, followUpsHistoryAlice } = useSelector(
    (state) => state.SpotTheBiasReducer,
  );

  const activeExplanation =
    activeHelpIndex !== null ? questionHelp[activeHelpIndex] : null;

  useEffect(() => {
    if (!activeExplanation) return;

    requestAnimationFrame(() => {
      if (activeExplanation.isLoading) loadingRef.current?.focus();
      else explanationRef.current?.focus();
    });
  }, [activeExplanation]);

  useEffect(() => {
    const handleFollowUpsFocusKey = (event) => {
      if (event.key !== "]") return;

      event.preventDefault();
      dispatch(setCurrentFocusedPanel("reviewAliceFollowUpsPanel"));
      followUpsPanelRef.current?.focus();
    };

    window.addEventListener("keydown", handleFollowUpsFocusKey);
    return () => window.removeEventListener("keydown", handleFollowUpsFocusKey);
  }, [dispatch]);

  const focusReviewFollowUpsPanel = () => {
    dispatch(setCurrentFocusedPanel("reviewAliceFollowUpsPanel"));
  };

  const toggleQuestionHelp = (index) => {
    setActiveHelpIndex(null);

    setQuestionHelp((previousHelp) => {
      const updatedHelp = { ...previousHelp };
      delete updatedHelp[index];
      return updatedHelp;
    });
  };

  const fetchWhyThisQuestionHelps = async (index, followUpQuestion) => {
    if (questionHelp[index]) {
      toggleQuestionHelp(index);
      return;
    }

    setActiveHelpIndex(index);
    setQuestionHelp((previousHelp) => ({
      ...previousHelp,
      [index]: { isLoading: true },
    }));

    try {
      const data = await client.explainHowFillowUpQuestionHelpsDetect({
        followUpQuestion,
      });

      setQuestionHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { data },
      }));
    } catch (error) {
      console.error("Could not explain question:", error);

      setQuestionHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { error: "Sorry, I could not get the explanation." },
      }));
    }
  };

  return (
    <section
      ref={followUpsPanelRef}
      tabIndex={-1}
      className={
        currentFocusedPanel === "reviewAliceFollowUpsPanel"
          ? "review-panel current-focused-panel"
          : "review-panel"
      }
      aria-labelledby="review-alice-followups-title"
      onMouseEnter={focusReviewFollowUpsPanel}
      onFocusCapture={focusReviewFollowUpsPanel}
    >
      <h2
        id="review-alice-followups-title"
        className="panel-title"
        tabIndex={0}
      >
        List of Bias-Spotting Follow-up Questions You Asked Alice
      </h2>

      {followUpsHistoryAlice.length === 0 ? (
        <p className="question-empty">No follow-up questions asked yet.</p>
      ) : (
        <>
          <p className="keyboard-instructions">
            Review the follow-up questions you asked Alice. Select Explain How
            This Question Helps button to learn how the question can help detect
            bias.
          </p>

          <ol className="question-list" aria-label="Alice follow-up questions">
            {followUpsHistoryAlice.map((item, index) => {
              const explanation = questionHelp[index];
              const isActive = activeHelpIndex === index;

              return (
                <li key={index} className="lie-item">
                  <p className="question-text">
                    <strong>Question:</strong> {item.followUpQuestion}
                  </p>

                  {item.followUpQuestionCategory && (
                    <p>
                      <strong>Question type:</strong>{" "}
                      {item.followUpQuestionCategory}
                    </p>
                  )}

                  <button
                    type="button"
                    className="page-button"
                    onClick={() =>
                      fetchWhyThisQuestionHelps(index, item.followUpQuestion)
                    }
                    aria-expanded={Boolean(explanation)}
                  >
                    {explanation
                      ? "Hide Explanation"
                      : "Explain How This Question Helps"}
                  </button>

                  {explanation?.isLoading && (
                    <p
                      ref={isActive ? loadingRef : null}
                      tabIndex={-1}
                      className="question-type-explanation"
                      role="status"
                      aria-live="polite"
                    >
                      Loading explanation...
                    </p>
                  )}

                  {explanation?.error && (
                    <p
                      ref={isActive ? explanationRef : null}
                      tabIndex={-1}
                      className="question-type-explanation"
                      role="status"
                      aria-live="polite"
                    >
                      {explanation.error}
                    </p>
                  )}

                  {explanation?.data && (
                    <div
                      ref={isActive ? explanationRef : null}
                      tabIndex={-1}
                      className="question-type-explanation"
                      aria-live="polite"
                    >
                      <p>{explanation.data.explanation}</p>

                      {explanation.data.example && (
                        <p>
                          <strong>Another Example:</strong>{" "}
                          {explanation.data.example}
                        </p>
                      )}
                    </div>
                  )}

                  {item.followUpReply && (
                    <p className="question-reply-text">
                      <strong>Alice's reply:</strong> {item.followUpReply}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
};

export default StoryReviewAliceFollowUpsPanel;
