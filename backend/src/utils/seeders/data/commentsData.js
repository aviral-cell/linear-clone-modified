export function getCommentsData(issues, users) {
  return [
    {
      issue: issues['DES-1'],
      user: users[0]._id,
      content:
        'I started with the button and input components. The spacing tokens from Figma need to be translated into Tailwind config values.',
    },
    {
      issue: issues['DES-1'],
      user: users[3]._id,
      content:
        'The color tokens are ready. I exported them as CSS variables so we can reference them across all components consistently.',
    },
    {
      issue: issues['DES-1'],
      user: users[0]._id,
      content:
        'Nice. Can we also add hover and focus states for each variant? The current Figma file only shows default states.',
    },
    {
      issue: issues['DES-1'],
      user: users[4]._id,
      content:
        'I added the interaction states to the Figma file. Each component now has default, hover, focus, and disabled variants.',
    },
    {
      issue: issues['DES-1'],
      user: users[3]._id,
      content: 'Looks great. Lets do a quick review pass before handing off to engineering.',
    },
    {
      issue: issues['DES-5'],
      user: users[0]._id,
      content:
        'Before we start building, should we decide on Storybook vs a custom docs site for the component library?',
    },
    {
      issue: issues['DES-5'],
      user: users[3]._id,
      content:
        'Storybook would be faster to set up and the team is already familiar with it. We can always migrate later.',
    },
    {
      issue: issues['DES-5'],
      user: users[4]._id,
      content:
        'Agreed. We should also define the folder structure early. I suggest grouping by category: primitives, forms, layout, and feedback.',
    },
    {
      issue: issues['DES-5'],
      user: users[0]._id,
      content:
        'That grouping works well. I will draft the initial folder structure and share it for review.',
    },
    {
      issue: issues['DES-14'],
      user: users[0]._id,
      content:
        'The current type scale feels inconsistent between headings and body text. We should adopt a modular scale ratio.',
    },
    {
      issue: issues['DES-14'],
      user: users[3]._id,
      content:
        'A 1.25 ratio (Major Third) would work well for our use case. It keeps headings distinct without being too dramatic.',
    },
    {
      issue: issues['DES-14'],
      user: users[0]._id,
      content:
        'Good call. We should also evaluate Inter vs the current font. Inter has better readability at small sizes.',
    },
  ];
}
