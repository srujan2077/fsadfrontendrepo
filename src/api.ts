const API_BASE_URL = "http://localhost:8080/api/v1/network";

export const networkAPI = {
  fetchNodes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/nodes`);
      return await response.json();
    } catch (err) {
      console.error("Backend offline:", err);
      return [];
    }
  },

  deployNode: async (nodeData: any) => {
    const response = await fetch(`${API_BASE_URL}/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nodeData),
    });
    return await response.json();
  },

  revokeNode: async (id: number) => {
    await fetch(`${API_BASE_URL}/revoke/${id}`, { method: "DELETE" });
  }
};