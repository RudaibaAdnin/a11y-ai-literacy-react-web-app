import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../SpotTheLieReducer";
import ReviewDetectiveFollowUpsPanel from "./ReviewDetectiveFollowupsPanel";
import * as client from "./client.js";

const ImageReviewPage = () => {
  const { imagecategory, imagename } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const detectedLiesPanelRef = useRef(null);
  const loadingRef = useRef(null);
  const explanationRef = useRef(null);

  const [activeExplanationLine, setActiveExplanationLine] = useState(null);
  const [lieTypeExplanations, setLieTypeExplanations] = useState({});

  const {
    currentFocusedPanel,
    selectedImageHallucinations,
    detectedImageHallucination,
  } = useSelector((state) => state.SpotTheLieReducer);

  const detectedItems = detectedImageHallucination.imageHallucinationItems;

  const focusReviewGuidePanel = () => {
    dispatch(setCurrentFocusedPanel("reviewGuidePanel"));
  };

  const focusDetectedLiesPanel = () => {
    dispatch(setCurrentFocusedPanel("reviewDetectedLiesPanel"));
  };

  useEffect(() => {
    const explanation = lieTypeExplanations[activeExplanationLine];
    if (!explanation) return;

    requestAnimationFrame(() => {
      if (explanation.isLoading) loadingRef.current?.focus();
      else explanationRef.current?.focus();
    });
  }, [lieTypeExplanations, activeExplanationLine]);

  const fetchExplanationExamplesLieType = async (
    hallucinatedLine,
    accurateLine,
    hallucinationType,
  ) => {
    if (lieTypeExplanations[hallucinatedLine]) {
      setActiveExplanationLine(null);

      setLieTypeExplanations((previousExplanations) => {
        const updatedExplanations = { ...previousExplanations };
        delete updatedExplanations[hallucinatedLine];
        return updatedExplanations;
      });

      return;
    }

    setActiveExplanationLine(hallucinatedLine);

    setLieTypeExplanations((previousExplanations) => ({
      ...previousExplanations,
      [hallucinatedLine]: { isLoading: true },
    }));

    try {
      const data = await client.explainHallucinationType(
        hallucinationType,
        hallucinatedLine,
        accurateLine,
      );

      setLieTypeExplanations((previousExplanations) => ({
        ...previousExplanations,
        [hallucinatedLine]: { data },
      }));
    } catch (error) {
      console.error("Could not get lie type explanation:", error);

      setLieTypeExplanations((previousExplanations) => ({
        ...previousExplanations,
        [hallucinatedLine]: {
          error: "Sorry, I could not get the explanation.",
        },
      }));
    }
  };

  useEffect(() => {
    const handleDetectedLiesFocusKey = (event) => {
      if (event.key !== "[") return;

      event.preventDefault();
      dispatch(setCurrentFocusedPanel("reviewDetectedLiesPanel"));
      detectedLiesPanelRef.current?.focus();
    };

    window.addEventListener("keydown", handleDetectedLiesFocusKey);

    return () => {
      window.removeEventListener("keydown", handleDetectedLiesFocusKey);
    };
  }, [dispatch]);

  return (
    <main className="image-review-page" aria-labelledby="review-page-title">
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-lie-avatar.png"
            className="title-image"
            alt=""
          />
          <h1 id="review-page-title" className="page-title">
            Spot the Lie
          </h1>
        </div>

        <nav className="page-nav" aria-label="Main menu navigation">
          <Link className="page-button" to="/spot-the-lie">
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
        onMouseEnter={focusReviewGuidePanel}
        onFocusCapture={focusReviewGuidePanel}
      >
        <h2 id="review-guide-title" className="instruction-title" tabIndex={0}>
          Review Guide
        </h2>

        <p className="page-instructions">
          Great detective work! Now it is time to review your detective moves.
          Look back at each lie you found and the detective questions you asked
          Sara. You can select the explanation buttons to learn more and get
          helpful examples. You can use headings to move around the review page.
          Press the left square bracket key{" "}
          <span className="kbd" aria-label="left square bracket key">
            [
          </span>{" "}
          to go to review the list of detected lies and press equal key{" "}
          <span className="kbd" aria-label="equal key">
            =
          </span>{" "}
          to go to review the detective follow-up questions you asked Sara.
          Press the below Back to Game Page button to go to the spot the lie
          game page with image description.
        </p>

        <button
          type="button"
          className="page-button"
          onClick={() =>
            navigate(`/spot-the-lie/${imagecategory}/${imagename}`)
          }
        >
          Back to Game Page
        </button>
      </section>

      <div className="review-panels-container">
        <section
          ref={detectedLiesPanelRef}
          tabIndex={-1}
          className={
            currentFocusedPanel === "reviewDetectedLiesPanel"
              ? "review-panel current-focused-panel"
              : "review-panel"
          }
          aria-labelledby="detected-lies-title"
          onMouseEnter={focusDetectedLiesPanel}
          onFocusCapture={focusDetectedLiesPanel}
        >
          <h2 id="detected-lies-title" className="panel-title" tabIndex={0}>
            List of Detected Lies
          </h2>

          <p className="lie-count-details">
            You found {detectedImageHallucination.count} out of{" "}
            {selectedImageHallucinations.length} lies.
          </p>

          {detectedItems.length === 0 ? (
            <p className="lie-empty">No lies detected yet.</p>
          ) : (
            <>
              <p className="keyboard-instructions">
                Look back at the lies you found in Sara's image description.
                Select the Explain this lie type button to learn more about each
                lie.
              </p>

              <ol className="lie-list" aria-label="Detected lies">
                {detectedItems.map((item, index) => {
                  const explanation =
                    lieTypeExplanations[item.hallucinatedLine];

                  const isActive =
                    activeExplanationLine === item.hallucinatedLine;

                  return (
                    <li key={item.hallucinatedLine} className="lie-item">
                      <p className="lie-item-title">Lie {index + 1}:</p>

                      <p className="lie-item-text">
                        The sentence{" "}
                        <span className="hallucinated-line-text">
                          {item.hallucinatedLine
                            .replace(/\.$/, "")
                            .toLowerCase()}
                        </span>{" "}
                        has a lie because {item.cause.toLowerCase()}
                      </p>

                      <p>
                        <strong>Type of lie:</strong> {item.type}
                      </p>

                      <button
                        type="button"
                        className="page-button"
                        onClick={() =>
                          fetchExplanationExamplesLieType(
                            item.hallucinatedLine,
                            item.accurateLine,
                            item.type,
                          )
                        }
                        aria-expanded={Boolean(explanation)}
                        aria-label={
                          explanation
                            ? `Hide explanation for lie ${index + 1}`
                            : `Explain lie type for lie ${index + 1}`
                        }
                      >
                        {explanation
                          ? "Hide Explanation"
                          : "Explain this Lie Type"}
                      </button>

                      {explanation?.isLoading && (
                        <p
                          ref={isActive ? loadingRef : null}
                          tabIndex={-1}
                          className="lie-type-explanation"
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
                          className="lie-type-explanation"
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
                          className="lie-type-explanation"
                          aria-live="polite"
                        >
                          <p>{explanation.data.explanation}</p>

                          <p>
                            <strong>Example:</strong> {explanation.data.example}
                          </p>

                          <p>{explanation.data.exampleExplanation}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </section>

        <ReviewDetectiveFollowUpsPanel />
        <button
          type="button"
          className="page-button"
          onClick={() =>
            navigate(`/spot-the-lie/${imagecategory}/${imagename}`)
          }
        >
          Back to Game Page
        </button>
      </div>
    </main>
  );
};

export default ImageReviewPage;
