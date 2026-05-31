import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCurrentFocusedImagePanel } from "../ImageBiasReducer";
import * as client from "./client.js";
import "./index.css";

const ImageReviewAliceFollowUpsPanel = () => {
  const dispatch = useDispatch();

  const followUpsPanelRef = useRef(null);
  const loadingRef = useRef(null);
  const explanationRef = useRef(null);

  const [questionHelp, setQuestionHelp] = useState({});
  const [activeHelpIndex, setActiveHelpIndex] = useState(null);

  const { currentFocusedImagePanel, followUpsHistoryAliceImage } = useSelector(
    (state) => state.ImageBiasReducer,
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
      dispatch(setCurrentFocusedImagePanel("imageReviewAliceFollowUpsPanel"));
      followUpsPanelRef.current?.focus();
    };

    window.addEventListener("keydown", handleFollowUpsFocusKey);
    return () => window.removeEventListener("keydown", handleFollowUpsFocusKey);
  }, [dispatch]);

  const focusReviewFollowUpsPanel = () => {
    dispatch(setCurrentFocusedImagePanel("imageReviewAliceFollowUpsPanel"));
  };

  const toggleQuestionHelp = (index) => {
    setActiveHelpIndex(null);
    setQuestionHelp((previousHelp) => {
      const updatedHelp = { ...previousHelp };
      delete updatedHelp[index];
      return updatedHelp;
    });
  };

  const fetchWhyThisQuestionHelps = async (index, followUpQuestionImage) => {
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
      const data = await client.explainHowFollowUpQuestionHelpsDetectImage({
        followUpQuestionImage,
      });

      setQuestionHelp((previousHelp) => ({
        ...previousHelp,
        [index]: { data },
      }));
    } catch (error) {
      console.error("Could not explain image question:", error);
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
        currentFocusedImagePanel === "imageReviewAliceFollowUpsPanel"
          ? "review-panel current-focused-panel"
          : "review-panel"
      }
      aria-labelledby="image-review-alice-followups-title"
      onMouseEnter={focusReviewFollowUpsPanel}
      onFocusCapture={focusReviewFollowUpsPanel}
    >
      <h2
        id="image-review-alice-followups-title"
        className="panel-title"
        tabIndex={0}
      >
        List of Image Bias-Spotting Follow-up Questions You Asked Alice
      </h2>

      {followUpsHistoryAliceImage.length === 0 ? (
        <p className="question-empty">No follow-up questions asked yet.</p>
      ) : (
        <>
          <p className="keyboard-instructions">
            Review the follow-up questions you asked Alice. Select Explain How
            This Question Helps button to learn how the question can help detect
            image bias.
          </p>

          <ol
            className="question-list"
            aria-label="Alice image follow-up questions"
          >
            {followUpsHistoryAliceImage.map((item, index) => {
              const explanation = questionHelp[index];
              const isActive = activeHelpIndex === index;

              return (
                <li key={index} className="lie-item">
                  <p className="question-text">
                    <strong>Question:</strong> {item.followUpQuestionImage}
                  </p>

                  {item.followUpQuestionCategoryImage && (
                    <p>
                      <strong>Question type:</strong>{" "}
                      {item.followUpQuestionCategoryImage}
                    </p>
                  )}

                  <button
                    type="button"
                    className="page-button"
                    onClick={() =>
                      fetchWhyThisQuestionHelps(
                        index,
                        item.followUpQuestionImage,
                      )
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

                  {item.followUpReplyImage && (
                    <p className="question-reply-text">
                      <strong>Alice's reply:</strong> {item.followUpReplyImage}
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

export default ImageReviewAliceFollowUpsPanel;
