import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./index.css";

import { setStoryTopic } from "../SpotTheBiasReducer";

const storyTopics = [
  "Adventure and Travel",
  "Science Fiction and Fantasy",
  "Mystery and Suspense",
  "Self-Discovery and Coming of Age",
];

const StoryTopicSelectionPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [customStoryTopic, setCustomStoryTopic] = useState("");

  const selectStoryTopic = (storyTopic) => {
    const storyTopicSlug = storyTopic.toLowerCase().replaceAll(" ", "-");

    dispatch(
      setStoryTopic({
        storyTopic,
        storyTopicType: "suggested",
      }),
    );

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
          />

          <h1 id="story-topic-selection-page-title" className="page-title">
            Spot the Bias
          </h1>
        </div>

        <nav className="page-nav" aria-label=" Back to Menu">
          <Link className="page-button" to="/spot-the-bias">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section aria-labelledby="activity-guide-title">
        <h2 id="activity-guide-title" className="instruction-title">
          Creator Guide
        </h2>

        <p className="page-instructions">
          Welcome, Story Creator! Get ready to team up with Mia, an AI agent, to
          create a story and a matching image. But watch out! Mia might sneak in
          biases into the story and image. Your challenge is to spot the biases,
          fix the story and image, and make the final creation fair and
          respectful.
        </p>
      </section>

      <section aria-labelledby="story-topic-title">
        <h2 id="story-topic-title" className="story-topic-title">
          First Step: Choose a topic from the list below or use your own fun
          story idea to begin.
        </h2>

        <ul className="story-topic-list" aria-label="Story topic choices">
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
        >
          <label htmlFor="custom-story-topic" className="custom-topic-label">
            What kind of story do you want to create today?
          </label>

          <textarea
            id="custom-story-topic"
            className="custom-topic-textarea"
            value={customStoryTopic}
            onChange={(event) => setCustomStoryTopic(event.target.value)}
            placeholder="For example, a funny story about a robot at school"
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
