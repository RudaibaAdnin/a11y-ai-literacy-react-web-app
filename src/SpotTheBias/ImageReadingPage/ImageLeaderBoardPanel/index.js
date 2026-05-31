import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setCurrentFocusedImagePanel } from "../../ImageBiasReducer";
import "./index.css";

const ImageLeaderBoardPanel = () => {
  const dispatch = useDispatch();

  const {
    currentFocusedImagePanel,
    biasedImageDescriptionParagraphPlan,
    detectedImageDescriptionBiasParagraph,
    flaggedImageDescriptionParagraph,
  } = useSelector((state) => state.ImageBiasReducer);

  const detectedItems =
    detectedImageDescriptionBiasParagraph.imageDescriptionBiasItems;
  const flaggedItems =
    flaggedImageDescriptionParagraph.flaggedImageDescriptionParagraphItems;

  const focusPanel = () => {
    dispatch(setCurrentFocusedImagePanel("imageBiasLeaderBoardPanel"));
  };

  return (
    <section
      className={
        currentFocusedImagePanel === "imageBiasLeaderBoardPanel"
          ? "leaderboard-panel current-focused-panel"
          : "leaderboard-panel"
      }
      aria-labelledby="image-bias-scoreboard-title"
      onMouseEnter={focusPanel}
      onFocusCapture={focusPanel}
    >
      <h2 id="image-bias-scoreboard-title" className="panel-title" tabIndex={0}>
        Score Board
      </h2>

      <p className="leaderboard-count-details">
        You have found {detectedImageDescriptionBiasParagraph.count} out of{" "}
        {biasedImageDescriptionParagraphPlan.length} biased image description
        paragraphs.
      </p>

      <p className="leaderboard-count-details">
        You marked {flaggedImageDescriptionParagraph.count} paragraphs to review
        later.
      </p>

      {detectedItems.length > 0 && (
        <>
          <h3 className="leaderboard-section-title">List of Spotted Biases</h3>

          <ol
            className="leaderboard-list"
            aria-label="Detected biased image description paragraphs"
          >
            {detectedItems.map((item, index) => (
              <li
                key={item.imageDescriptionParagraphIndex}
                className="leaderboard-item"
                aria-labelledby={`detected-image-bias-${index + 1}`}
              >
                <p
                  id={`detected-image-bias-${index + 1}`}
                  className="leaderboard-item-title"
                >
                  {item.biasCategory.name} in Paragraph{" "}
                  {item.imageDescriptionParagraphIndex + 1}
                </p>

                <p className="leaderboard-item-text">{item.paragraph}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      {flaggedItems.length > 0 && (
        <>
          <h3 className="leaderboard-section-title">
            List of Marked Paragraphs
          </h3>

          <ol
            className="leaderboard-list"
            aria-label="Marked image description paragraphs"
          >
            {flaggedItems.map((item, index) => (
              <li
                key={item.imageDescriptionParagraphIndex}
                className="leaderboard-item"
                aria-labelledby={`marked-image-paragraph-${index + 1}`}
              >
                <p
                  id={`marked-image-paragraph-${index + 1}`}
                  className="leaderboard-item-title"
                >
                  Marked Paragraph {item.imageDescriptionParagraphIndex + 1}
                </p>

                <p className="leaderboard-item-text">{item.paragraph}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      {detectedItems.length === 0 && flaggedItems.length === 0 && (
        <p className="leaderboard-empty">No paragraphs found or marked yet.</p>
      )}
    </section>
  );
};

export default ImageLeaderBoardPanel;
