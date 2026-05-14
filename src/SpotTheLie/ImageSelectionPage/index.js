import React from "react";
import { useParams, useNavigate } from "react-router-dom";

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
      aria-label="Image Selection Page"
    >
      <header className="header-style">
        <img
          src="images/spot-the-lie-avatar.png"
          className="title-image"
          alt=""
        />
        <h1 className="page-title">Spot the Lie</h1>
      </header>
      <h2 className="image-selection-title">
        Select an image from the{" "}
        <span className="kbd">{selectedImageCategory}</span> category.
      </h2>
      {selectedImagePaths.length === 0 ? (
        <p>No images available for this category yet.</p>
      ) : (
        <ul className="image-container" aria-label="Images">
          {selectedImagePaths.map((imagepath, i) => (
            <li key={imagepath} className="image-wrapper">
              <div className="image-frame">
                <img
                  src={`images/hallucination/${imagepath}`}
                  className="static-image"
                  alt={`Image ${i + 1} from ${selectedImageCategory}`}
                />
              </div>
              <button
                type="button"
                className="image-button"
                onClick={() => selectImage(imagepath)}
              >
                Image {i + 1}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default ImageSelectionPage;
