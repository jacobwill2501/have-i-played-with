describe("Search Form", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders the homepage with title and form", () => {
    cy.contains("Have I Played With?").should("be.visible");
    cy.contains("Played With?").should("be.visible");
    cy.contains("Common Players").should("be.visible");
    cy.get('input[placeholder="Faker"]').should("exist");
    cy.get('input[placeholder="NA1"]').should("exist");
    cy.get('input[placeholder="Hide on bush"]').should("exist");
    cy.get('input[placeholder="NA1"]').last().should("exist");
  });

  it("disables search button when form is incomplete", () => {
    cy.contains("button", "Search").should("be.disabled");
  });

  it("enables search button when both Riot IDs are filled", () => {
    cy.get('input[placeholder="Faker"]').type("Player1");
    cy.get('input[placeholder="NA1"]').type("NA1");
    cy.get('input[placeholder="Hide on bush"]').type("Player2");
    cy.get('input[placeholder="NA1"]').last().type("NA1");
    cy.contains("button", "Search").should("not.be.disabled");
  });

  it("keeps search button disabled with partial input", () => {
    cy.get('input[placeholder="Faker"]').type("Player1");
    // Missing tag
    cy.contains("button", "Search").should("be.disabled");
  });

  it("allows selecting region from dropdown", () => {
    cy.get("#region-label").should("exist");
    cy.get('[role="combobox"]').click();
    cy.get('[role="option"]').contains("EUW").click();
    cy.get('[role="combobox"]').should("contain", "EUW");
  });

  it("allows toggling search depth", () => {
    cy.contains("Current Season").should("have.attr", "aria-pressed", "true");
    cy.contains("Last Year").click();
    cy.contains("Last Year").should("have.attr", "aria-pressed", "true");
    cy.contains("Current Season").should("have.attr", "aria-pressed", "false");
  });

  it("shows tooltip on search depth info icon", () => {
    cy.get('[data-testid="InfoOutlinedIcon"]').trigger("mouseenter");
    cy.contains("Searching further back requires more time").should(
      "be.visible"
    );
  });
});

describe("Common Players Tab", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.contains("Common Players").click();
  });

  it("switches to common players mode", () => {
    cy.contains("Finds players you've played with 3+ times").should(
      "be.visible"
    );
    // Only the player inputs, no target inputs
    cy.get('input[placeholder="Faker"]').should("exist");
    cy.get('input[placeholder="NA1"]').should("exist");
    cy.get('input[placeholder="Hide on bush"]').should("not.exist");
    cy.get('input[placeholder="NA1"]').last().should("not.exist");
  });

  it("enables search with only player name and tag", () => {
    cy.get('input[placeholder="Faker"]').type("Player1");
    cy.get('input[placeholder="NA1"]').type("NA1");
    cy.contains("button", "Find Common Players").should("not.be.disabled");
  });
});
