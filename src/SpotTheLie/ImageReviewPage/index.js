import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { setCurrentFocusedPanel } from "../SpotTheLieReducer";
import ReviewDetectiveFollowUpsPanel from "./ReviewDetectiveFollowupsPanel";

const ImageReviewPage = () => {
  const { imagecategory, imagename } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const detectedLiesPanelRef = useRef(null);

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  const selectedImageHallucinations = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageHallucinations,
  );

  const detectedImageHallucination = useSelector(
    (state) => state.SpotTheLieReducer.detectedImageHallucination,
  );

  const detectedItems = detectedImageHallucination.imageHallucinationItems;
  const [lieTypeExplanations, setLieTypeExplanations] = useState({});

  const focusReviewGuidePanel = () => {
    dispatch(setCurrentFocusedPanel("reviewGuidePanel"));
  };

  const focusDetectedLiesPanel = () => {
    dispatch(setCurrentFocusedPanel("reviewDetectedLiesPanel"));
  };

  const fetchExplanationExamplesLieType = (
    hallucinatedLine,
    accurateLine,
    cause,
    type,
  ) => {
    setLieTypeExplanations((previousExplanations) => {
      if (previousExplanations[hallucinatedLine]) {
        const updatedExplanations = { ...previousExplanations };
        delete updatedExplanations[hallucinatedLine];
        return updatedExplanations;
      }

      return {
        ...previousExplanations,
        [hallucinatedLine]: `This is a ${type} lie. Sara said "${hallucinatedLine}", but the better description is "${accurateLine}". The clue is: ${cause}`,
      };
    });
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

        <nav className="page-nav" aria-label="Review page navigation">
          <Link className="page-button" to="/spot-the-lie">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section
        className={
          currentFocusedPanel === "reviewGuidePanel"
            ? "page-instructions current-focused-panel"
            : "page-instructions "
        }
        aria-labelledby="review-guide-title"
        onMouseEnter={focusReviewGuidePanel}
        onFocusCapture={focusReviewGuidePanel}
      >
        <h2 id="review-guide-title" className="instruction-title" tabIndex={0}>
          Review Guide
        </h2>

        <p className="page-instructions">Now, review your detective moves.</p>

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
              {" "}
              <p className="keyboard-instructions">
                Look back at the lies you found in Sara's image description.
                Select the Explain this lie type button to learn more about each
                lie.
              </p>
              <ol className="lie-list" aria-label="Detected lies">
                {detectedItems.map((item, index) => (
                  <li key={item.hallucinatedLine} className="lie-item">
                    <h3 className="lie-item-title">Lie {index + 1}:</h3>

                    <p className="lie-item-text">
                      The sentence{" "}
                      <span className="hallucinated-line-text">
                        {item.hallucinatedLine.replace(/\.$/, "").toLowerCase()}
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
                          item.cause,
                          item.type,
                        )
                      }
                    >
                      {lieTypeExplanations[item.hallucinatedLine]
                        ? "Hide explanation"
                        : "Explain this lie type"}
                    </button>

                    {lieTypeExplanations[item.hallucinatedLine] && (
                      <p className="lie-type-explanation">
                        {lieTypeExplanations[item.hallucinatedLine]}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>

        <ReviewDetectiveFollowUpsPanel />
      </div>
    </main>
  );
};

export default ImageReviewPage;
