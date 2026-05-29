import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setStoryQuestion } from "../SpotTheBiasReducer";
import "./index.css";

import * as client from "./client.js";

const StoryQuestionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storytopic } = useParams();

  const storyTopic = useSelector(
    (state) => state.SpotTheBiasReducer.storyTopic,
  );

  const storyTopicType = useSelector(
    (state) => state.SpotTheBiasReducer.storyTopicType,
  );

  const [storyQuestions, setStoryQuestions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const loadingQuestionsRef = useRef(null);
  const activityStepRef = useRef(null);

  const topicText = storyTopic ? `about ${storyTopic}` : "";

  const getStoryQuestions = useCallback(async () => {
    try {
      setIsLoadingQuestions(true);
      setStoryQuestions([]);
      setAnsweredQuestions({});

      const response = await client.getStoryQuestions(
        storyTopic,
        storyTopicType,
      );
      setStoryQuestions(response.storyQuestions || []);
      setIsLoadingQuestions(false);
    } catch (error) {
      console.error("Could not get story questions:", error);
    }
  }, [storyTopic, storyTopicType]);

  useEffect(() => {
    getStoryQuestions();
  }, [getStoryQuestions]);

  useEffect(() => {
    if (isLoadingQuestions) {
      loadingQuestionsRef.current?.focus();
    } else if (storyQuestions.length > 0) {
      activityStepRef.current?.focus();
    }
  }, [isLoadingQuestions, storyQuestions]);

  const answerQuestion = (questionIndex, answer, answerType) => {
    setAnsweredQuestions((previousAnswers) => ({
      ...previousAnswers,
      [questionIndex]: { answer, answerType },
    }));
  };

  const createStory = () => {
    const storyQuestionsAndAnswers = storyQuestions.map(
      (storyQuestionItem, questionIndex) => ({
        storyQuestion: storyQuestionItem.storyQuestion,
        answer: answeredQuestions[questionIndex]?.answer || "",
        answerType: answeredQuestions[questionIndex]?.answerType || "",
      }),
    );

    dispatch(setStoryQuestion(storyQuestionsAndAnswers));

    navigate(`/spot-the-bias/${storytopic}/story-reading`);
  };

  return (
    <main
      className="story-question-page"
      aria-labelledby="story-question-page-title"
    >
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-bias-avatar.png"
            className="title-image"
            alt=""
          />

          <h1 id="story-question-page-title" className="page-title">
            Spot the Bias
          </h1>
        </div>

        <nav className="page-nav" aria-label="Main menu navigation">
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
          Ready to create a story and an image {topicText}? Answer three fun
          questions. For each question, select one of the two suggestions or
          write your own answer.
        </p>
      </section>

      <section
        className="story-question-part"
        aria-labelledby="story-question-title"
      >
        {isLoadingQuestions ? (
          <p
            ref={loadingQuestionsRef}
            tabIndex={-1}
            className="loading-questions"
            role="status"
            aria-live="polite"
          >
            Loading three fun questions and suggestions...
          </p>
        ) : (
          <>
            <h2
              id="story-question-title"
              ref={activityStepRef}
              tabIndex={-1}
              className="story-question-title"
            >
              Second Step: Answer the following three questions. Select a
              suggestion or write your own answer.
            </h2>

            <ol className="story-question-list">
              {storyQuestions.map((storyQuestionItem, questionIndex) => {
                const questionId = `story-question-${questionIndex}`;
                const currentAnswer = answeredQuestions[questionIndex];
                const customAnswer =
                  currentAnswer?.answerType === "custom"
                    ? currentAnswer.answer
                    : "";

                return (
                  <li key={questionIndex} className="story-question-item">
                    <fieldset className="story-question-fieldset">
                      <legend id={questionId} className="story-question">
                        {storyQuestionItem.storyQuestion}
                      </legend>

                      <div className="story-question-suggestion-list">
                        {storyQuestionItem.storyQuestionSuggestions.map(
                          (suggestion, suggestionIndex) => (
                            <label
                              key={suggestionIndex}
                              className={`story-question-suggestion-radio ${
                                currentAnswer?.answerType === "selected" &&
                                currentAnswer?.answer === suggestion
                                  ? "selected-suggestion-radio"
                                  : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name={`story-question-${questionIndex}`}
                                value={suggestion}
                                checked={
                                  currentAnswer?.answerType === "selected" &&
                                  currentAnswer?.answer === suggestion
                                }
                                onChange={() =>
                                  answerQuestion(
                                    questionIndex,
                                    suggestion,
                                    "selected",
                                  )
                                }
                              />

                              <span>{suggestion}</span>
                            </label>
                          ),
                        )}

                        <div
                          className={`story-question-suggestion-radio ${
                            currentAnswer?.answerType === "custom"
                              ? "selected-suggestion-radio"
                              : ""
                          }`}
                        >
                          <input
                            id={`custom-answer-${questionIndex}`}
                            type="radio"
                            name={`story-question-${questionIndex}`}
                            value="custom"
                            checked={currentAnswer?.answerType === "custom"}
                            onChange={() =>
                              answerQuestion(
                                questionIndex,
                                customAnswer,
                                "custom",
                              )
                            }
                          />

                          <label htmlFor={`custom-answer-${questionIndex}`}>
                            Write my own answer:
                          </label>

                          <input
                            type="text"
                            className="story-question-custom-input"
                            value={customAnswer}
                            aria-label={`Write your own answer for question ${
                              questionIndex + 1
                            }`}
                            onFocus={() =>
                              answerQuestion(
                                questionIndex,
                                customAnswer,
                                "custom",
                              )
                            }
                            onChange={(event) =>
                              answerQuestion(
                                questionIndex,
                                event.target.value,
                                "custom",
                              )
                            }
                          />
                        </div>
                      </div>
                    </fieldset>
                  </li>
                );
              })}
            </ol>

            <div className="story-question-button-group">
              <button
                type="button"
                className="page-button"
                onClick={createStory}
              >
                Create Story
              </button>

              <button
                type="button"
                className="page-button"
                onClick={getStoryQuestions}
              >
                Regenerate Questions
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default StoryQuestionPage;
