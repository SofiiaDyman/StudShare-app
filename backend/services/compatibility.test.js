const { compatibility } = require("./compatibility");

describe("compatibility", () => {
  test("повертає 100 для повністю однакової анкети", () => {
    const profile = {
      sleep: 3,
      cleanliness: 4,
      noise: 2,
      smoking: 1,
      budget_min: 3000,
      budget_max: 6000,
    };

    expect(compatibility(profile, { ...profile })).toBe(100);
  });

  test("повертає 0 для протилежних анкетних показників", () => {
    const a = {
      sleep: 1,
      cleanliness: 1,
      noise: 1,
      smoking: 1,
      budget_min: 3000,
      budget_max: 5000,
    };
    const b = {
      sleep: 5,
      cleanliness: 5,
      noise: 5,
      smoking: 3,
      budget_min: 7000,
      budget_max: 9000,
    };

    expect(compatibility(a, b)).toBe(0);
  });

  test("анкетні бали округлюються до відсотків", () => {
    const a = {
      sleep: 4,
      cleanliness: 3,
      noise: 2,
      smoking: 1,
      budget_min: 3000,
      budget_max: 5000,
    };
    const b = {
      sleep: 5,
      cleanliness: 5,
      noise: 2,
      smoking: 1,
      budget_min: 4000,
      budget_max: 6000,
    };

    expect(compatibility(a, b)).toBe(85);
  });

  test("бюджети з перетином дають повний анкетний бал", () => {
    const a = { budget_min: 3000, budget_max: 5000 };
    const b = { budget_min: 4000, budget_max: 6000 };

    expect(compatibility(a, b)).toBe(100);
  });

  test("розрив бюджету 1000 грн знімає 50 відсоткових пунктів", () => {
    const a = { budget_min: 3000, budget_max: 4000 };
    const b = { budget_min: 5000, budget_max: 7000 };

    expect(compatibility(a, b)).toBe(50);
  });

  test("повертає null, якщо немає анкетних або текстових даних", () => {
    expect(compatibility({}, {})).toBeNull();
    expect(compatibility(null, null)).toBeNull();
  });

  test("однакові вектори дають текстову сумісність 100", () => {
    const a = { bio_embedding: "[1, 0, 1]" };
    const b = { bio_embedding: [1, 0, 1] };

    expect(compatibility(a, b)).toBe(100);
  });

  test("комбінує анкету 60% і текст 40%", () => {
    const a = {
      sleep: 4,
      cleanliness: 3,
      noise: 2,
      smoking: 1,
      budget_min: 3000,
      budget_max: 5000,
      bio_embedding: [1, 0],
    };
    const b = {
      sleep: 5,
      cleanliness: 5,
      noise: 2,
      smoking: 1,
      budget_min: 4000,
      budget_max: 6000,
      bio_embedding: [1, 0.7265],
    };

    // Q = 0.85, косинус другого вектора дорівнює приблизно 0.808
    // очікуване підсумкове округлене значення стабільно 83
    expect(compatibility(a, b)).toBe(83);
  });

  test("протилежні текстові вектори обмежуються нулем", () => {
    const a = { bio_embedding: [1, 0] };
    const b = { bio_embedding: [-1, 0] };

    expect(compatibility(a, b)).toBe(0);
  });

  test("ігнорує текстові вектори різної довжини", () => {
    const a = { sleep: 3, bio_embedding: [1, 0] };
    const b = { sleep: 3, bio_embedding: [1, 0, 0] };

    expect(compatibility(a, b)).toBe(100);
  });
});
