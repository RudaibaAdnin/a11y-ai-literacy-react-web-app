export const imageHallucinations = {
  "blind-man-walking": [
    {
      hallucinatedLine:
        "The picture shows a man walking in a park with a guide dog.",
      accurateLine: "The picture shows a man walking in a park with a dog.",
      cause:
        "The description says guide dog, but the dog does not have a guide-dog harness.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "The man holds a white cane in his left hand and the dog leash in his right hand.",
      accurateLine:
        "The man holds a white cane in his right hand and the dog leash in his left hand.",
      cause:
        "The cane and leash are mixed up. The cane is in his right hand, and the leash is in his left hand.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "There is a small bridge over a stream, with two people crossing it.",
      accurateLine: "There is a small bridge over a stream in the background.",
      cause: "No people are visible on the bridge.",
      type: "Made-up details",
    },
  ],

  "cristmas-tree": [
    {
      hallucinatedLine: "A golden star is shining at the top of the tree.",
      accurateLine:
        "An angel tree topper is at the top of the tree, glowing softly near the lights.",
      cause: "The topper is an angel, not a golden star.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "There are many gifts under the tree, so a large family must live here.",
      accurateLine:
        "There are many gifts under the tree, but the image does not show who they are for.",
      cause:
        "The image shows many gifts, but it does not prove that a large family lives there.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine: "A white cat is resting calmly on the sofa.",
      accurateLine:
        "On the right side, there is a dark leather sofa with a red blanket and pillows.",
      cause: "No white cat is visible on the sofa.",
      type: "Made-up details",
    },
  ],

  "two-women-shopping-logo": [
    {
      hallucinatedLine:
        "The shirt has a black three-stripe logo on the chest, so it looks like an Adidas shirt.",
      accurateLine:
        "The shirt has a logo with four black diagonal stripes on the chest, not the Adidas three-stripe logo.",
      cause:
        "The logo has four black diagonal stripes, not the Adidas three-stripe logo.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "She is wearing a green button-up shirt with the sleeves rolled up.",
      accurateLine:
        "She is wearing a pale blue button-up shirt with the sleeves rolled up.",
      cause: "The shirt color is pale blue, not green.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine: "A small price tag on the shirt says $49.99.",
      accurateLine: "No clear price tag is visible on the shirt.",
      cause: "No price tag is visible in the photo.",
      type: "Made-up details",
    },
  ],

  "woman-cat": [
    {
      hallucinatedLine:
        "She holds a blue bowl with paw prints and tilts it toward the cat.",
      accurateLine: "She holds a blue bowl and tilts it toward the cat.",
      cause: "The bowl is blue, but paw prints are not clearly visible.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "A stack of colorful magazines is on the table next to the cat.",
      accurateLine:
        "No colorful magazines are visible on the table next to the cat.",
      cause: "There are no magazines next to the cat.",
      type: "Made-up details",
    },
    {
      hallucinatedLine:
        "The cat’s raised paws show it is begging for food because the bowl is empty.",
      accurateLine:
        "The cat’s front paws are raised, but the image does not clearly show that it is begging because the bowl is empty.",
      cause:
        "The description guesses why the cat raised its paws, but the image does not prove that.",
      type: "Wrong guess",
    },
  ],

  "family-picnic": [
    {
      hallucinatedLine:
        "In the center, a man in a gray button-up shirt with a black Adidas logo leans forward.",
      accurateLine:
        "In the center, a man in a gray button-up shirt leans forward.",
      cause:
        "The description guesses the logo is Adidas, but the logo is not clearly the Adidas logo.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "He wears a white T-shirt and dark jeans while holding a small brown-and-white golden retriever.",
      accurateLine:
        "He wears a white T-shirt and dark jeans while holding a small brown-and-white terrier-type dog.",
      cause:
        "The dog looks more like a small terrier-type dog, not a golden retriever.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine: "He is wearing a baseball cap.",
      accurateLine: "He is not wearing a cap.",
      cause: "The boy is not wearing any cap.",
      type: "Made-up details",
    },
  ],

  "friend-group-picnic": [
    {
      hallucinatedLine:
        "A group of six people is having a picnic outside on a sunny day.",
      accurateLine:
        "A group of five people is having a picnic outside on a sunny day.",
      cause: "There are five people in the photo, not six.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "He wears light blue jeans and sneakers with a Nike logo.",
      accurateLine:
        "He wears light blue jeans and sneakers with a two-stripe logo, not a Nike logo.",
      cause: "The shoe logo has two stripes, so it is not clearly a Nike logo.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "There is also a large chocolate cake beside the watermelon.",
      accurateLine: "There is no large chocolate cake beside the watermelon.",
      cause: "No cake is visible beside the watermelon.",
      type: "Made-up details",
    },
  ],

  "man-woman-give-food-deer": [
    {
      hallucinatedLine: "She is holding a bright red apple in her other hand.",
      accurateLine: "No red apple is clearly visible in her other hand.",
      cause: "No apple is clearly visible in the photo.",
      type: "Made-up details",
    },
    {
      hallucinatedLine:
        "The deer stands on the right side with its head lowered to take food from the woman.",
      accurateLine:
        "The deer stands on the right side and appears to have five visible legs.",
      cause: "The deer appears to have five visible legs.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine: "A yellow ear tag on the deer shows that it is female.",
      accurateLine: "A yellow ear tag is visible on one of the deer’s ears.",
      cause:
        "The ear tag color does not prove the deer is female. Tag colors depend on the place or system.",
      type: "Wrong guess",
    },
  ],

  "mountain-woman-man-flag": [
    {
      hallucinatedLine:
        "One man in the right front wears a white T-shirt with an American flag print.",
      accurateLine:
        "One man in the right front wears a white T-shirt with a flag-like print, but it is not clearly the American flag. This pattern is available for Liberia’s flag.",
      cause:
        "The print looks like a flag, but it is not clearly the American flag.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "A picnic table is visible on the left side of the ranger.",
      accurateLine:
        "No picnic table is visible on the left side of the ranger.",
      cause: "No picnic table is visible there.",
      type: "Made-up details",
    },
    {
      hallucinatedLine: "Another visitor is taking a picture of the ranger.",
      accurateLine: "Another visitor is taking a picture of another visitor.",
      cause:
        "The visitor is taking a picture of another visitor, not the ranger.",
      type: "Mixed-up facts",
    },
  ],
};
