import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setStoryBiasOptions } from "../SpotTheBiasReducer";
import { setImageBiasOption } from "../ImageBiasReducer";

import "./index.css";

const disabilityBiases = [
  { label: "D1", value: "Treating Disability as Something Bad" },
  { label: "D2", value: "Assuming Disabled People as Helpless" },
  { label: "D3", value: "Inspiration Bias" },
  { label: "D4", value: "Limited View on Disability" },
];

const identityBiases = [
  { label: "I1", value: "Gender Bias" },
  { label: "I2", value: "Age Bias" },
  { label: "I4", value: "Cultural Bias" },
  { label: "H", value: "Racial Bias" },
];

const BiasOptionSelectionPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const savedStoryBiasOptions = useSelector(
    (state) => state.SpotTheBiasReducer.storyBiasOptions,
  );

  const savedImageBiasOption = useSelector(
    (state) => state.ImageBiasReducer.imageBiasOption,
  );

  const [storyDisabilityBias, setStoryDisabilityBias] = useState(
    savedStoryBiasOptions.disabilityBias,
  );

  const [storyIdentityBias, setStoryIdentityBias] = useState(
    savedStoryBiasOptions.identityBias,
  );

  const [imageBias, setImageBias] = useState(savedImageBiasOption);

  const renderOptions = (options, name, selected, setSelected) =>
    options.map(({ label, value }) => (
      <label
        key={value}
        className={`bias-option ${
          selected === value ? "selected-bias-option" : ""
        }`}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={selected === value}
          onChange={() => setSelected(value)}
        />
        <span>{label}</span>
      </label>
    ));

  const handleSubmit = (event) => {
    event.preventDefault();

    dispatch(
      setStoryBiasOptions({
        disabilityBias: storyDisabilityBias,
        identityBias: storyIdentityBias,
      }),
    );

    dispatch(setImageBiasOption(imageBias));

    navigate("/bias-buster/story-topic-selection");
  };

  return (
    <main
      className="bias-option-selection-page"
      aria-labelledby="bias-option-selection-page-title"
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

          <h1 id="bias-option-selection-page-title" className="page-title">
            Bias Buster
          </h1>
        </div>

        <nav className="page-nav" aria-label="Main Menu Navigation">
          <Link className="page-button" to="/bias-buster">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section aria-labelledby="teacher-guide-title">
        <h2 id="teacher-guide-title" className="instruction-title">
          Teacher Guide
        </h2>

        <p className="page-instructions">
          Mia, an AI agent, will create a story and a story image. Select the
          bias options you want Mia to include.
        </p>
      </section>

      <form className="bias-form" onSubmit={handleSubmit}>
        <section aria-labelledby="story-options-title">
          <h2 id="story-options-title" className="bias-section-title">
            Story Options
          </h2>

          <p className="bias-instructions">
            Select one option from each category.
          </p>

          <fieldset className="bias-fieldset">
            <legend>Bias around Disability</legend>
            <div className="bias-option-list">
              {renderOptions(
                disabilityBiases,
                "story-disability-bias",
                storyDisabilityBias,
                setStoryDisabilityBias,
              )}
            </div>
          </fieldset>

          <fieldset className="bias-fieldset">
            <legend>Bias around Identity and Background</legend>
            <div className="bias-option-list">
              {renderOptions(
                identityBiases,
                "story-identity-bias",
                storyIdentityBias,
                setStoryIdentityBias,
              )}
            </div>
          </fieldset>
        </section>

        <section aria-labelledby="image-options-title">
          <h2 id="image-options-title" className="bias-section-title">
            Image Options
          </h2>

          <p className="bias-instructions">
            Select one bias option for the image.
          </p>

          <fieldset className="bias-fieldset">
            <legend>Bias around Disability</legend>
            <div className="bias-option-list">
              {renderOptions(
                disabilityBiases,
                "image-bias",
                imageBias,
                setImageBias,
              )}
            </div>
          </fieldset>
        </section>

        <button type="submit" className="page-button">
          Submit Bias Options and Go to Game Page
        </button>
      </form>
    </main>
  );
};

export default BiasOptionSelectionPage;
