export const scenarioDetails = {
  "restaurant-menu": {
    id: "restaurant-menu",

    scenarioBuildingInitialPart: {
      title: "What's on the Menu?",

      settings:
        "You are out at a Vietnamese restaurant with your friends after a fun day together. Everyone is looking at the menu and talking about what they might order. The restaurant smells amazing, and you are getting hungry! The printed menu is not accessible to you, so you take a picture of it and ask an AI image-description tool to help you read what is there.",

      settings_ai_before:
        "Your friends are still deciding what they want, so you listen while the AI agent, Alice reads the menu aloud. You are hoping something delicious catches your attention.",

      task: "Now, decide what you might want to order.",

      imagePath: "/images/decisionScenarios/restuarant_menu.jpeg",
    },

    AIResponse: {
      AIResponseText:
        "The menu is titled “Chef’s Special” and lists four dishes. Thai Steamed Dumplings cost $9.95, Sweet & Sour with Crispy Chicken costs $18.95, Pho ga, described as a Northern Thai coconut curry noodle soup, costs $19.95, and Lemongrass chichen costs $17.95.",

      AvailableInitialDataToAI:
        "The menu is titled “Chef’s Special” and lists four dishes. Thai Steamed Dumplings cost $9.95, Sweet & Sour with Crispy Chicken costs $18.95, Khao Soi, described as a Northern Thai coconut curry noodle soup, costs $19.95, and Mango Curry costs $17.95.",
    },

    settings_ai_after:
      "A moment later, you hear one of your friends say, “Ooh, I think I’m getting the Sweet & Sour with Crispy Chicken!” Sweet & Sour Chickens are her absolute favorite, so she sounds pretty excited. She starts talking about how hungry she is and how good the noodles sound. Now you are even more curious about the dishes the AI listed, and you have to decide what you want to order too.",

    WouldYouRather: {
      optionA: {
        text: "Order Pho Ga",
      },

      optionB: {
        text: "Order Lemongrass Chicken",
      },
    },

    DecisionConsequence: {
      stakes: "medium",

      details: {
        text: "You confidently try to order several dishes the AI listed, but the restaurant does not actually have them. You feel embarrassed and realize that some of the AI's answers may have been guesses.",
      },
    },

    whatsTheCatch: {
      question: "What's the catch with the AI's response?",

      catchOptions: {
        missingInformation: {
          label: "Missing Information",
          description:
            "The AI could not clearly see all of the information on the menu.",
        },

        inaccurateDetails: {
          label: "Inaccurate Details",
          description:
            "The AI gave specific dish names that were not actually visible in the image.",
        },

        biasedAssumptions: {
          label: "Biased Assumptions",
          description:
            "The AI may have relied on assumptions about what dishes are commonly found at Vietnamese restaurants.",
        },

        conflictingDetails: {
          label: "Conflicting Details",
          description:
            "Some of the AI's response does not match the information that can actually be seen on the menu.",
        },
      },
    },
  },
};
