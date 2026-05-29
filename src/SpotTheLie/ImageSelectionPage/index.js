import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import "./index.css";
import * as imagePaths from "../util/imagePaths.js";

const ImageSelectionPage = () => {
  const { imagecategory } = useParams();

  const categoryDisplayNames = {
    "home-and-personal-spaces": "Home and Personal Spaces",
    "public-spaces": "Public Spaces",
    "travel-and-nature": "Travel and Nature",
    "people-and-their-jobs": "People and Their Jobs",
    "activities-and-actions": "Activities and Actions",
  };

  const categoryToImagePathsMap = {
    "home-and-personal-spaces": imagePaths.homeAndPersonalSpacesImagePaths,
    "public-spaces": imagePaths.publicSpacesImagePaths,
    "travel-and-nature": imagePaths.travelAndNatureImagePaths,
    "people-and-their-jobs": imagePaths.peopleAndSocialRolesImagePaths,
    "activities-and-actions": imagePaths.activitiesAndInteractionsImagePaths,
  };

  const selectedImageCategory = categoryDisplayNames[imagecategory] || "";
  const selectedImagePaths = categoryToImagePathsMap[imagecategory] || [];

  const navigate = useNavigate();

  const selectImage = (imagepath) => {
    const imageName = imagepath
      .split("/")
      .pop()
      .replace(/\.[^/.]+$/, "");

    navigate(`/spot-the-lie/${imagecategory}/${imageName}`);
  };

  return (
    <main
      className="image-selection-page"
      role="main"
      aria-labelledby="image-selection-page-title"
    >
      <header className="header-style">
        <div className="header-spacer" aria-hidden="true" />

        <div className="header-title-group">
          <img
            src="/images/spot-the-lie-avatar.png"
            className="title-image"
            alt=""
          />
          <h1 id="image-selection-page-title" className="page-title">
            Spot the Lie
          </h1>
        </div>

        <nav className="page-nav" aria-label="Main menu navigation">
          <Link className="page-button" to="/spot-the-lie">
            Back to Menu
          </Link>
        </nav>
      </header>

      <section
        className="selection-part"
        aria-labelledby="image-selection-title"
      >
        {/* Accessibility change: section is labeled by this visible heading. */}
        <h2
          id="image-selection-title"
          className="image-selection-title"
          tabIndex={0}
        >
          Game Step: Select an image from the {selectedImageCategory} category
          to begin.
        </h2>

        {selectedImagePaths.length === 0 ? (
          <p role="status">No images available for this category yet.</p>
        ) : (
          <ul
            className="image-container"
            aria-label={`Images in the ${selectedImageCategory} category`}
          >
            {selectedImagePaths.map((imagepath, i) => (
              <li key={imagepath} className="image-wrapper">
                <div className="image-frame">
                  <img
                    src={`/images/hallucination/${imagepath}`}
                    className="static-image"
                    alt={`Preview of image ${i + 1} in the ${selectedImageCategory} category`}
                  />
                </div>

                <button
                  type="button"
                  className="image-button"
                  onClick={() => selectImage(imagepath)}
                  aria-label={`Select image ${i + 1} from the ${selectedImageCategory} category`}
                >
                  Image {i + 1}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default ImageSelectionPage;
