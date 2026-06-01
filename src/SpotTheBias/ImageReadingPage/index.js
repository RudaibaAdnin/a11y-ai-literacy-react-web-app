import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  setImageDescriptionReading,
  setSelectedCheckingImageDescriptionParagraph,
  setCurrentFocusedImagePanel,
} from "../ImageBiasReducer";
import { image_bias_categories } from "../util/ImageBiasCategories.js";
import * as client from "./client.js";
import "./index.css";

import ImageHelpGuidePanel from "./ImageHelpGuidePanel/index.js";
import ImageBiasCheckingPanel from "./ImageBiasCheckingPanel/index.js";
import ImageLeaderBoardPanel from "./ImageLeaderBoardPanel/index.js";
import ImageAgentAlicePanel from "./ImageAgentAlicePanel/index.js";

import ImageCraftPromptRephrase from "./ImageCraftPromptRephrase/index.js";

const pickRandom = (items, count) =>
  [...items].sort(() => Math.random() - 0.5).slice(0, count);

const getParagraphText = (paragraph) =>
  paragraph?.newImageDescriptionParagraph || "";

const getRandomImageBiasCategory = () => {
  const name = pickRandom(Object.keys(image_bias_categories), 1)[0];

  return {
    name,
    meaning: image_bias_categories[name].meaning,
    examples: image_bias_categories[name].examples,
  };
};

const ImageReadingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storytopic } = useParams();

  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [showHelpGuidePanel, setShowHelpGuidePanel] = useState(false);

  const currentParagraphIndexRef = useRef(0);
  const loadingRef = useRef(null);
  const guideRef = useRef(null);
  const paragraphRefs = useRef([]);

  const { storyParagraphs } = useSelector((state) => state.SpotTheBiasReducer);

  const {
    imageUrl,
    imagePrompt,
    imageDescriptionParagraphs,
    selectedCheckingImageDescriptionParagraph,
    currentFocusedImagePanel,
  } = useSelector((state) => state.ImageBiasReducer);

  const moveToParagraph = useCallback((nextIndex) => {
    currentParagraphIndexRef.current = nextIndex;
    setCurrentParagraphIndex(nextIndex);
    requestAnimationFrame(() => paragraphRefs.current[nextIndex]?.focus());
  }, []);

  const focusImageDescriptionParagraph = (index) => {
    currentParagraphIndexRef.current = index;
    setCurrentParagraphIndex(index);
    dispatch(setSelectedCheckingImageDescriptionParagraph(null));
    dispatch(setCurrentFocusedImagePanel("miaImagePanel"));
  };

  const openImagePromptRephrasePanel = () => {
    dispatch(setSelectedCheckingImageDescriptionParagraph(null));
    dispatch(setCurrentFocusedImagePanel("imageCraftPromptRephrasePanel"));
  };

  const loadImageReading = useCallback(async () => {
    const selectedImageBiasCategory = getRandomImageBiasCategory();

    try {
      setIsLoadingImage(true);
      moveToParagraph(0);

      const imagePromptResponse = await client.getImageGenerationPrompt(
        storyParagraphs.slice(0, 2).map((item) => item.originalStoryParagraph),
        [selectedImageBiasCategory],
      );

      const imageReading = await client.getImageDescription(
        imagePromptResponse.imagePrompt.originalPrompt,
        [selectedImageBiasCategory],
      );

      dispatch(
        setImageDescriptionReading({
          imageUrl: imageReading.imageBase64 || "",
          imagePrompt: imagePromptResponse.imagePrompt || {},
          imageDescriptionParagraphs:
            imageReading.imageDescriptionParagraphs || [],
          selectedImageBiasCategories: [selectedImageBiasCategory],
          biasedImageDescriptionParagraphPlan:
            imageReading.biasedImageDescriptionParagraphPlan || [],
          biasImageDescriptionCount:
            imageReading.biasedImageDescriptionParagraphPlan?.length || 0,
        }),
      );
      setIsLoadingImage(false);
    } catch (error) {
      console.error("Could not get image reading:", error);
      setIsLoadingImage(false);
    }
  }, [dispatch, storyParagraphs, moveToParagraph]);

  useEffect(() => {
    if (storyParagraphs.length > 0 && imageDescriptionParagraphs.length === 0) {
      loadImageReading();
    }
  }, [
    storyParagraphs.length,
    imageDescriptionParagraphs.length,
    loadImageReading,
  ]);

  useEffect(() => {
    if (isLoadingImage) loadingRef.current?.focus();
    else if (imageDescriptionParagraphs.length > 0) guideRef.current?.focus();
  }, [isLoadingImage, imageDescriptionParagraphs.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "?") {
        event.preventDefault();
        setShowHelpGuidePanel(true);
        return;
      }

      if (
        showHelpGuidePanel ||
        imageDescriptionParagraphs.length === 0 ||
        !["[", "]", "Enter"].includes(event.key)
      ) {
        return;
      }

      if (
        event.key === "Enter" &&
        selectedCheckingImageDescriptionParagraph?.index !== null
      ) {
        return;
      }

      event.preventDefault();

      const currentIndex = currentParagraphIndexRef.current;

      if (event.key === "Enter") {
        dispatch(
          setSelectedCheckingImageDescriptionParagraph(
            imageDescriptionParagraphs[currentIndex],
          ),
        );
        return;
      }

      dispatch(setSelectedCheckingImageDescriptionParagraph(null));
      dispatch(setCurrentFocusedImagePanel("miaImagePanel"));

      moveToParagraph(
        (currentIndex +
          (event.key === "[" ? -1 : 1) +
          imageDescriptionParagraphs.length) %
          imageDescriptionParagraphs.length,
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    dispatch,
    imageDescriptionParagraphs,
    selectedCheckingImageDescriptionParagraph?.index,
    showHelpGuidePanel,
    moveToParagraph,
  ]);

  const focusGuide = () =>
    dispatch(setCurrentFocusedImagePanel("imageInstructionsSection"));

  const focusMiaImagePanel = () =>
    dispatch(setCurrentFocusedImagePanel("miaImagePanel"));

  const closeHelpGuidePanel = useCallback(() => {
    setShowHelpGuidePanel(false);
    dispatch(setCurrentFocusedImagePanel("miaImagePanel"));
  }, [dispatch]);

  const downloadFile = (fileName, url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const saveImage = () => {
    if (!imageUrl) return;

    const imageDownloadUrl = imageUrl.startsWith("data:")
      ? imageUrl
      : `data:image/png;base64,${imageUrl}`;

    downloadFile("story-image.png", imageDownloadUrl);
  };

  const saveImageDescription = () => {
    const descriptionText = imageDescriptionParagraphs
      .map(
        (paragraph, index) =>
          `Paragraph ${index + 1}: ${getParagraphText(paragraph)}`,
      )
      .join("\n\n");

    const blob = new Blob([descriptionText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    downloadFile("image-description.txt", url);
    URL.revokeObjectURL(url);
  };
  return (
    <main className="story-reading-page" aria-labelledby="image-reading-title">
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-bias-avatar.png"
            className="title-image"
            alt=""
            aria-hidden="true"
          />
          <h1 id="image-reading-title" className="page-title">
            Spot the Bias
          </h1>
        </div>

        <nav className="page-nav" aria-label="Main menu navigation">
          <Link className="page-button" to="/spot-the-bias">
            Back to Menu
          </Link>
        </nav>
      </header>

      {isLoadingImage ? (
        <p
          ref={loadingRef}
          tabIndex={-1}
          className="page-instructions current-focused-panel"
          role="status"
          aria-live="polite"
        >
          Loading the image. Mia is creating your story image. This may take a
          little time.
        </p>
      ) : (
        <>
          <section
            ref={guideRef}
            tabIndex={-1}
            className={
              currentFocusedImagePanel === "imageInstructionsSection"
                ? "instruction-section-style current-focused-panel"
                : "instruction-section-style"
            }
            aria-labelledby="image-guide-title"
            onMouseEnter={focusGuide}
            onFocusCapture={focusGuide}
          >
            <h2 id="image-guide-title" className="instruction-title">
              Creator Guide
            </h2>

            <p className="page-instructions">
              Below, Mia has created an image using the story. You can read the
              prompt Mia used to create the image and the image description. But
              watch out! One sneaky bias is hiding inside the image description.
              Your challenge is to read each paragraph of the image description
              and spot the biased part. Need help? Ask Alice, another AI agent,
              for clues. Once you find the biased paragraph in the image
              description, rephrase Mia’s image prompt to make the image fairer.
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
              <button
                type="button"
                className="page-button"
                onClick={() =>
                  navigate(`/spot-the-bias/${storytopic}/story-reading`)
                }
              >
                Back to Story Page
              </button>
              <button
                type="button"
                className="page-button"
                onClick={() =>
                  navigate(`/spot-the-bias/${storytopic}/image-review-page`)
                }
              >
                Review Your Image Bias-Spotting Moves
              </button>
            </div>
          </section>

          <div className="side-by-side-page">
            <section
              className={
                currentFocusedImagePanel === "miaImagePanel"
                  ? "mia-panel current-focused-panel"
                  : "mia-panel"
              }
              aria-labelledby="mia-image-panel-title"
              onMouseEnter={focusMiaImagePanel}
              onFocusCapture={focusMiaImagePanel}
            >
              <h2 id="mia-image-panel-title" className="panel-title">
                Mia’s Created Image
              </h2>

              <section>
                {imageUrl && (
                  <>
                    <img
                      src={imageUrl}
                      alt={imagePrompt.displayedPrompt || "Mia's created image"}
                      className="story-generated-image"
                    />
                    <div className="rephrase-button">
                      <button
                        type="button"
                        className="page-button"
                        onClick={saveImage}
                      >
                        Save Image
                      </button>
                    </div>

                    <h3 id="mia-image-panel-title" className="panel-title">
                      Image Prompt Mia Used to Create the Image
                    </h3>

                    {imagePrompt.displayedPrompt && (
                      <>
                        <p className="image-prompt">
                          <strong>Image prompt:</strong>{" "}
                          {imagePrompt.displayedPrompt}
                        </p>
                        <p className="keyboard-instructions">
                          Press the below Rephrase Image Prompt button to
                          rewrite the image prompt.
                        </p>
                        <div className="rephrase-button">
                          <button
                            type="button"
                            className="page-button"
                            onClick={openImagePromptRephrasePanel}
                          >
                            Rewrite Image Prompt
                          </button>
                        </div>
                        {imagePrompt.rephrasedPrompt && (
                          <>
                            <p className="image-prompt">
                              <strong>Rewritten image prompt:</strong>{" "}
                              {imagePrompt.rephrasedPrompt}
                            </p>
                            <p className="keyboard-instructions">
                              Press the below Generate New Image button to
                              create new image and description.
                            </p>
                            <div className="rephrase-button">
                              <button type="button" className="page-button">
                                Generate New Image
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </section>
              <section>
                <h3 id="mia-image-panel-title" className="panel-title">
                  Image description
                </h3>
                <p className="keyboard-instructions">
                  Press{" "}
                  <span className="kbd" aria-hidden="true">
                    [
                  </span>{" "}
                  and{" "}
                  <span className="kbd" aria-hidden="true">
                    ]
                  </span>{" "}
                  to move through the image description paragraph by paragraph.
                  Spot a sneaky bias? Press <span className="kbd">Enter</span>{" "}
                  to check your guess. You can also mark a paragraph if
                  something feels unfair and review it later.
                </p>

                <ol
                  className="story-paragraph-list"
                  aria-label="Mia's image description"
                >
                  {imageDescriptionParagraphs.map((paragraph, index) => {
                    const paragraphText = getParagraphText(paragraph);

                    return (
                      <li
                        key={paragraph.index}
                        ref={(element) => {
                          paragraphRefs.current[index] = element;
                        }}
                        tabIndex={index === currentParagraphIndex ? 0 : -1}
                        className={
                          index === currentParagraphIndex
                            ? "story-paragraph current-focused-panel"
                            : "story-paragraph"
                        }
                        aria-label={`Image description paragraph ${index + 1} of ${
                          imageDescriptionParagraphs.length
                        }. ${paragraphText}. Press Enter to check this paragraph.`}
                        onFocus={() => focusImageDescriptionParagraph(index)}
                        onClick={() => focusImageDescriptionParagraph(index)}
                        onMouseEnter={() =>
                          focusImageDescriptionParagraph(index)
                        }
                      >
                        {paragraphText}
                      </li>
                    );
                  })}
                </ol>
                <div className="rephrase-button">
                  <button
                    type="button"
                    className="page-button"
                    onClick={saveImageDescription}
                    disabled={imageDescriptionParagraphs.length === 0}
                  >
                    Save Image Description
                  </button>
                </div>
              </section>
            </section>
            <ImageLeaderBoardPanel />
            <ImageBiasCheckingPanel />
            {currentFocusedImagePanel === "imageCraftPromptRephrasePanel" && (
              <ImageCraftPromptRephrase />
            )}
          </div>
          <ImageAgentAlicePanel />
          {showHelpGuidePanel && (
            <ImageHelpGuidePanel onClose={closeHelpGuidePanel} />
          )}
        </>
      )}
    </main>
  );
};

export default ImageReadingPage;
