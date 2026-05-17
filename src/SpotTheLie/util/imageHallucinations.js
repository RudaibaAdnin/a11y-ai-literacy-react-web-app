export const imageHallucinations = {
  "blind-man-walking": [
    {
      hallucinatedLine:
        "The picture shows a man walking in a park with a guide dog.",
      accurateLine: "The picture shows a man walking in a park with a dog.",
      cause:
        "The description says the dog is a guide dog, but the dog does not have a guide-dog harness.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "The man is holding a white cane in his left hand and the dog leash in his right hand.",
      accurateLine:
        "The man is holding a white cane in his right hand and the dog leash in his left hand.",
      cause:
        "The cane and leash are mixed up. The cane is in his right hand, and the leash is in his left hand.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "There is a small bridge over a stream with two people crossing it.",
      accurateLine: "There is a small bridge over a stream in the background.",
      cause: "No person is visible on the bridge.",
      type: "Made-up details",
    },
  ],

  "cristmas-tree": [
    {
      hallucinatedLine: "At the very top, a golden star topper shines.",
      accurateLine:
        "At the very top, an angel tree topper is placed, glowing faintly from the surrounding lights.",
      cause: "The tree topper is an angel, not a golden star.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "The large number of gifts shows that a big family must live here.",
      accurateLine:
        "There are many gifts under the tree, but the image does not show who they are for.",
      cause:
        "The image shows many gifts, but it does not prove that a big family lives there.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "A white cat rests calmly on the sofa, blending into the Christmas scene.",
      accurateLine:
        "On the right side of the room, there is a dark leather sofa with a red blanket and pillows.",
      cause: "No white cat is visible on the sofa.",
      type: "Made-up details",
    },
  ],

  "two-women-shopping-logo": [
    {
      hallucinatedLine:
        "The shirt has a black three-stripe logo on the chest, showing that it is from Adidas.",
      accurateLine:
        "The shirt has a logo with four black diagonal stripes on the chest, not the Adidas three-stripe logo.",
      cause:
        "The logo actually has four black diagonal stripes, not the Adidas three-stripe logo.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "She is wearing a green button-up shirt with the sleeves rolled up.",
      accurateLine:
        "She is wearing a pale blue button-up shirt with the sleeves rolled up.",
      cause: "The shirt is pale blue, not green.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "A small price tag that says $49.99 hangs from the shirt.",
      accurateLine: "No clear price tag is visible on the shirt in the photo.",
      cause: "No price tag is visible on the shirt.",
      type: "Made-up details",
    },
  ],

  "woman-cat": [
    {
      hallucinatedLine:
        "In her hands, she holds a blue bowl with paw prints and tilts it toward the cat.",
      accurateLine:
        "In her hands, she holds a blue bowl and tilts it toward the cat.",
      cause: "The bowl is blue, but paw prints are not clearly visible on it.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "A stack of colorful magazines sits neatly on the table next to the cat.",
      accurateLine:
        "There are no colorful magazines visible on the table next to the cat.",
      cause: "There are no magazines next to the cat.",
      type: "Made-up details",
    },
    {
      hallucinatedLine:
        "The cat’s raised paws clearly show that it is begging for food because the bowl is empty.",
      accurateLine:
        "The cat’s raised paws are lifted high, but the image does not clearly show that it is begging because the bowl is empty.",
      cause:
        "The description guesses that the cat is begging because the bowl is empty, but the image does not prove that.",
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
        "The description guesses that the logo is Adidas, but the logo is not clearly the Adidas logo.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "He wears a white T-shirt underneath and dark jeans while holding a small brown-and-white golden retriever dog.",
      accurateLine:
        "He wears a white T-shirt underneath and dark jeans while holding a small brown-and-white terrier-type dog.",
      cause:
        "The dog looks like a small terrier-type dog, not a golden retriever.",
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
        "A group of six people is gathered outside on a sunny day for a picnic.",
      accurateLine:
        "A group of five people is gathered outside on a sunny day for a picnic.",
      cause: "There are five people in the photo, not six.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "He is wearing light blue jeans and sneakers with a Nike logo.",
      accurateLine:
        "He is wearing light blue jeans and sneakers with a logo that has two stripes, not a Nike logo.",
      cause: "The shoe logo has two stripes, so it is not clearly a Nike logo.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "There is also a large chocolate cake beside the watermelon.",
      accurateLine:
        "There is no large chocolate cake visible beside the watermelon.",
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
        "The deer, on the right side of the photo, stands on all four legs with its head lowered slightly to take food from the woman’s hand.",
      accurateLine:
        "The deer, on the right side of the photo, appears to have five visible legs.",
      cause: "The deer appears to have five visible legs.",
      type: "Mixed-up facts",
    },
    {
      hallucinatedLine:
        "A yellow ear tag is visible on one of its ears, suggesting that the deer is female.",
      accurateLine: "A yellow ear tag is visible on one of its ears.",
      cause:
        "The yellow ear tag does not prove that the deer is female. Tag colors can mean different things in different places.",
      type: "Wrong guess",
    },
  ],

  "mountain-woman-man-flag": [
    {
      hallucinatedLine:
        "One man in the right foreground stands out in a white T-shirt printed with an American flag.",
      accurateLine:
        "One man in the right foreground wears a white T-shirt with a flag-like print that has a blue block and stripes, but it is not clearly the American flag.",
      cause:
        "The shirt shows 11 stripes and a solid blue block, which is not the American flag. A similar pattern can also appear on Liberia’s flag.",
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
      hallucinatedLine:
        "Another visitor is taking a focused photo of the ranger.",
      accurateLine: "Another visitor is taking a photo of another visitor.",
      cause:
        "The visitor is taking a photo of another visitor, not the ranger.",
      type: "Mixed-up facts",
    },
  ],
};
