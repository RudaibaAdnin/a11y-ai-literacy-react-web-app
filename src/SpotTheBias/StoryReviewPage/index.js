import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../SpotTheBiasReducer";
import * as client from "./client.js";
import StoryReviewAliceFollowUpsPanel from "./storyReviewAliceFollowUpsPanel";
import StoryReviewRephrasePromptPanel from "./storyReviewRephrasePromptPanel";

const StoryReviewPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storytopic } = useParams();

  const detectedBiasRef = useRef(null);
  const loadingRef = useRef(null);
  const explanationRef = useRef(null);

  const [activeExplanationKey, setActiveExplanationKey] = useState("");
  const [explanations, setExplanations] = useState({});

  const { detectedStoryBias, flaggedStoryParagraph, currentFocusedPanel } =
    useSelector((state) => state.SpotTheBiasReducer);

  const detectedItems = detectedStoryBias.storyBiasItems || [];
  const flaggedItems = flaggedStoryParagraph.flaggedStoryParagraphItems || [];

  const getParagraph = (item) => item.paragraph || item.markedParagraph || "";
  const getIndex = (item) => item.paragraphIndex ?? item.index;

  const getBiasCategoryName = (biasCategory) => {
    if (!biasCategory) return "";
    if (typeof biasCategory === "string") return biasCategory;
    return biasCategory.name || "";
  };

  useEffect(() => {
    const explanation = explanations[activeExplanationKey];
    if (!explanation) return;

    requestAnimationFrame(() => {
      if (explanation.isLoading) loadingRef.current?.focus();
      else explanationRef.current?.focus();
    });
  }, [explanations, activeExplanationKey]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "[") return;

      event.preventDefault();
      dispatch(setCurrentFocusedPanel("reviewDetectedBiasPanel"));
      detectedBiasRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const focusGuidePanel = () => {
    dispatch(setCurrentFocusedPanel("reviewGuidePanel"));
  };

  const focusDetectedBiasPanel = () => {
    dispatch(setCurrentFocusedPanel("reviewDetectedBiasPanel"));
  };

  const removeExplanation = (key) => {
    setActiveExplanationKey("");
    setExplanations((previous) => {
      const updated = { ...previous };
      delete updated[key];
      return updated;
    });
  };

  const fetchExplanationBiasType = async (item) => {
    const key = `bias-${getIndex(item)}`;

    if (explanations[key]) {
      removeExplanation(key);
      return;
    }

    setActiveExplanationKey(key);
    setExplanations((previous) => ({
      ...previous,
      [key]: { isLoading: true },
    }));

    try {
      const data = await client.explainBiasType({
        paragraph: getParagraph(item),
        biasCategory: item.biasCategory,
      });

      setExplanations((previous) => ({ ...previous, [key]: { data } }));
    } catch (error) {
      console.error("Could not explain bias type:", error);
      setExplanations((previous) => ({
        ...previous,
        [key]: { error: "Sorry, I could not get the explanation." },
      }));
    }
  };

  const fetchExplanationIfAnythingWrong = async (item) => {
    const key = `wrong-${getIndex(item)}`;

    if (explanations[key]) {
      removeExplanation(key);
      return;
    }

    setActiveExplanationKey(key);
    setExplanations((previous) => ({
      ...previous,
      [key]: { isLoading: true },
    }));

    try {
      const data = await client.explainIfAnythingWrong({
        paragraph: getParagraph(item),
      });

      setExplanations((previous) => ({ ...previous, [key]: { data } }));
    } catch (error) {
      console.error("Could not check paragraph:", error);
      setExplanations((previous) => ({
        ...previous,
        [key]: { error: "Sorry, I could not get the explanation." },
      }));
    }
  };

  const renderExplanation = (key) => {
    const explanation = explanations[key];
    const isActive = activeExplanationKey === key;
    const explanationId = `${key}-explanation`;

    if (explanation?.isLoading) {
      return (
        <p
          id={explanationId}
          ref={isActive ? loadingRef : null}
          tabIndex={-1}
          className="bias-feedback"
          role="status"
          aria-live="polite"
        >
          Loading explanation...
        </p>
      );
    }

    if (explanation?.error) {
      return (
        <p
          id={explanationId}
          ref={isActive ? explanationRef : null}
          tabIndex={-1}
          className="bias-type-explanation"
          role="status"
          aria-live="polite"
        >
          {explanation.error}
        </p>
      );
    }

    if (explanation?.data) {
      return (
        <div
          id={explanationId}
          ref={isActive ? explanationRef : null}
          tabIndex={-1}
          className="bias-type-explanation"
          aria-live="polite"
        >
          <p>{explanation.data.explanation}</p>

          {explanation.data.example && (
            <p>
              <strong>Example:</strong> {explanation.data.example}
            </p>
          )}

          {explanation.data.possibleBiasType && (
            <p>
              <strong>Possible bias type:</strong>{" "}
              {explanation.data.possibleBiasType}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <main className="story-review-page" aria-labelledby="review-page-title">
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-bias-avatar.png"
            className="title-image"
            alt=""
            aria-hidden="true"
          />
          <h1 id="review-page-title" className="page-title">
            Spot the Bias
          </h1>
        </div>

        <nav className="page-nav" aria-label="Review page navigation">
          <Link className="page-button" to="/spot-the-bias">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section
        className={
          currentFocusedPanel === "reviewGuidePanel"
            ? "page-instructions current-focused-panel"
            : "page-instructions"
        }
        aria-labelledby="review-guide-title"
        onMouseEnter={focusGuidePanel}
        onFocusCapture={focusGuidePanel}
      >
        <h2 id="review-guide-title" className="instruction-title" tabIndex={0}>
          Review Guide
        </h2>

        <p className="page-instructions">
          Great work on spotting bias! Now, it is time to review your
          bias-spotting moves. Below, review each bias you spotted, the
          paragraphs you marked, follow-up questions you asked Alice, and the
          prompts you used to rewrite and fix a biased paragraph. You can select
          the explanation buttons to learn more and get helpful examples.
        </p>

        <p className="page-instructions">
          Press the left square bracket key{" "}
          <span className="kbd" aria-hidden="true">
            [
          </span>{" "}
          to jump to the list of detected bias panel. Press the right square
          bracket key{" "}
          <span className="kbd" aria-hidden="true">
            ]
          </span>{" "}
          to jump to review the list of follow-up questions you asked Alice
          panel. Press equal key{" "}
          <span className="kbd" aria-hidden="true">
            =
          </span>{" "}
          to jump to review the list of prompts you used to rewrite and fix a
          biased paragraph.
        </p>

        <button
          type="button"
          className="page-button"
          onClick={() => navigate(`/spot-the-bias/${storytopic}/story-reading`)}
        >
          Back to Story Page
        </button>
      </section>

      <div className="review-panels-container">
        <section
          ref={detectedBiasRef}
          tabIndex={-1}
          className={
            currentFocusedPanel === "reviewDetectedBiasPanel"
              ? "review-panel current-focused-panel"
              : "review-panel"
          }
          aria-labelledby="detected-bias-title"
          onMouseEnter={focusDetectedBiasPanel}
          onFocusCapture={focusDetectedBiasPanel}
        >
          <h2 id="detected-bias-title" className="panel-title" tabIndex={0}>
            List of Detected Bias
          </h2>

          {/* <p className="bias-count-details">
            You found {detectedStoryBias.count} biased paragraph
            {detectedStoryBias.count === 1 ? "" : "s"}.
          </p> */}

          {detectedItems.length === 0 ? (
            <p className="bias-empty">No bias detected yet.</p>
          ) : (
            <>
              <p className="keyboard-instructions">
                Review the list of your detected biases. Select Explain Bias
                Type button to learn more and get helpful examples.
              </p>
              <ol className="bias-list" aria-label="Detected bias">
                {detectedItems.map((item, index) => {
                  const key = `bias-${getIndex(item)}`;
                  const explanation = explanations[key];
                  const explanationId = `${key}-explanation`;

                  return (
                    <li key={`detected-${index}`} className="bias-item">
                      {/* <p className="bias-item-title">Bias {index + 1}</p> */}

                      {item.biasCategory && (
                        <p>
                          <strong>Bias type:</strong>{" "}
                          {getBiasCategoryName(item.biasCategory)} in paragraph{" "}
                          {getIndex(item) + 1}.
                        </p>
                      )}

                      <p className="bias-item-text">{getParagraph(item)}</p>

                      <button
                        type="button"
                        className="page-button"
                        onClick={() => fetchExplanationBiasType(item)}
                        aria-expanded={Boolean(explanation)}
                        aria-controls={explanationId}
                      >
                        {explanation ? "Hide Explanation" : "Explain Bias Type"}
                      </button>

                      {renderExplanation(key)}
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          <h2 className="panel-title">List of Marked Paragraphs</h2>

          {flaggedItems.length === 0 ? (
            <p className="bias-empty">No paragraphs marked yet.</p>
          ) : (
            <>
              <p className="keyboard-instructions">
                Review the list of marked paragraphs. Select Explain if Anything
                Wrong button to learn if any bias exists in a marked paragraph.
              </p>
              <ol className="bias-list" aria-label="Marked paragraphs">
                {flaggedItems.map((item, index) => {
                  const key = `wrong-${getIndex(item)}`;
                  const explanation = explanations[key];
                  const explanationId = `${key}-explanation`;

                  return (
                    <li key={`flagged-${index}`} className="bias-item">
                      <p className="bias-item-title">
                        <strong>Marked paragraph {getIndex(item) + 1}</strong>
                      </p>

                      <p className="bias-item-text">{getParagraph(item)}</p>

                      <button
                        type="button"
                        className="page-button"
                        onClick={() => fetchExplanationIfAnythingWrong(item)}
                        aria-expanded={Boolean(explanation)}
                        aria-controls={explanationId}
                      >
                        {explanation
                          ? "Hide Explanation"
                          : "Explain if Anything Wrong"}
                      </button>

                      {renderExplanation(key)}
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </section>
        <StoryReviewAliceFollowUpsPanel />
        <StoryReviewRephrasePromptPanel />
      </div>
    </main>
  );
};

export default StoryReviewPage;
