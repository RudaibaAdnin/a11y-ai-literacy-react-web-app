export const imageHallucinations = {
  "blind-man-walking": [
    {
      hallucinatedLine:
        "The picture shows a man walking in the park with a guide dog.",
      accurateLine: "The picture shows a man walking in the park with a dog.",
      cause:
        "Assumes the dog is a guide dog but there is no harness to be a guide dog.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "The man is holding a white cane in his left hand and the dog leash in his right hand.",
      accurateLine:
        "The man is holding a white cane in his right hand and the dog leash in his left hand.",
      cause:
        "The man is holding a white cane in his right hand and the dog leash in his left hand.",
      type: "Mixing up the facts",
    },
    {
      hallucinatedLine:
        "There is a small bridge over a stream with two persons crossing it.",
      accurateLine: "There is a small bridge over a stream in the background.",
      cause: "No person is visible in the image",
      type: "Making things up",
    },
  ],

  "cristmas-tree": [
    {
      hallucinatedLine: "At the very top, a golden star topper shines.",
      accurateLine:
        "At the very top, an angel tree topper is placed, glowing faintly from the surrounding lights.",
      cause:
        "At the very top, an angel tree topper is placed, glowing faintly from the surrounding lights",
      type: "Mixing up the facts",
    },
    {
      hallucinatedLine:
        "Numerous gifts shows there must be a large family living here because so many gifts are piled beneath it.",
      accurateLine:
        "There are many gifts piled beneath the tree, but the image does not show who they are for.",
      cause:
        "Numerous gifts show there must be a large family living but there is no evidence for it.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "A white cat rests calmly on the sofa, blending into the festive scene.",
      accurateLine:
        "On the right side of the room, there is a dark leather sofa with a red throw blanket and pillows.",
      cause: "No white cat is visible.",
      type: "Making things up",
    },
  ],

  "two-women-shopping-logo": [
    {
      hallucinatedLine:
        "The shirt features a black three stripes logo on the chest, indicating it is from the Adidas brand.",
      accurateLine:
        "The shirt features a logo with four black diagonal stripes on the chest (not the Adidas three-stripe logo).",
      cause:
        "The shirt’s logo actually has four black diagonal stripes, which is not true for Adidas logo.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "She is wearing a green button-up shirt with the sleeves rolled up.",
      accurateLine:
        "She is wearing a pale blue button-up shirt with the sleeves rolled up.",
      cause:
        "She is wearing a pale blue button-up shirt with the sleeves rolled up.",
      type: "Mixing up the facts",
    },
    {
      hallucinatedLine:
        "A small price tag that says $49.99 dangles from the shirt.",
      accurateLine: "No clear price tag is visible on the shirt in the photo.",
      cause: "No price tag is visible in the photo.",
      type: "Making things up",
    },
  ],

  "woman-cat": [
    {
      hallucinatedLine:
        "In her hands, she holds a blue bowl decorated with paw prints, tilted toward the cat.",
      accurateLine:
        "In her hands, she holds a blue bowl tilted toward the cat.",
      cause: "Blue bowl becomes blue bowl with paw prints.",
      type: "Mixing up the facts",
    },
    {
      hallucinatedLine:
        "A stack of colorful magazines sits neatly on the table next to the cat.",
      accurateLine:
        "There are no colorful magazines visible on the table next to the cat.",
      cause: "There is no magazine next to the cat.",
      type: "Making things up",
    },
    {
      hallucinatedLine:
        "The cat’s raised paws are described as a clear sign of begging for food because the bowl is empty.",
      accurateLine:
        "The cat’s raised paws are lifted high, but the image does not clearly show that it’s begging because the bowl is empty.",
      cause:
        "The cat’s raised paws are explained as begging because the bowl is empty.",
      type: "Wrong guess",
    },
  ],

  "family-picnic": [
    {
      hallucinatedLine:
        "At the center, a man in a gray button-up shirt with an Adidas black logo leans forward.",
      accurateLine:
        "At the center, a man in a gray button-up shirt leans forward.",
      cause:
        "The shirt’s logo actually has four black diagonal stripes, which is not true for Adidas logo.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "He wears a white T-shirt underneath and dark jeans while holding a small brown-and-white golden retriever dog.",
      accurateLine:
        "He wears a white T-shirt underneath and dark jeans while holding a small brown-and-white terrier-type dog.",
      cause:
        "The dog in the image appears to be a small terrier-type breed, but it said golden retriever.",
      type: "Mixing up the facts",
    },
    {
      hallucinatedLine: "He is wearing a baseball cap.",
      accurateLine: "He is not wearing a cap.",
      cause: "The boy is not wearing any cap.",
      type: "Making things up",
    },
  ],

  "friend-group-picnic": [
    {
      hallucinatedLine:
        "A group of six people is gathered outdoors on a sunny day for a picnic.",
      accurateLine:
        "A group of five people is gathered outdoors on a sunny day for a picnic.",
      cause: "There are 5 people in the photo.",
      type: "Mixing up the facts",
    },
    {
      hallucinatedLine:
        "He is wearing light blue jeans and sneakers that has a Nike logo.",
      accurateLine:
        "He is wearing light blue jeans and sneakers with a logo that has two stripes (not a Nike logo).",
      cause:
        "Assuming Nike logo whereas the logo in the picture has two stripes.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "There is also a large chocolate cake appearing beside the watermelon.",
      accurateLine:
        "There is no large chocolate cake visible beside the watermelon.",
      cause: "There is no cake beside the watermelon.",
      type: "Making things up",
    },
  ],

  "man-woman-give-food-deer": [
    {
      hallucinatedLine: "She is holding a bright red apple in her other hand.",
      accurateLine: "No red apple is clearly visible in her other hand.",
      cause: "No apple is visible in the photo.",
      type: "Making things up",
    },
    {
      hallucinatedLine:
        "The deer, positioned to the right side of the photo, is standing on all four legs with its head lowered slightly to take food from the woman’s hand.",
      accurateLine:
        "The deer, positioned to the right side of the photo, appears to have five legs visible.",
      cause: "The deer has five legs.",
      type: "Mixing up the facts",
    },
    {
      hallucinatedLine:
        "A yellow ear tag is visible on one of its ears, suggesting that the deer is female.",
      accurateLine: "A yellow ear tag is visible on one of its ears.",
      cause:
        "This is not true because tag colors are management-specific and don’t indicate sex.",
      type: "Wrong guess",
    },
  ],

  "mountain-woman-man-flag": [
    {
      hallucinatedLine:
        "One man in the right foreground stands out in a white T-shirt printed with an American flag.",
      accurateLine:
        "One man in the right foreground stands out in a white T-shirt with a flag-like print (blue block and stripes), but it is not clearly identifiable as the American flag.",
      cause:
        "The shirt clearly shows 11 stripes and solid blue, which is not american flag. Same pattern is also available for Liberia’s flag.",
      type: "Wrong guess",
    },
    {
      hallucinatedLine:
        "A picnic table is visible on the left side of the ranger.",
      accurateLine:
        "No picnic table is visible on the left side of the ranger.",
      cause: "No such table is visible.",
      type: "Making things up",
    },
    {
      hallucinatedLine:
        "Another visitor is photographing the ranger, focusing intently on capturing the moment.",
      accurateLine: "Another visitor is photographing another visitor.",
      cause: "Another visitor is photographing another visitor",
      type: "Mixing up the facts",
    },
  ],
};
