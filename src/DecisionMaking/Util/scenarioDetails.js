export const scenarioDetails = {
  "restaurant-menu": {
    id: "restaurant-menu",

    scenarioBuildingInitialPart: {
      title: "The Menu Mystery",

      settings:
        "You are out at a Vietnamese restaurant with your friends after a fun day together. Everyone is looking at the menu and talking about what they might order. The restaurant smells amazing, and you are getting hungry! The printed menu is not accessible to you, so you take a picture of it and ask an AI image-description tool to help you read what is there. Your friends are still deciding what they want, so you would like to figure out your options too.",

      task: "Use the AI's response to figure out what you might want to order.",

      imagePath: "/images/scenarios/restaurant-menu.jpg",
    },

    AIResponse: {
      AIResponseText:
        "Here are the dishes on the menu: Pho Ga — $14, Lemongrass Chicken — $16, Crispy Spring Rolls — $8, and Garlic Noodles — $13.",

      AvailableInitialDataToAI:
        "The image clearly shows Pho Ga — $14 and Crispy Spring Rolls — $8. Some other parts of the menu are blurry and difficult to read. The AI does not have enough clear visual information to confidently identify all of the other dishes.",
    },

    WouldYouRather: {
      optionA: {
        text: "Order one of the dishes the AI listed.",
      },

      optionB: {
        text: "Ask the AI to check the menu again before ordering.",
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
            "The AI could not clearly see all of the information in the menu.",
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
            "Some of the AI's response does not match the information that can actually be seen in the menu.",
        },
      },
    },
  },
};
