// ============================================================
// Card Wars — Game Logic & API Integration
// ============================================================
// This script powers the "Card Wars" browser game, where a
// player competes against the computer by drawing cards from a
// shuffled deck. It uses the Deck of Cards API
// (https://deckofcardsapi.com/) to create, shuffle, and draw
// cards. Each round, both sides draw one card and the higher
// value wins a point. Scores are tracked and displayed live.
// ============================================================

// ----- Global State Variables -----

// Stores the unique deck identifier returned by the Deck of Cards API.
// This ID is used in subsequent API calls to draw cards from the same deck.
let deckId = "";

// Tracks the player's cumulative score across all rounds.
let playerScore = 0;

// Tracks the computer's cumulative score across all rounds.
let computerScore = 0;

// ----- Deck Initialization (API Call) -----
// On page load, request a brand-new shuffled deck (1 standard 52-card deck)
// from the Deck of Cards API. The returned deck_id is saved so we can
// draw cards from this specific deck throughout the game session.
fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
  .then((res) => res.json())
  .then((data) => {
    // Persist the deck ID for use in the drawCards() function
    deckId = data.deck_id;
  });

// ----- Card Value Mapping -----
// The API returns face-card values as strings (e.g. "ACE", "KING").
// This lookup table maps those strings to numeric values so we can
// compare cards numerically. Number cards (2-10) are parsed directly
// with parseInt in getCardValue(). Ace is the highest value (14).
const valueMap = {
  ACE: 14,
  KING: 13,
  QUEEN: 12,
  JACK: 11,
};

// ----- Helper: Convert Card Value to a Comparable Number -----
// Accepts the card's `value` string from the API response.
// If the value is a face card (ACE, KING, QUEEN, JACK), returns
// the mapped numeric value from valueMap. Otherwise, parses the
// string as an integer (handles number cards like "2" through "10").
function getCardValue(value) {
  return valueMap[value] || parseInt(value);
}

// ----- Core Game Function: Draw Cards (API Call + Round Logic) -----
// Called when the player clicks the "Draw Cards" button.
// 1. Draws 2 cards from the deck via the API (one for the player, one for the computer).
// 2. Displays both card images in the UI.
// 3. Compares their numeric values to determine the round winner.
// 4. Updates scores and displays the round result message.
function drawCards() {
  // API call: draw 2 cards from the current deck using the stored deckId
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
    .then((res) => res.json())
    .then((data) => {
      // The first drawn card is assigned to the player
      const playerCard = data.cards[0];
      // The second drawn card is assigned to the computer
      const computerCard = data.cards[1];

      // Get references to the <img> elements that display each card
      const playerImg = document.getElementById("player-card");
      const computerImg = document.getElementById("computer-card");

      // Update card images in the DOM with the drawn card images from the API
      playerImg.src = playerCard.image;
      computerImg.src = computerCard.image;

      // Wait for both card images to fully load before determining the winner.
      // This ensures the player sees both cards on screen before the result
      // text updates, providing a better visual experience.
      Promise.all([
        new Promise((resolve) => (playerImg.onload = resolve)),
        new Promise((resolve) => (computerImg.onload = resolve)),
      ]).then(() => {
        // Convert both card values from strings to comparable numbers
        const playerVal = getCardValue(playerCard.value);
        const computerVal = getCardValue(computerCard.value);

        // Reference to the result text element that shows the round outcome
        const resultText = document.getElementById("result-text");

        // ----- Round Comparison Logic -----
        // Compare the two card values and award a point to the winner.
        // In case of a tie, no points are awarded.
        if (playerVal > computerVal) {
          playerScore += 1;
          resultText.textContent = "You Win This Round 🎉";
        } else if (playerVal < computerVal) {
          computerScore += 1;
          resultText.textContent = "Computer Wins This Round😔";
        } else {
          resultText.textContent = "It's a tie! No Points Awarded";
        }

        // Update the scoreboard in the DOM to reflect the latest scores
        document.getElementById("player-score").textContent = playerScore;
        document.getElementById("computer-score").textContent = computerScore;
      });
    });
}
