class TextStore {
  constructor() {
    this.store = {}; // Stores text by a unique identifier, such as filename or upload ID
  }

  saveText(id, text) {
    console.log(`Saving text for ID: ${id}`); // Log when text is saved
    this.store[id] = text;
  }

  getText(id) {
    console.log(`Retrieving text for ID: ${id}`); // Log when text is retrieved
    return this.store[id] || null; // Ensure it returns null if the text is not found
  }
}

module.exports = new TextStore(); // Export as a singleton for accessibility across the application
