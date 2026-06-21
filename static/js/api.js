// Papyro API Client

const API_BASE = "/api";

export const API = {
  // Fetch all worksheet templates
  async getTemplates() {
    try {
      const res = await fetch(`${API_BASE}/templates`);
      if (!res.ok) throw new Error("Failed to load templates");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // Fetch a single template's default configuration
  async getTemplate(id) {
    try {
      const res = await fetch(`${API_BASE}/templates/${id}`);
      if (!res.ok) throw new Error("Failed to load template");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // Fetch all saved worksheets
  async getSavedWorksheets() {
    try {
      const res = await fetch(`${API_BASE}/worksheets`);
      if (!res.ok) throw new Error("Failed to load saved worksheets");
      return await res.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // Fetch a single saved worksheet
  async getWorksheet(id) {
    try {
      const res = await fetch(`${API_BASE}/worksheets/${id}`);
      if (!res.ok) throw new Error("Failed to load worksheet");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // Save/bookmark a new worksheet configuration
  async saveWorksheet(title, templateId, customConfig, generatedState) {
    try {
      const res = await fetch(`${API_BASE}/worksheets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          template_id: templateId,
          custom_config: customConfig,
          generated_state: generatedState,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save worksheet");
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Delete a saved worksheet
  async deleteWorksheet(id) {
    try {
      const res = await fetch(`${API_BASE}/worksheets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete worksheet");
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
