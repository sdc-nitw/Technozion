import { getChargeableGateMembers, groupRegistrationEvents } from './feeUtils';

describe('getChargeableGateMembers', () => {
  it('charges only non-NITW team members in a full four-person team', () => {
    expect(getChargeableGateMembers({
      isNitwLead: true,
      members: [
        { name: 'A', studentType: 'external' },
        { name: 'B', studentType: 'nitw' },
        { name: 'C', studentType: 'external' },
      ],
      teamSize: 4,
    })).toBe(2);
  });

  it('charges all external members when the lead is external', () => {
    expect(getChargeableGateMembers({
      isNitwLead: false,
      members: [
        { name: 'A', studentType: 'nitw' },
        { name: 'B', studentType: 'external' },
        { name: 'C', studentType: 'external' },
      ],
      teamSize: 4,
    })).toBe(3);
  });

  it('counts a full four-person non-NITW team as four chargeable members', () => {
    expect(getChargeableGateMembers({
      isNitwLead: false,
      members: [
        { name: 'A', studentType: 'external' },
        { name: 'B', studentType: 'OTHER' },
        { name: 'C', studentType: 'external' },
      ],
      teamSize: 4,
    })).toBe(4);
  });

  it('ignores blank member slots', () => {
    expect(getChargeableGateMembers({
      isNitwLead: true,
      members: [
        { name: '', studentType: 'external' },
        { name: 'B', studentType: 'nitw' },
        { name: '', studentType: 'external' },
      ],
      teamSize: 4,
    })).toBe(0);
  });

  it.each([
    {
      label: 'all NITW team with NITW lead should pay 0',
      input: {
        isNitwLead: true,
        members: [
          { name: 'A', studentType: 'nitw' },
          { name: 'B', studentType: 'nitw' },
          { name: 'C', studentType: 'nitw' },
        ],
        teamSize: 4,
      },
      expected: 0,
    },
    {
      label: 'mixed team with one external member should pay 1',
      input: {
        isNitwLead: true,
        members: [
          { name: 'A', studentType: 'external' },
          { name: 'B', studentType: 'nitw' },
          { name: 'C', studentType: 'nitw' },
        ],
        teamSize: 4,
      },
      expected: 1,
    },
    {
      label: 'mixed team with 2 external members should pay 2',
      input: {
        isNitwLead: true,
        members: [
          { name: 'A', studentType: 'external' },
          { name: 'B', studentType: 'nitw' },
          { name: 'C', studentType: 'external' },
        ],
        teamSize: 4,
      },
      expected: 2,
    },
    {
      label: 'non-NITW lead plus 3 external teammates should pay 4',
      input: {
        isNitwLead: false,
        members: [
          { name: 'A', studentType: 'external' },
          { name: 'B', studentType: 'external' },
          { name: 'C', studentType: 'external' },
        ],
        teamSize: 4,
      },
      expected: 4,
    },
    {
      label: 'mixed-case external variants should still count as external',
      input: {
        isNitwLead: false,
        members: [
          { name: 'A', studentType: 'OTHER' },
          { name: 'B', studentType: 'non-nitw' },
          { name: 'C', studentType: 'EXTERNAL' },
        ],
        teamSize: 4,
      },
      expected: 4,
    },
    {
      label: 'blank names and null members should be ignored',
      input: {
        isNitwLead: true,
        members: [
          { name: '', studentType: 'external' },
          null,
          undefined,
          { name: 'B', studentType: 'nitw' },
          { name: 'C', studentType: 'external' },
        ],
        teamSize: 4,
      },
      expected: 1,
    },
    {
      label: 'team-size cap should limit total chargeable members',
      input: {
        isNitwLead: false,
        members: [
          { name: 'A', studentType: 'external' },
          { name: 'B', studentType: 'external' },
          { name: 'C', studentType: 'external' },
          { name: 'D', studentType: 'external' },
          { name: 'E', studentType: 'external' },
        ],
        teamSize: 4,
      },
      expected: 4,
    },
    {
      label: 'invalid studentType should default to external',
      input: {
        isNitwLead: true,
        members: [
          { name: 'A', studentType: 'unknown' },
          { name: 'B', studentType: 'nitw' },
        ],
        teamSize: 4,
      },
      expected: 1,
    },
  ])('returns the correct fee count for $label', ({ input, expected }) => {
    expect(getChargeableGateMembers(input)).toBe(expected);
  });
});

describe('groupRegistrationEvents', () => {
  it('separates competitions and games into their own groups', () => {
    const groups = groupRegistrationEvents([
      { name: 'Hackathon', eventType: 'Competition' },
      { name: 'Quiz', eventType: 'Game' },
      { name: 'Drone Demo', eventType: 'Demonstration' },
    ]);

    expect(groups.map((group) => group.key)).toEqual(['competitions', 'games', 'other']);
    expect(groups[0].events.map((event) => event.name)).toEqual(['Hackathon']);
    expect(groups[1].events.map((event) => event.name)).toEqual(['Quiz']);
    expect(groups[2].events.map((event) => event.name)).toEqual(['Drone Demo']);
  });
});
