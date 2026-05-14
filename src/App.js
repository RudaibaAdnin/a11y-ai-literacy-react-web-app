import { HashRouter } from "react-router-dom";
import { Routes, Route } from "react-router";
import { Provider } from "react-redux";
import store from "./store";

import LandingPage from "./LandingPage";

import ImageCategoryPage from "./SpotTheLie/ImageCategoryPage";
import ImageSelectionPage from "./SpotTheLie/ImageSelectionPage";
import ImageDescriptionPage from "./SpotTheLie/ImageDescriptionPage";

function App() {
  return (
    <div>
      <Provider store={store}>
        <HashRouter>
          <div>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/spot-the-lie" element={<ImageCategoryPage />} />
              <Route
                path="/spot-the-lie/:imagecategory"
                element={<ImageSelectionPage />}
              />
              <Route
                path="/spot-the-lie/:imagecategory/:imagename"
                element={<ImageDescriptionPage />}
              />
            </Routes>
          </div>
        </HashRouter>
      </Provider>
    </div>
  );
}

export default App;
