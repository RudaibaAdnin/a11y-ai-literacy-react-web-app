import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setCurrentFocusedImagePanel } from "../ImageBiasReducer";
import * as client from "./client.js";
import ImageReviewAliceFollowUpsPanel from "./ImageReviewAliceFollowUpsPanel";
// import ImageReviewRephrasePromptPanel from "./ImageReviewRephrasePromptPanel";
import "./index.css";

const ImageReviewPageStory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storytopic } = useParams();

  const detectedBiasRef = useRef(null);
  const loadingRef = useRef(null);
  const explanationRef = useRef(null);

  const [activeExplanationKey, setActiveExplanationKey] = useState("");
  const [explanations, setExplanations] = useState({});

  const {
    detectedImageDescriptionBiasParagraph,
    flaggedImageDescriptionParagraph,
    currentFocusedImagePanel,
  } = useSelector((state) => state.ImageBiasReducer);

  const detectedItems =
    detectedImageDescriptionBiasParagraph.imageDescriptionBiasItems || [];
  const flaggedItems =
    flaggedImageDescriptionParagraph.flaggedImageDescriptionParagraphItems ||
    [];

  const getParagraph = (item) => item.paragraph || "";
  const getIndex = (item) => item.imageDescriptionParagraphIndex ?? item.index;

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
      dispatch(setCurrentFocusedImagePanel("imageReviewDetectedBiasPanel"));
      detectedBiasRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const removeExplanation = (key) => {
    setActiveExplanationKey("");
    setExplanations((previous) => {
      const updated = { ...previous };
      delete updated[key];
      return updated;
    });
  };

  const fetchExplanationBiasType = async (item) => {
    const key = `image-bias-${getIndex(item)}`;

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
      const data = await client.explainImageBiasType({
        imageDescriptionParagraph: getParagraph(item),
        biasCategoryImage: item.biasCategory,
      });

      setExplanations((previous) => ({ ...previous, [key]: { data } }));
    } catch (error) {
      console.error("Could not explain image bias type:", error);
      setExplanations((previous) => ({
        ...previous,
        [key]: { error: "Sorry, I could not get the explanation." },
      }));
    }
  };

  const fetchExplanationIfAnythingWrong = async (item) => {
    const key = `image-wrong-${getIndex(item)}`;

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
      const data = await client.explainIfAnythingWrongImage({
        imageDescriptionParagraph: getParagraph(item),
      });

      setExplanations((previous) => ({ ...previous, [key]: { data } }));
    } catch (error) {
      console.error("Could not check image description paragraph:", error);
      setExplanations((previous) => ({
        ...previous,
        [key]: { error: "Sorry, I could not get the explanation." },
      }));
    }
  };

  const renderExplanation = (key) => {
    const explanation = explanations[key];
    const isActive = activeExplanationKey === key;

    if (explanation?.isLoading) {
      return (
        <p
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

    if (!explanation?.data) return null;

    return (
      <div
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
  };

  return (
    <main className="story-review-page" aria-labelledby="image-review-title">
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-bias-avatar.png"
            className="title-image"
            alt=""
          />
          <h1 id="image-review-title" className="page-title">
            Spot the Bias
          </h1>
        </div>

        <nav className="page-nav" aria-label="Image review page navigation">
          <Link className="page-button" to="/spot-the-bias">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section
        className={
          currentFocusedImagePanel === "imageReviewGuidePanel"
            ? "page-instructions current-focused-panel"
            : "page-instructions"
        }
        aria-labelledby="image-review-guide-title"
        onMouseEnter={() =>
          dispatch(setCurrentFocusedImagePanel("imageReviewGuidePanel"))
        }
        onFocusCapture={() =>
          dispatch(setCurrentFocusedImagePanel("imageReviewGuidePanel"))
        }
      >
        <h2
          id="image-review-guide-title"
          className="instruction-title"
          tabIndex={0}
        >
          Review Guide
        </h2>

        <p className="page-instructions">
          Great work! Now, it is time to review your image bias-spotting moves.
          Below, review each image bias you spotted, the paragraphs you marked,
          follow-up questions you asked Alice, and the prompts you used to make
          the image fairer.
        </p>

        <p className="page-instructions">
          Press the left square bracket key{" "}
          <span className="kbd" aria-hidden="true">
            [
          </span>{" "}
          to jump to the list of detected image bias panel. Press the right
          square bracket key{" "}
          <span className="kbd" aria-hidden="true">
            ]
          </span>{" "}
          to jump to review the list of follow-up questions you asked Alice.
          Press equal key{" "}
          <span className="kbd" aria-hidden="true">
            =
          </span>{" "}
          to jump to review the prompts you used to make the image fairer.
        </p>

        <button
          type="button"
          className="page-button"
          onClick={() => navigate(`/spot-the-bias/${storytopic}/image-reading`)}
        >
          Back to Image Page
        </button>
      </section>

      <div className="review-panels-container">
        <section
          ref={detectedBiasRef}
          tabIndex={-1}
          className={
            currentFocusedImagePanel === "imageReviewDetectedBiasPanel"
              ? "review-panel current-focused-panel"
              : "review-panel"
          }
          aria-labelledby="detected-image-bias-title"
          onMouseEnter={() =>
            dispatch(
              setCurrentFocusedImagePanel("imageReviewDetectedBiasPanel"),
            )
          }
          onFocusCapture={() =>
            dispatch(
              setCurrentFocusedImagePanel("imageReviewDetectedBiasPanel"),
            )
          }
        >
          <h2
            id="detected-image-bias-title"
            className="panel-title"
            tabIndex={0}
          >
            List of Detected Image Bias
          </h2>

          {detectedItems.length === 0 ? (
            <p className="bias-empty">No image bias detected yet.</p>
          ) : (
            <>
              <p className="keyboard-instructions">
                Review the list of detected image biases. Select Explain Bias
                Type button to learn more and get helpful examples.
              </p>

              <ol className="bias-list" aria-label="Detected image bias">
                {detectedItems.map((item, index) => {
                  const key = `image-bias-${getIndex(item)}`;
                  const explanation = explanations[key];

                  return (
                    <li key={`detected-image-${index}`} className="bias-item">
                      {item.biasCategory && (
                        <p>
                          <strong>Bias type:</strong> Paragraph{" "}
                          {getIndex(item) + 1}{" "}
                          {getBiasCategoryName(
                            item.biasCategory,
                          ).toLowerCase()}{" "}
                        </p>
                      )}

                      <p className="bias-item-text">{getParagraph(item)}</p>

                      <button
                        type="button"
                        className="page-button"
                        onClick={() => fetchExplanationBiasType(item)}
                        aria-expanded={Boolean(explanation)}
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
                Review the list of marked image description paragraphs. Select
                Explain if Anything Wrong button to learn if any bias exists in
                a marked paragraph.
              </p>

              <ol
                className="bias-list"
                aria-label="Marked image description paragraphs"
              >
                {flaggedItems.map((item, index) => {
                  const key = `image-wrong-${getIndex(item)}`;
                  const explanation = explanations[key];

                  return (
                    <li key={`flagged-image-${index}`} className="bias-item">
                      <p className="bias-item-title">
                        <strong>Marked paragraph {getIndex(item) + 1}</strong>
                      </p>

                      <p className="bias-item-text">{getParagraph(item)}</p>

                      <button
                        type="button"
                        className="page-button"
                        onClick={() => fetchExplanationIfAnythingWrong(item)}
                        aria-expanded={Boolean(explanation)}
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

        <ImageReviewAliceFollowUpsPanel />
        {/* <ImageReviewRephrasePromptPanel /> */}
      </div>
    </main>
  );
};

export default ImageReviewPageStory;
