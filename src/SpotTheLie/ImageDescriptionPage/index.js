import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./index.css";
import { imageDescriptions } from "../util/imageDescriptions.js";
import { imageHallucinations } from "../util/imageHallucinations.js";
import {
  setSelectedImage,
  setSelectedCheckingLine,
  setCurrentFocusedPanel,
  setCurrentImageDescriptionLine,
} from "../SpotTheLieReducer";
import HallucinationCheckingPanel from "./HallucinationCheckingPanel";
import LeaderBoardPanel from "./LeaderBoardPanel";
import AgentSaraPanel from "./AgentSaraPanel";
import HelpGuidePanel from "./HelpGuidePanel";

const ImageDescriptionPage = () => {
  const { imagecategory, imagename } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedImageDescription = imageDescriptions[imagename] || [];
  const selectedImageHallucinations = imageHallucinations[imagename] || [];

  const currentFocusedPanel = useSelector(
    (state) => state.SpotTheLieReducer.currentFocusedPanel,
  );

  const currentImageDescriptionLineIndex = useSelector(
    (state) => state.SpotTheLieReducer.currentImageDescriptionLineIndex,
  );

  const currentImageDescriptionLine =
    selectedImageDescription[currentImageDescriptionLineIndex];

  const imageDescriptionLineByLineArray = useRef([]);

  const selectedImageName = useSelector(
    (state) => state.SpotTheLieReducer.selectedImageName,
  );

  const [showHelpGuidePanel, setShowHelpGuidePanel] = useState(false);

  useEffect(() => {
    if (selectedImageName === imagename) return;
    dispatch(
      setSelectedImage({
        imageName: imagename,
        imageDescription: selectedImageDescription,
        imageHallucinations: selectedImageHallucinations,
      }),
    );
  }, [
    dispatch,
    imagename,
    selectedImageDescription,
    selectedImageHallucinations,
  ]);

  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if (
        selectedImageDescription.length === 0 ||
        (event.key !== "[" && event.key !== "]")
      ) {
        return;
      }

      event.preventDefault();

      const direction = event.key === "[" ? -1 : 1;

      const nextIndex =
        (currentImageDescriptionLineIndex +
          direction +
          selectedImageDescription.length) %
        selectedImageDescription.length;

      const nextLine = selectedImageDescription[nextIndex];

      dispatch(
        setCurrentImageDescriptionLine({
          index: nextIndex,
          line: nextLine,
        }),
      );
      requestAnimationFrame(() => {
        imageDescriptionLineByLineArray.current[nextIndex]?.focus();
      });
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [dispatch, selectedImageDescription, currentImageDescriptionLineIndex]);

  const focusPageInstructionsSectionSection = () => {
    dispatch(setCurrentFocusedPanel("pageInstructionsSection"));
  };
  const focusSaraImageDescriptionPanel = () => {
    dispatch(setCurrentFocusedPanel("saraImageDescriptionPanel"));
  };

  const openHelpGuidePanel = () => {
    setShowHelpGuidePanel(true);
    dispatch(setCurrentFocusedPanel("helpGuidePanel"));
  };

  const closeHelpGuidePanel = () => {
    setShowHelpGuidePanel(false);
  };

  useEffect(() => {
    const handleHelpGuideKey = (event) => {
      if (event.key !== "?") return;

      event.preventDefault();
      setShowHelpGuidePanel(true);
      dispatch(setCurrentFocusedPanel("helpGuidePanel"));
    };

    window.addEventListener("keydown", handleHelpGuideKey);

    return () => {
      window.removeEventListener("keydown", handleHelpGuideKey);
    };
  }, [dispatch]);

  return (
    <main
      className="main-style"
      // Accessibility: labels the main page using the visible h1.
      aria-labelledby="image-description-page-title"
    >
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-lie-avatar.png"
            className="title-image"
            alt=""
          />

          {/* Accessibility: added id so main can use this heading as its label. */}
          <h1 id="image-description-page-title" className="page-title">
            Spot the Lie
          </h1>
        </div>

        {/* Accessibility: changed nav label from review page to game page navigation. */}
        <nav className="page-nav" aria-label="Main menu page navigation">
          <Link className="page-button" to="/spot-the-lie">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section
        className={
          currentFocusedPanel === "pageInstructionsSection"
            ? "instruction-section-style current-focused-panel"
            : "instruction-section-style"
        }
        // Accessibility change: labels the section using the visible h2.
        aria-labelledby="mission-guide-title"
        onMouseEnter={focusPageInstructionsSectionSection}
        onFocusCapture={focusPageInstructionsSectionSection}
      >
        <h2 id="mission-guide-title" className="instruction-title" tabIndex={0}>
          Mission Guide
        </h2>

        <p className="page-instructions">
          Below, an AI agent named Sara has described the image for you. Your
          detective mission is simple: read Sara's description and find three
          sneaky lies hiding inside it. Need help? You can ask Sara follow-up
          questions like a detective. You can also ask Adam, another AI agent,
          for a second description and compare both descriptions. But watch out!
          AI agents can make mistakes too, so use your detective brain.
        </p>

        <div
          className="instruction-buttons"
          // Accessibility change: groups the guide/review controls.
          role="group"
          aria-label="Navigation options"
        >
          <button
            type="button"
            className="page-button"
            onClick={openHelpGuidePanel}
          >
            Help Guide
          </button>
          <button
            type="button"
            className="page-button"
            onClick={() =>
              navigate(
                `/spot-the-lie/${imagecategory}/${imagename}/review-page`,
              )
            }
          >
            Review Your Detective Moves
          </button>
        </div>
      </section>

      <div className="side-by-side-page">
        <section className="sara-panel">
          <section
            className={
              currentFocusedPanel === "saraImageDescriptionPanel"
                ? "sara-description-section current-focused-panel"
                : "sara-description-section"
            }
            aria-label="Sara AI image description"
            onMouseEnter={focusSaraImageDescriptionPanel}
            onFocusCapture={focusSaraImageDescriptionPanel}
          >
            <h2 className="panel-title" tabIndex={0}>
              Sara: AI Image Description
            </h2>

            {selectedImageDescription.length === 0 ? (
              <p>No description available for this image yet.</p>
            ) : (
              <>
                <p className="keyboard-instructions">
                  Press the left square bracket key
                  <span className="kbd">[</span> and the right square bracket
                  key <span className="kbd">]</span> to read the image
                  description line by line. Spot a sneaky lie? Press{" "}
                  <span className="kbd">Enter</span> key to check your guess.
                </p>

                <ol
                  className="image-description-list"
                  aria-label="Image description"
                >
                  {selectedImageDescription.map((line, i) => (
                    <li
                      key={i}
                      ref={(element) => {
                        imageDescriptionLineByLineArray.current[i] = element;
                      }}
                      tabIndex={i === currentImageDescriptionLineIndex ? 0 : -1}
                      className="image-description-line"
                      aria-label={`Line ${i + 1} of ${
                        selectedImageDescription.length
                      }. ${line}. Press Enter to check this line.`}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          dispatch(setSelectedCheckingLine(line));
                        }
                      }}
                    >
                      {line}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>
          <AgentSaraPanel />
        </section>

        <HallucinationCheckingPanel />
        <LeaderBoardPanel />
        {showHelpGuidePanel && <HelpGuidePanel onClose={closeHelpGuidePanel} />}
      </div>
    </main>
  );
};

export default ImageDescriptionPage;
