import { getChanges } from './diff';

describe(getChanges, () => {
  it('should reflect no difference', () => {
    expect(
      getChanges({
        reference: ['a.png', 'b.png'],
        current: ['a.png', 'b.png'],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [],
    });

    expect(
      getChanges({
        reference: ['a.png', 'b.png'],
        current: ['b.png', 'a.png'],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: [],
    });
  });

  it('should highlight added files', () => {
    expect(
      getChanges({
        reference: ['a.png', 'b.png'],
        current: ['a.png', 'b.png', 'd.png', 'c.png'],
        difference: [],
      }),
    ).toEqual({
      difference: [],
      deletion: [],
      addition: ['c.png', 'd.png'],
    });
  });
});
