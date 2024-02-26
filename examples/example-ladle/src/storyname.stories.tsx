export const Cat = () => {
  const Stop = { storyName: '' };
  // should be ignored
  Stop.storyName = 'What';
  return <h1>Cat</h1>;
};

Cat.storyName = 'Doggo';
Cat.foo = 'Ha';

export const CapitalCity = () => {
  return <h1>DC</h1>;
};

export const CapitalReplaced = () => {
  return <h1>CapitalReplaced</h1>;
};
CapitalReplaced.storyName = 'Champs Élysées';

export const DisabledStory = () => {
  return <h1>DisabledStory</h1>;
};
DisabledStory.storyName = 'DisabledStory';
DisabledStory.meta = {
  lostpixel: {
    disable: true,
  },
};
