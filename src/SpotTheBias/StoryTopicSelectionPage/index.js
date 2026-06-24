import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./index.css";

import { setStoryTopic } from "../SpotTheBiasReducer";
import { setImageDescriptionReading } from "../ImageBiasReducer";

// const storyTopics = [
//   "Adventure and Travel",
//   "Science Fiction and Fantasy",
//   "Mystery and Suspense",
//   "Self-Discovery and Coming of Age",
// ];

const storyTopics = [
  "Adventure: Story about exploring new places",
  "Fantasy: Story with magic or imaginary worlds",
  "Mystery: Story where characters solve a mystery",
  "Everyday Life: Story about daily activities",
];
const StoryTopicSelectionPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [customStoryTopic, setCustomStoryTopic] = useState("");

  const selectStoryTopic = (storyTopic) => {
    const storyTopicSlug = storyTopic
      .split(":")[0]
      .trim()
      .toLowerCase()
      .replaceAll(" ", "-");

    dispatch(
      setStoryTopic({
        storyTopic,
        storyTopicType: "suggested",
      }),
    );

    dispatch(setImageDescriptionReading({}));

    navigate(`/spot-the-bias/${storyTopicSlug}`);
  };

  const submitCustomStoryTopic = (event) => {
    event.preventDefault();

    const trimmedCustomStoryTopic = customStoryTopic.trim();

    if (!trimmedCustomStoryTopic) {
      return;
    }

    dispatch(
      setStoryTopic({
        storyTopic: trimmedCustomStoryTopic,
        storyTopicType: "custom",
      }),
    );

    dispatch(setImageDescriptionReading({}));
    navigate("/spot-the-bias/customized-topic");
  };

  return (
    <main
      className="story-topic-selection-page"
      aria-labelledby="story-topic-selection-page-title"
    >
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-bias-avatar.png"
            className="title-image"
            alt=""
            aria-hidden="true"
          />

          <h1 id="story-topic-selection-page-title" className="page-title">
            Spot the Bias
          </h1>
        </div>

        <nav className="page-nav" aria-label="Main Menu Navigation">
          <Link className="page-button" to="/spot-the-bias">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section aria-labelledby="creator-guide-title">
        <h2 id="creator-guide-title" className="instruction-title">
          Fairness Coach Guide
        </h2>

        <p className="page-instructions">
          Welcome, Fairness Coach! In this game, Mia, an AI agent, will create a
          story and a story image. But watch out. Mia might sneak in biases into
          the story and image. Your task is to spot the biases, guide Mia to fix
          the story and image, and make the final creation fairer.
        </p>
      </section>

      <section aria-label="Story Topic Selection">
        <h2 id="story-topic-title" className="story-topic-title">
          First Step: Choose a topic from the list below or use your own fun
          story idea to help Mia create a story.
        </h2>

        <ul className="story-topic-list" aria-label="Suggested story topics">
          {storyTopics.map((storyTopic) => (
            <li key={storyTopic}>
              <button
                type="button"
                className="story-topic-button"
                onClick={() => selectStoryTopic(storyTopic)}
                aria-label={`Choose ${storyTopic} story topic`}
              >
                {storyTopic}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="custom-story-topic-title">
        <h2 id="custom-story-topic-title" className="story-topic-title">
          Have your own story idea? Write it here.
        </h2>

        <form
          className="custom-story-topic-form"
          onSubmit={submitCustomStoryTopic}
          aria-labelledby="custom-story-topic-title"
        >
          <label htmlFor="custom-story-topic" className="custom-topic-label">
            What kind of story do you want Mia to create today?
          </label>

          <textarea
            id="custom-story-topic"
            className="custom-topic-textarea"
            value={customStoryTopic}
            onChange={(event) => setCustomStoryTopic(event.target.value)}
            placeholder="For example, a funny story about a robot at school"
            rows={4}
          />

          <button type="submit" className="story-topic-button">
            Submit My Story Topic
          </button>
        </form>
      </section>
    </main>
  );
};

export default StoryTopicSelectionPage;
