import React, { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../SpotTheBiasReducer";

const StoryReviewPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storytopic } = useParams();
  const detectedBiasRef = useRef(null);

  const { detectedStoryBias, flaggedStoryParagraph, currentFocusedPanel } =
    useSelector((state) => state.SpotTheBiasReducer);

  const detectedItems = detectedStoryBias.storyBiasItems || [];
  const flaggedItems = flaggedStoryParagraph.flaggedStoryParagraphItems || [];

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

  const getParagraph = (item) => item.paragraph || item.markedParagraph || "";
  const getIndex = (item) => item.paragraphIndex ?? item.index;

  const getBiasCategoryName = (biasCategory) => {
    if (!biasCategory) return "";
    if (typeof biasCategory === "string") return biasCategory;
    return biasCategory.name || "";
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
          Great detective work! Now review the bias you found and the paragraphs
          you marked. Press the left square bracket key{" "}
          <span className="kbd" aria-label="left square bracket key">
            [
          </span>{" "}
          to jump to the list of detected bias.
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

          <p className="bias-count-details">
            You found {detectedStoryBias.count} biased paragraph
            {detectedStoryBias.count === 1 ? "" : "s"}.
          </p>

          {detectedItems.length === 0 ? (
            <p className="bias-empty">No bias detected yet.</p>
          ) : (
            <ol className="bias-list" aria-label="Detected bias">
              {detectedItems.map((item, index) => (
                <li key={`detected-${index}`} className="bias-item">
                  <h3 className="bias-item-title">Detected Bias {index + 1}</h3>

                  {getIndex(item) !== undefined && (
                    <p>
                      <strong>Paragraph:</strong> {getIndex(item) + 1}
                    </p>
                  )}

                  <p className="bias-item-text">{getParagraph(item)}</p>

                  {item.biasCategory && (
                    <p>
                      <strong>Bias type:</strong>{" "}
                      {getBiasCategoryName(item.biasCategory)}
                    </p>
                  )}

                  {item.explanation && <p>{item.explanation}</p>}
                </li>
              ))}
            </ol>
          )}

          <h2 className="panel-title">Marked Paragraphs</h2>

          {flaggedItems.length === 0 ? (
            <p className="bias-empty">No paragraphs marked yet.</p>
          ) : (
            <ol className="bias-list" aria-label="Marked paragraphs">
              {flaggedItems.map((item, index) => (
                <li key={`flagged-${index}`} className="bias-item">
                  <h3 className="bias-item-title">
                    Marked Paragraph {index + 1}
                  </h3>

                  {getIndex(item) !== undefined && (
                    <p>
                      <strong>Paragraph:</strong> {getIndex(item) + 1}
                    </p>
                  )}

                  <p className="bias-item-text">{getParagraph(item)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
};

export default StoryReviewPage;
