import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  setImageDescriptionReading,
  setSelectedCheckingImageDescriptionParagraph,
  setCurrentFocusedImagePanel,
} from "../ImageBiasReducer";
import { image_bias_categories } from "../util/ImageBiasCategories.js";
import * as client from "./client.js";
import "./index.css";

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

  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);

  const currentParagraphIndexRef = useRef(0);
  const loadingRef = useRef(null);
  const guideRef = useRef(null);
  const paragraphRefs = useRef([]);

  const { storyParagraphs } = useSelector((state) => state.SpotTheBiasReducer);

  const {
    imageUrl,
    imageDescriptionParagraphs,
    selectedCheckingImageDescriptionParagraph,
    currentFocusedImagePanel,
  } = useSelector((state) => state.ImageBiasReducer);

  const moveToParagraph = useCallback((nextIndex) => {
    currentParagraphIndexRef.current = nextIndex;
    setCurrentParagraphIndex(nextIndex);
    requestAnimationFrame(() => paragraphRefs.current[nextIndex]?.focus());
  }, []);

  const loadImageReading = useCallback(async () => {
    const selectedImageBiasCategory = getRandomImageBiasCategory();
    const storyParagraphsForImage = storyParagraphs
      .slice(0, 2)
      .map((item) => item.originalStoryParagraph);

    try {
      setIsLoadingImage(true);
      moveToParagraph(0);

      const response = await client.getImageReading({
        storyParagraphs: storyParagraphsForImage,
        selectedImageBiasCategory,
      });

      const plan = response.biasedImageDescriptionParagraphPlan || [];

      dispatch(
        setImageDescriptionReading({
          imageUrl: response.imageUrl || "",
          imageDescriptionParagraphs: response.imageDescriptionParagraphs || [],
          selectedImageBiasCategories: [selectedImageBiasCategory],
          biasedImageDescriptionParagraphPlan: plan,
          biasedImageDescriptionParagraphIndices: plan.map(
            (item) => item.imageDescriptionParagraphIndex,
          ),
          biasedImageDescriptionParagraphCount: plan.length,
          biasImageDescriptionCount: 1,
        }),
      );
    } catch (error) {
      console.error("Could not get image reading:", error);
    } finally {
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
      if (
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

      const nextIndex =
        (currentIndex +
          (event.key === "[" ? -1 : 1) +
          imageDescriptionParagraphs.length) %
        imageDescriptionParagraphs.length;

      moveToParagraph(nextIndex);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    dispatch,
    imageDescriptionParagraphs,
    selectedCheckingImageDescriptionParagraph?.index,
    moveToParagraph,
  ]);

  const focusGuide = () =>
    dispatch(setCurrentFocusedImagePanel("imageInstructionsSection"));

  const focusMiaImagePanel = () =>
    dispatch(setCurrentFocusedImagePanel("miaImagePanel"));

  return (
    <main className="story-reading-page" aria-labelledby="image-reading-title">
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-bias-avatar.png"
            className="title-image"
            alt=""
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
          Loading the image. Mia is creating your story image...
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
              Image Guide
            </h2>

            <p className="page-instructions">
              Mia created an image and description from the story. Read the
              description paragraph by paragraph and check if any image bias is
              hiding inside.
            </p>
          </section>

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

            {imageUrl && (
              <img src={imageUrl} alt="" className="story-generated-image" />
            )}

            <p className="keyboard-instructions">
              Press{" "}
              <span className="kbd" aria-hidden="true">
                [
              </span>{" "}
              and{" "}
              <span className="kbd" aria-hidden="true">
                ]
              </span>{" "}
              to move through the image description. Press{" "}
              <span className="kbd">Enter</span> to check a paragraph.
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
                  >
                    {paragraphText}
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </main>
  );
};

export default ImageReadingPage;
