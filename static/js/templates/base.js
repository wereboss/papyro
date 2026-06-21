// Base Worksheet Template Class

export class BaseTemplate {
  constructor(id, name, defaultConfig) {
    this.id = id;
    this.name = name;
    this.defaultConfig = defaultConfig;
  }

  // Merge default settings with worksheet overrides
  resolveConfig(customConfig) {
    // Perform a shallow merge of config objects.
    // If arrays or deep structures are used, templates should handle custom merging.
    return { ...this.defaultConfig, ...customConfig };
  }

  // Create random inputs and puzzle challenges based on resolved options
  generateState(resolvedConfig) {
    throw new Error("generateState() must be implemented by subclass");
  }

  // Render configuration elements in the left sidebar panel
  renderOptions(container, customConfig, onChange) {
    throw new Error("renderOptions() must be implemented by subclass");
  }

  // Render physical A4 worksheet preview inside the paper target
  render(container, state, resolvedConfig, options = { interactive: false }) {
    throw new Error("render() must be implemented by subclass");
  }

  // Evaluate interactive answers entered by children and return score/results
  validateAnswers(container, state, resolvedConfig) {
    throw new Error("validateAnswers() must be implemented by subclass");
  }

  // Common worksheet header helper
  renderHeader(title, subtitle, orientation = "portrait") {
    return `
      <div class="sheet-header">
        <div class="sheet-title-row">
          <div>
            <div class="sheet-title">${title}</div>
            <div class="sheet-subtitle">${subtitle || ""}</div>
          </div>
        </div>
        <div class="sheet-student-info">
          <div class="info-name">Name: <span></span></div>
          <div class="info-date">Date: <span></span></div>
        </div>
      </div>
    `;
  }
}
