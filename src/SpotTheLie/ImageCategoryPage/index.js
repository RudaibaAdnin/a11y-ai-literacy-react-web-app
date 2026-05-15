import React from "react";
import { useNavigate } from "react-router-dom";
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
      aria-label="Image Category Page"
    >
      <header className="header-style">
        <img
          src="images/spot-the-lie-avatar.png"
          className="title-image"
          alt=""
        />
        <h1 className="page-title">Spot the Lie</h1>
      </header>

      <section>
        <h2 className="instruction-title" tabIndex={0}>
          Game Instructions:
        </h2>
        <p className="page-instructions">
          Welcome, Detective! In this game, you will hunt for AI lies. You will
          read image descriptions from an AI agent called Sara. But watch out!
          Each description has three sneaky lies hiding inside. Your mission is
          to find them.
        </p>
      </section>

      <section>
        <h2 className="image-category-title">
          Game Step: Select an image category to start your detective mission.
        </h2>

        <ul className="image-category-list" aria-label="Image categories">
          {ImageCategories.map((imagecategory) => (
            <li key={imagecategory} className="image-category-item">
              <button
                type="button"
                className="image-category"
                onClick={() => selectCategory(imagecategory)}
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
