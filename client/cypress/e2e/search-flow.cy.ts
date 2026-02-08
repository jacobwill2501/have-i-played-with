function fillSearchForm() {
  cy.get('input[placeholder="Faker"]').type("Player1");
  cy.get('input[placeholder="NA1"]').type("NA1");
  cy.get('input[placeholder="Hide on bush"]').type("Player2");
  cy.get('input[placeholder="NA1"]').last().type("NA1");
}

describe("Search Flow with SSE", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("shows progress bar when search starts", () => {
    cy.intercept("GET", "/api/search*", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: [
          "event: progress\ndata: {\"searched\":50,\"total\":100,\"percent\":50}\n\n",
          "event: done\ndata: {\"totalMatches\":0,\"totalSearched\":100}\n\n",
        ].join(""),
      });
    }).as("searchRequest");

    fillSearchForm();
    cy.contains("button", "Search").click();
    cy.contains("Searching").should("be.visible");
  });

  it("shows cancel button during search and hides it after", () => {
    cy.intercept("GET", "/api/search*", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: [
          "event: progress\ndata: {\"searched\":50,\"total\":100,\"percent\":50}\n\n",
          "event: done\ndata: {\"totalMatches\":0,\"totalSearched\":100}\n\n",
        ].join(""),
      });
    });

    fillSearchForm();
    cy.contains("button", "Search").click();
    // After search completes, cancel should disappear
    cy.contains("No shared games found").should("be.visible");
    cy.contains("button", "Cancel").should("not.exist");
  });

  it("shows no results message when no matches found", () => {
    cy.intercept("GET", "/api/search*", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: [
          "event: progress\ndata: {\"searched\":1,\"total\":1,\"percent\":100}\n\n",
          "event: done\ndata: {\"totalMatches\":0,\"totalSearched\":1}\n\n",
        ].join(""),
      });
    });

    fillSearchForm();
    cy.contains("button", "Search").click();
    cy.contains("No shared games found").should("be.visible");
  });

  it("displays match results when games are found", () => {
    const mockMatch = {
      matchId: "NA1_12345",
      gameCreation: Date.now(),
      gameDuration: 1800,
      queueType: "Solo/Duo",
      playerPuuid: "puuid-1",
      targetPuuid: "puuid-2",
      participants: [
        {
          puuid: "puuid-1",
          summonerName: "Player1",
          riotIdGameName: "Player1",
          riotIdTagline: "NA1",
          championName: "Jinx",
          championId: 222,
          teamId: 100,
          win: true,
          kills: 10,
          deaths: 2,
          assists: 8,
          totalMinionsKilled: 200,
          neutralMinionsKilled: 20,
          goldEarned: 15000,
          totalDamageDealtToChampions: 30000,
          wardsPlaced: 10,
          wardsKilled: 3,
          visionScore: 25,
          champLevel: 18,
          item0: 3031,
          item1: 3006,
          item2: 3094,
          item3: 3036,
          item4: 3072,
          item5: 0,
          item6: 3340,
          summoner1Id: 4,
          summoner2Id: 7,
        },
        {
          puuid: "puuid-2",
          summonerName: "Player2",
          riotIdGameName: "Player2",
          riotIdTagline: "NA1",
          championName: "Thresh",
          championId: 412,
          teamId: 100,
          win: true,
          kills: 2,
          deaths: 5,
          assists: 20,
          totalMinionsKilled: 30,
          neutralMinionsKilled: 0,
          goldEarned: 10000,
          totalDamageDealtToChampions: 12000,
          wardsPlaced: 40,
          wardsKilled: 10,
          visionScore: 60,
          champLevel: 15,
          item0: 3190,
          item1: 3109,
          item2: 3107,
          item3: 0,
          item4: 0,
          item5: 0,
          item6: 3364,
          summoner1Id: 4,
          summoner2Id: 3,
        },
      ],
    };

    cy.intercept("GET", "/api/search*", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: [
          `event: match\ndata: ${JSON.stringify(mockMatch)}\n\n`,
          "event: progress\ndata: {\"searched\":1,\"total\":1,\"percent\":100}\n\n",
          "event: done\ndata: {\"totalMatches\":1,\"totalSearched\":1}\n\n",
        ].join(""),
      });
    });

    fillSearchForm();
    cy.contains("button", "Search").click();

    cy.contains("Games Played Together (1)").should("be.visible");
    cy.contains("WIN").should("be.visible");
    cy.contains("Player1").should("be.visible");
    cy.contains("Player2").should("be.visible");
    cy.contains("Same Team").should("be.visible");
  });

  it("shows error state on API error", () => {
    cy.intercept("GET", "/api/search*", (req) => {
      req.reply({
        statusCode: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: 'event: error\ndata: {"message":"Riot API 403: Forbidden"}\n\n',
      });
    });

    fillSearchForm();
    cy.contains("button", "Search").click();
    cy.contains("Riot API 403: Forbidden").should("be.visible");
  });
});
