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
          biasedParagraphIndices: biasedParagraphPlan.map(
            (item) => item.paragraphIndex,
          ),
          biasedParagraphCount: biasedParagraphPlan.length,
          selectedBiasCategories,
          biasCount: selectedBiasCategories.length,
        }),
      );
    } catch (error) {
      console.error("Could not get story:", error);
    } finally {
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
      if (
        storyParagraphs.length === 0 ||
        !["[", "]", "Enter"].includes(event.key)
      ) {
        return;
      }

      if (event.key === "Enter" && selectedCheckingParagraph?.index !== null) {
        return;
      }

      event.preventDefault();

      const currentIndex = currentParagraphIndexRef.current;

      if (event.key === "Enter") {
        dispatch(setSelectedCheckingParagraph(storyParagraphs[currentIndex]));
        return;
      }

      dispatch(setSelectedCheckingParagraph(null));
      dispatch(setCurrentFocusedPanel("miaPanel"));

      const nextIndex =
        (currentIndex + (event.key === "[" ? -1 : 1) + storyParagraphs.length) %
        storyParagraphs.length;

      moveToParagraph(nextIndex);
    };

    window.addEventListener("keydown", handleStoryKeyDown);
    return () => window.removeEventListener("keydown", handleStoryKeyDown);
  }, [
    dispatch,
    storyParagraphs,
    selectedCheckingParagraph?.index,
    moveToParagraph,
  ]);

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

  const closeHelpGuidePanel = () => {
    setShowHelpGuidePanel(false);
    dispatch(setCurrentFocusedPanel("miaPanel"));
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
          />
          <h1 id="story-reading-title" className="page-title">
            Spot the Bias
          </h1>
        </div>

        <nav className="page-nav" aria-label="Main menu navigation">
          <Link className="page-button" to="/spot-the-bias">
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
          Loading the story. Mia is getting your story ready...
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
            aria-labelledby="mission-guide-title"
            onMouseEnter={focusMissionGuide}
            onFocusCapture={focusMissionGuide}
          >
            <h2
              id="mission-guide-title"
              className="instruction-title"
              tabIndex={0}
            >
              Creator Guide
            </h2>

            <p className="page-instructions">
              Below, Mia has created the story using your ideas. But watch out!
              Two sneaky biases are hiding in the story. Your challenge is to
              read each paragraph and spot the biased parts. Need help? Ask
              Alice, another AI agent, for clues. Once you find a biased
              paragraph, ask Mia to rephrase it and make the story fairer.
            </p>

            <div
              className="instruction-buttons"
              role="group"
              aria-label="Navigation options"
            >
              <button
                type="button"
                className="page-button"
                onClick={() => setShowHelpGuidePanel(true)}
              >
                Help Guide
              </button>

              <button type="button" className="page-button">
                Create Image of the Story
              </button>

              <button
                type="button"
                className="page-button"
                onClick={() =>
                  navigate(`/spot-the-bias/${storytopic}/review-page`)
                }
              >
                Review Your Bias-Spotting Moves
              </button>
            </div>
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
              <h2 id="mia-panel-title" className="panel-title">
                Mia’s Created Story
              </h2>

              <p className="keyboard-instructions">
                Press the left square bracket key{" "}
                <span className="kbd" aria-hidden="true">
                  [
                </span>{" "}
                and the right square bracket key{" "}
                <span className="kbd" aria-hidden="true">
                  ]
                </span>{" "}
                to move through the story paragraph by paragraph. Spot a sneaky
                bias? Press <span className="kbd">Enter</span> to check your
                guess and rephrase the paragraph. You can also mark a paragraph
                if something feels unfair and review it later.
              </p>

              <ol className="story-paragraph-list" aria-label="Mia's story">
                {storyParagraphs.map((paragraph, index) => {
                  const paragraphText = getParagraphText(paragraph);

                  return (
                    <li
                      key={paragraph.index}
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
                    >
                      {paragraphText}
                    </li>
                  );
                })}
              </ol>
            </section>

            <LeaderBoardPanel />
            <BiasCheckingPanel />
          </div>

          <AgentAlicePanel />

          {showHelpGuidePanel && (
            <HelpGuidePanel onClose={closeHelpGuidePanel} />
          )}
        </>
      )}
    </main>
  );
};

export default StoryReadingPage;
