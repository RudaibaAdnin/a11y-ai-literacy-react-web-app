import { Link } from "react-router-dom";

import "./index.css";

const games = [
  {
    name: "Spot the Lie",
    description:
      "Work as a detective to find sneaky lies hiding inside image descriptions made by AI.",
    link: "/spot-the-lie",
  },
  {
    name: "Bias Buster",
    description:
      "Work as a fairness coach to find and fix sneaky biases in stories and images made by AI.",
    link: "/bias-buster",
  },
  {
    name: "What's the Catch",
    description: "A would you rather game.",
    link: "/whats-the-catch",
  },
  {
    name: "Secret Pattern",
    description: "A Puzzle game",
    link: "/secret-pattern",
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
        {games.map((game, index) => (
          <li key={game.link} className="game-card-item">
            <Link to={game.link} className="game-card">
              <h2 className="game-card-title">
                {" "}
                <span
                  className={
                    [
                      "blue-parallelogram",
                      "purple-parallelogram",
                      "pink-parallelogram",
                      "green-parallelogram",
                    ][index % 4]
                  }
                >
                  {game.name}
                </span>
              </h2>
              <p className="game-card-description">{game.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default LandingPage;
