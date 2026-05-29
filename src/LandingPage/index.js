import { Link } from "react-router-dom";

import "./index.css";

const games = [
  {
    name: "Spot the Lie",
    description:
      "Work as a detective to find sneaky lies hiding inside AI-generated image descriptions.",
    link: "/spot-the-lie",
  },
  {
    name: "Spot the Bias",
    description:
      "Work with an AI agent to create a story and an image, then make your creation better by spotting and fixing biased parts.",
    link: "/spot-the-bias",
  },
  {
    name: "Choose your Path",
    description:
      "A maze game on making decisions in different scenarios with AI tools.",
    link: "/choose-your-path",
  },
];

const LandingPage = () => {
  return (
    <main className="landing-page" role="main" aria-label="Game landing page">
      <header className="header-style">
        <img
          src="images/landing-page-avatar.png"
          className="title-image"
          alt=""
        />
        <h1 className="landing-title">Welcome</h1>
      </header>

      <ul className="cards-container" aria-label="Available games">
        {games.map((game) => (
          <li key={game.link} className="game-card-item">
            <Link to={game.link} className="game-card">
              <h2 className="game-card-title">{game.name}</h2>
              <p className="game-card-description">{game.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default LandingPage;
