import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./index.css";

const ImageCategoryPage = () => {
  const ImageCategories = [
    "Home and Personal Spaces",
    "Public Spaces",
    "Travel and Nature",
    "People and Their Jobs",
    "Activities and Actions",
  ];

  const navigate = useNavigate();

  const selectCategory = (imagecategory) => {
    navigate(
      `/spot-the-lie/${imagecategory.toLowerCase().replaceAll(" ", "-")}`,
    );
  };

  return (
    <main
      className="image-category-page"
      role="main"
      // Accessibility change: connects the main page region to the visible page title.
      aria-labelledby="image-category-page-title"
    >
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-lie-avatar.png"
            className="title-image"
            alt=""
          />

          {/* Accessibility change: added id so main can use this as its label. */}
          <h1 id="image-category-page-title" className="page-title">
            Spot the Lie
          </h1>
        </div>

        {/* Accessibility change: changed nav label from review page to menu/page navigation. */}
        <nav className="page-nav" aria-label="Main menu page navigation">
          <Link className="page-button" to="/spot-the-lie">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section aria-labelledby="mission-guide-title">
        {/* Accessibility change: section is labeled by this visible heading. */}
        <h2 id="mission-guide-title" className="instruction-title" tabIndex={0}>
          Mission Guide
        </h2>

        <p className="page-instructions">
          Welcome, Detective! In this game, you will hunt for AI lies. You will
          read image descriptions from an AI agent called Sara. But watch out!
          Each description has three sneaky lies hiding inside. Your mission is
          to find them.
        </p>
      </section>

      <section aria-labelledby="image-category-title">
        {/* Accessibility change: added id so the section can be labeled by this heading. */}
        <h2
          id="image-category-title"
          className="image-category-title"
          tabIndex={0}
        >
          Game Step: Select an image category to start your detective mission.
        </h2>

        <ul className="image-category-list" aria-label="Image category choices">
          {ImageCategories.map((imagecategory) => (
            <li key={imagecategory} className="image-category-item">
              <button
                type="button"
                className="image-category"
                onClick={() => selectCategory(imagecategory)}
                // Accessibility change: makes the button action clear.
                aria-label={`Select ${imagecategory} category`}
              >
                {imagecategory}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default ImageCategoryPage;
