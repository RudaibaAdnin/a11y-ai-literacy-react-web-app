import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  setStoryReading,
  setSelectedCheckingParagraph,
  setCurrentFocusedPanel,
} from "../SpotTheBiasReducer";
import { story_bias_categories } from "../util/StoryBiasCategoris.js";
import BiasCheckingPanel from "./BiasCheckingPanel";
import LeaderBoardPanel from "./LeaderBoardPanel";
import AgentAlicePanel from "./AgentAlicePanel";
import HelpGuidePanel from "./HelpGuidePanel";
import * as client from "./client.js";
import "./index.css";

const pickRandom = (items, count) =>
  [...items].sort(() => Math.random() - 0.5).slice(0, count);

const getParagraphText = (paragraph) =>
  paragraph?.rephrasedStoryParagraph || "";

const isInteractiveElement = (element) =>
  ["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) ||
  element.isContentEditable;

const getRandomBiasCategories = () => {
  const socialBiasNames = ["Gender bias", "Racial bias"];
  const disabilityBiasNames = ["Ableism bias", "Inspiration bias"];

  const selectedNames = [
    pickRandom(socialBiasNames, 1)[0],
    pickRandom(disabilityBiasNames, 1)[0],
  ];

  return selectedNames.map((name) => ({
    name,
    meaning: story_bias_categories[name].meaning,
    examples: story_bias_categories[name].examples,
  }));
};

const StoryReadingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storytopic } = useParams();

  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [showHelpGuidePanel, setShowHelpGuidePanel] = useState(false);

  const currentParagraphIndexRef = useRef(0);
  const loadingStoryRef = useRef(null);
  const missionGuideRef = useRef(null);
  const storyParagraphRefs = useRef([]);

  const {
    storyTopic,
    storyTopicType,
    storyQuestionsAndAnswers,
    storyParagraphs,
    selectedCheckingParagraph,
    currentFocusedPanel,
  } = useSelector((state) => state.SpotTheBiasReducer);

  const { imageUrl, imageDescriptionParagraphs } = useSelector(
    (state) => state.ImageBiasReducer,
  );

  const hasCreatedStoryImage =
    imageUrl || imageDescriptionParagraphs.length > 0;

  const moveToParagraph = useCallback((nextIndex) => {
    currentParagraphIndexRef.current = nextIndex;
    setCurrentParagraphIndex(nextIndex);
    requestAnimationFrame(() => storyParagraphRefs.current[nextIndex]?.focus());
  }, []);

  const loadStory = useCallback(async () => {
    const selectedBiasCategories = getRandomBiasCategories();

    try {
      setIsLoadingStory(true);
      moveToParagraph(0);

      const response = await client.getStoryReading(
        storyTopic,
        storyTopicType,
        storyQuestionsAndAnswers,
        selectedBiasCategories,
      );

      const biasedParagraphPlan = response.biasedParagraphPlan || [];

      dispatch(
        setStoryReading({
          storyParagraphs: response.storyParagraphs || [],
          biasedParagraphPlan,
          selectedBiasCategories,
          biasCount: selectedBiasCategories.length,
        }),
      );
      setIsLoadingStory(false);
    } catch (error) {
      console.error("Could not get story:", error);
      setIsLoadingStory(false);
    }
  }, [
    dispatch,
    storyTopic,
    storyTopicType,
    storyQuestionsAndAnswers,
    moveToParagraph,
  ]);

  useEffect(() => {
    if (storyParagraphs.length === 0) loadStory();
  }, [storyParagraphs.length, loadStory]);

  useEffect(() => {
    if (isLoadingStory) loadingStoryRef.current?.focus();
    else if (storyParagraphs.length > 0) missionGuideRef.current?.focus();
  }, [isLoadingStory, storyParagraphs.length]);

  useEffect(() => {
    const handleStoryKeyDown = (event) => {
      const activeElement = document.activeElement;

      const isTyping =
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "SELECT" ||
        activeElement?.isContentEditable;

      if (
        isTyping ||
        storyParagraphs.length === 0 ||
        (event.key !== "[" && event.key !== "]")
      ) {
        return;
      }

      event.preventDefault();

      const currentIndex = currentParagraphIndexRef.current;

      const nextIndex =
        (currentIndex + (event.key === "[" ? -1 : 1) + storyParagraphs.length) %
        storyParagraphs.length;

      moveToParagraph(nextIndex);
    };

    window.addEventListener("keydown", handleStoryKeyDown);

    return () => {
      window.removeEventListener("keydown", handleStoryKeyDown);
    };
  }, [storyParagraphs, moveToParagraph]);

  useEffect(() => {
    const openHelpGuide = (event) => {
      const tagName = event.target.tagName;

      if (
        event.key !== "?" ||
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        event.target.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      setShowHelpGuidePanel(true);
    };

    window.addEventListener("keydown", openHelpGuide);
    return () => window.removeEventListener("keydown", openHelpGuide);
  }, []);

  const focusMissionGuide = () => {
    dispatch(setCurrentFocusedPanel("pageInstructionsSection"));
  };

  const focusMiaPanel = () => {
    dispatch(setCurrentFocusedPanel("miaPanel"));
  };

  const focusStoryParagraph = (index) => {
    currentParagraphIndexRef.current = index;
    setCurrentParagraphIndex(index);
    // dispatch(setSelectedCheckingParagraph(null));
    dispatch(setCurrentFocusedPanel("miaPanel"));
  };

  const focusReviewGuide = () => {
    dispatch(setCurrentFocusedPanel("reviewGuideSection"));
  };

  const closeHelpGuidePanel = () => {
    setShowHelpGuidePanel(false);
    dispatch(setCurrentFocusedPanel("miaPanel"));
  };

  const saveStoryAsTextFile = () => {
    const storyText = storyParagraphs
      .map((paragraph, index) => {
        const paragraphText = getParagraphText(paragraph);
        return `${paragraphText}`;
      })
      .join("\n\n");

    const file = new Blob([storyText], { type: "text/plain" });
    const fileUrl = URL.createObjectURL(file);

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "story.txt";
    link.click();

    URL.revokeObjectURL(fileUrl);
  };

  return (
    <main className="story-reading-page" aria-labelledby="story-reading-title">
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-bias-avatar.png"
            className="title-image"
            alt=""
            aria-hidden="true"
          />
          <h1 id="story-reading-title" className="page-title" tabIndex={0}>
            Bias Buster
          </h1>
        </div>

        <nav className="page-nav" aria-label="Main menu navigation">
          <Link className="page-button" to="/bias-buster">
            Back to Menu
          </Link>
        </nav>
      </header>

      {isLoadingStory ? (
        <p
          ref={loadingStoryRef}
          tabIndex={-1}
          className="page-instructions current-focused-panel"
          role="status"
          aria-live="polite"
        >
          Loading the story. Mia is getting your story ready. This may take a
          little time.
        </p>
      ) : (
        <>
          <section
            ref={missionGuideRef}
            tabIndex={-1}
            className={
              currentFocusedPanel === "pageInstructionsSection"
                ? "instruction-section-style current-focused-panel"
                : "instruction-section-style"
            }
            aria-labelledby="creator-guide-title"
            onMouseEnter={focusMissionGuide}
            onFocusCapture={focusMissionGuide}
          >
            <h2
              id="creator-guide-title"
              className="instruction-title"
              tabIndex={0}
            >
              Coach Guide
            </h2>

            <p className="page-instructions" tabIndex={0}>
              Below, Mia has created the story using your ideas. But watch out!
              Two sneaky biases are hiding inside the story. Your task is to
              read each paragraph, spot the biased parts, and guide Mia to fix
              them. Need help? Ask Alice, another AI agent, for clues. Once you
              find a biased paragraph, guide Mia to rephrase it and make the
              story fairer. You can also mark a paragraph if something feels
              wrong, like having bias, even if the system does not confirm it.
              You can review it later. You can save the story as a text file.
            </p>
            <p className="page-instructions" tabIndex={0}>
              You can use headings to move around this game page, or select the
              <span className="kbd">Help Guide</span>button below to open the
              help guide modal to learn more keyboard shortcuts you can use.
            </p>

            <button
              type="button"
              className="page-button"
              onClick={() => setShowHelpGuidePanel(true)}
            >
              Help Guide
            </button>
          </section>

          <div className="side-by-side-page">
            <section
              className={
                currentFocusedPanel === "miaPanel"
                  ? "mia-panel current-focused-panel"
                  : "mia-panel"
              }
              aria-labelledby="mia-panel-title"
              onMouseEnter={focusMiaPanel}
              onFocusCapture={focusMiaPanel}
            >
              <h2 id="mia-panel-title" className="panel-title" tabIndex={0}>
                Mia’s Created Story
              </h2>

              <p className="keyboard-instructions">
                You can move through the story below paragraph by paragraph.
                Each paragraph is a button. Spot a sneaky bias? Press{" "}
                <span className="kbd">Enter</span> to check your guess and
                rephrase the paragraph. You can also mark a paragraph if
                something feels unfair and review it later. You can also press
                the left square bracket key{" "}
                <span className="kbd" aria-hidden="true">
                  [
                </span>{" "}
                and the right square bracket key{" "}
                <span className="kbd" aria-hidden="true">
                  ]
                </span>{" "}
                to move paragraph by paragraph.
              </p>

              <ol className="story-paragraph-list" aria-label="Mia's story">
                {storyParagraphs.map((paragraph, index) => {
                  const paragraphText = getParagraphText(paragraph);

                  return (
                    <li key={paragraph.index}>
                      <button
                        type="button"
                        ref={(element) => {
                          storyParagraphRefs.current[index] = element;
                        }}
                        tabIndex={index === currentParagraphIndex ? 0 : -1}
                        className={
                          index === currentParagraphIndex
                            ? "story-paragraph current-focused-panel"
                            : "story-paragraph"
                        }
                        aria-label={`Paragraph ${index + 1} of ${
                          storyParagraphs.length
                        }. ${paragraphText}. Press Enter to check this paragraph.`}
                        onFocus={() => focusStoryParagraph(index)}
                        onClick={() => {
                          focusStoryParagraph(index);
                          dispatch(setSelectedCheckingParagraph(paragraph));
                        }}
                        onMouseEnter={() => focusStoryParagraph(index)}
                      >
                        {paragraphText}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div className="save-story-button">
                <button
                  type="button"
                  className="page-button"
                  onClick={saveStoryAsTextFile}
                  disabled={storyParagraphs.length === 0}
                >
                  Save Story as Text File
                </button>
              </div>
            </section>

            <LeaderBoardPanel />
            <BiasCheckingPanel />
          </div>

          <AgentAlicePanel />

          {showHelpGuidePanel && (
            <HelpGuidePanel onClose={closeHelpGuidePanel} />
          )}

          <section
            tabIndex={-1}
            className={
              currentFocusedPanel === "reviewGuideSection"
                ? "instruction-section-style current-focused-panel"
                : "instruction-section-style"
            }
            aria-labelledby="review-guide-title"
            onMouseEnter={focusReviewGuide}
            onFocusCapture={focusReviewGuide}
          >
            <h2
              id="review-guide-title"
              className="go-to-review-title"
              tabIndex={0}
            >
              Select below buttons to ask Mia to create story image and to
              review your bias-fixing moves and get explanations.
            </h2>

            <div
              className="instruction-buttons"
              role="group"
              aria-label="Story image and review options"
            >
              <button
                type="button"
                className="page-button"
                onClick={() =>
                  navigate(`/bias-buster/${storytopic}/image-reading`)
                }
              >
                {hasCreatedStoryImage
                  ? "Go to Story Image Page"
                  : "Create Story Image"}
              </button>

              <button
                type="button"
                className="page-button"
                onClick={() =>
                  navigate(`/bias-buster/${storytopic}/review-page`)
                }
              >
                Review Your Story Bias-Fixing Moves
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default StoryReadingPage;
