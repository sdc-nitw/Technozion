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
